import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
    getCurrentUserApi, getPlaylistsApi, getSongsApi, playSongApi, getLikedPlaylistApi, 
    addSongToPlaylistApi, removeSongFromPlaylistApi, updatePlaybackStateApi, getSongByIdApi,
    getMyPlaylistsApi
} from '../services/api_services';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';

const MusicContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || '';

// ───────────────────────────────────────────────
// Parser: LRC format -> [{time: seconds, text}]
// ───────────────────────────────────────────────
const parseLRC = (lrcString) => {
    if (!lrcString) return [];
    const lines = lrcString.split('\n');
    const result = [];
    for (const line of lines) {
        const match = line.match(/^\[(\d{2}):(\d{2})\.?(\d{0,3})\]\s*(.*)/);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
            const time = minutes * 60 + seconds + ms / 1000;
            const text = (match[4] || '').trim();
            if (text) result.push({ time, text });
        }
    }
    return result.sort((a, b) => a.time - b.time);
};

// ───────────────────────────────────────────────
// Fetch lyrics from lrclib.net
// ───────────────────────────────────────────────
const fetchLyrics = async (trackName, artistName, albumName, duration) => {
    if (!trackName) throw new Error('Không có tên bài hát');
    const params = new URLSearchParams();
    params.set('track_name', trackName);
    if (artistName) params.set('artist_name', artistName);
    if (albumName) params.set('album_name', albumName);

    const res = await fetch(`https://lrclib.net/api/search?${params.toString()}`);
    if (!res.ok) throw new Error('Không thể kết nối lrclib.net');

    const data = await res.json();
    if (!data || data.length === 0) throw new Error('Không tìm thấy lời bài hát');

    let best = data[0];
    if (duration && duration > 0) {
        best = data.reduce((prev, cur) => {
            const curHasSync = !!cur.syncedLyrics;
            const prevHasSync = !!prev.syncedLyrics;
            if (curHasSync && !prevHasSync) return cur;
            if (!curHasSync && prevHasSync) return prev;
            const prevDiff = Math.abs((prev.duration || 0) - duration);
            const curDiff = Math.abs((cur.duration || 0) - duration);
            return curDiff < prevDiff ? cur : prev;
        }, data[0]);
    }

    return {
        synced: best.syncedLyrics || null,
        plain: best.plainLyrics || null,
    };
};

export const MusicProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [suggestedQueue, setSuggestedQueue] = useState([]);
    const [pendingJamAction, setPendingJamAction] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [sourceInfo, setSourceInfo] = useState(null); // { type: 'playlist' | 'album' | 'search', id: string, name: string }
    const [likedSongIds, setLikedSongIds] = useState(new Set());
    const [likedPlaylistId, setLikedPlaylistId] = useState(null);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'all' | 'one'
    const [currentLyrics, setCurrentLyrics] = useState({ synced: [], plain: [], status: 'idle' });
    const [user, setUser] = useState(null);
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [isJamPanelOpen, setIsJamPanelOpen] = useState(false);
    const [isJamActive, setIsJamActive] = useState(false);
    
    // SignalR Jam State
    const [jamRoomId, setJamRoomId] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [jamParticipants, setJamParticipants] = useState([]);
    const [guestPermissions, setGuestPermissions] = useState(false);
    const hubConnectionRef = useRef(null);

    const [dominantColor, setDominantColor] = useState('#1a1a1a');
    const audioRef = useRef(new Audio());
    const preloadRef = useRef(new Audio()); // Audio element ẩn để pre-load bài tiếp theo
    const lastReportedSongIdRef = useRef(null); // Tránh report trùng một bài hát nhiều lần

    // Sync volume with local storage or default
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('buzzify_volume') || '0.7'));

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Giải quyết stale closure cho SignalR mà KHÔNG gây re-render HubConnection
    const roomStateRef = useRef({});
    useEffect(() => {
        roomStateRef.current = { currentSong, queue, suggestedQueue, isPlaying, sourceInfo };
    }, [currentSong, queue, suggestedQueue, isPlaying, sourceInfo]);

    // SignalR Initialization
    useEffect(() => {
        let isMounted = true;
        let connection = null;

        if (!isJamActive || !jamRoomId || !user) {
            if (hubConnectionRef.current) {
                hubConnectionRef.current.stop();
                hubConnectionRef.current = null;
            }
            return;
        }

        const connect = async () => {
            if (hubConnectionRef.current?.state === "Connected") return;

            connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_BASE}/hubs/jam`)
                .withAutomaticReconnect()
                .build();

            hubConnectionRef.current = connection;

            connection.on("GuestJoined", (guestName) => {
                toast.success(`${guestName} đã tham gia Jam!`);
            });

            connection.on("GuestLeft", (guestName) => {
                toast(`${guestName} đã rời Jam.`, { icon: '👋' });
            });

            connection.on("ParticipantsUpdated", (list) => {
                setJamParticipants(list || []);
            });

            connection.on("RoomClosed", (msg) => {
                toast.error(msg, { id: 'jam-toast' });
                endJamSession();
            });

            connection.on("RequireSync", (targetConnId) => {
                if (isHost) {
                    const s = roomStateRef.current;
                    const stateObj = { 
                        song: s.currentSong, 
                        queue: s.queue, 
                        suggestedQueue: s.suggestedQueue,
                        pos: audioRef.current.currentTime, 
                        source: s.sourceInfo,
                        isPlaying: s.isPlaying,
                        timestamp: Date.now()
                    };
                    connection.invoke("SyncStateToTarget", targetConnId, stateObj);
                }
            });

            connection.on("ReceiveSyncState", (stateData) => {
                if (!isHost && stateData) {
                    // Báo cáo lượt nghe trực tiếp cho Guest khi đồng bộ (để tính Real-time listeners)
                    if (stateData.song && lastReportedSongIdRef.current !== stateData.song.id) {
                        lastReportedSongIdRef.current = stateData.song.id;
                        playSongApi(stateData.song.id).catch(e => console.error("Error reporting jam play (sync):", e));
                    }

                    const isFullSync = !!stateData.queue; // FullSync = join phòng. Heartbeat chỉ có pos+song+isPlaying

                    // ===== FULL SYNC (khi join phòng / chuyển bài) =====
                    // → Cập nhật React state và seek audio
                    if (isFullSync) {
                        if (stateData.song) setCurrentSong(stateData.song);
                        if (stateData.queue) setQueue(stateData.queue);
                        if (stateData.suggestedQueue) setSuggestedQueue(stateData.suggestedQueue);
                        if (stateData.source) setSourceInfo(stateData.source);

                        // Bù độ trễ mạng cho full sync
                        let delay = 0;
                        if (stateData.timestamp) {
                            delay = (Date.now() - stateData.timestamp) / 1000;
                            if (delay < 0 || delay > 2) delay = 0.3;
                        }

                        if (stateData.song) {
                            const songUrl = stateData.song.url?.startsWith('http') ? stateData.song.url : `${API_BASE}${stateData.song.url}`;
                            audioRef.current.src = songUrl;
                            audioRef.current.currentTime = (stateData.pos || 0) + delay;
                            if (stateData.isPlaying) {
                                audioRef.current.play().catch(e => console.log(e));
                                setIsPlaying(true);
                            } else {
                                audioRef.current.pause();
                                setIsPlaying(false);
                            }
                        }
                        return; // Xử lý xong full sync, dừng tại đây
                    }

                    // ===== HEARTBEAT (chỉ kiểm tra drift, KHÔNG động React state) =====
                    // Mục tiêu: Không gây re-render, không gây khựng UI
                    if (!stateData.song) return;

                    // Kiểm tra xem có đang cùng bài với Host không
                    const songUrl = stateData.song.url?.startsWith('http') ? stateData.song.url : `${API_BASE}${stateData.song.url}`;
                    if (audioRef.current.src !== songUrl) {
                        // Khác bài → sync bài mới, cần update React state
                        audioRef.current.src = songUrl;
                        audioRef.current.currentTime = stateData.pos || 0;
                        audioRef.current.play().catch(e => console.log(e));
                        setIsPlaying(true); // Chỉ set state khi thực sự cần
                        return;
                    }

                    // Cùng bài → chỉ can thiệp audio nếu thực sự lệch quá lớn
                    // KHÔNG gọi setIsPlaying hay bất kỳ React state setter nào → không re-render
                    if (stateData.isPlaying) {
                        // Bù trễ mạng
                        let delay = 0;
                        if (stateData.timestamp) {
                            delay = (Date.now() - stateData.timestamp) / 1000;
                            if (delay < 0 || delay > 2) delay = 0.3;
                        }
                        const targetTime = (stateData.pos || 0) + delay;
                        const drift = Math.abs(targetTime - audioRef.current.currentTime);

                        // Chỉ can thiệp khi lệch > 2 giây (drift nghiêm trọng do mất gói, lag mạng)
                        if (drift > 2) {
                            // Seek nhanh, ít gây giật hơn playbackRate khi drift lớn
                            audioRef.current.currentTime = targetTime;
                        }
                        // drift 0s-2s → bỏ qua hoàn toàn. Audio HTML tự đồng bộ tốt trong ngưỡng này.

                        // Đảm bảo audio đang phát (trường hợp bị pause vì lý do nào đó)
                        if (audioRef.current.paused) {
                            audioRef.current.play().catch(e => console.log(e));
                            setIsPlaying(true);
                        }
                    } else {
                        // Host đã pause nhưng Guest vẫn đang phát
                        if (!audioRef.current.paused) {
                            audioRef.current.pause();
                            setIsPlaying(false);
                        }
                    }
                }
            });


            connection.on("PermissionsUpdated", (canControl) => {
                setGuestPermissions(canControl);
                if (!isHost) toast(canControl ? "Bạn đã được cấp quyền điều khiển!" : "Bạn đã bị khóa quyền điều khiển.", { icon: canControl ? '🔓' : '🔒' });
            });

            connection.on("ReceiveRequestAction", (actionType, payload) => {
                if (isHost) {
                    // Dispatch custom event to avoid stale closure state
                    document.dispatchEvent(new CustomEvent('JamAction', { detail: { actionType, payload } }));
                }
            });

            try {
                await connection.start();
                if (!isMounted) {
                     await connection.stop();
                     return;
                }
                const displayName = user?.hoTen || user?.fullName || 'Khách';
                const avatarUrl = user?.anhDaiDien || '';
                if (isHost) {
                    await connection.invoke("CreateRoom", jamRoomId, displayName, avatarUrl);
                } else {
                    await connection.invoke("JoinRoom", jamRoomId, displayName, avatarUrl);
                    toast.success("Tham gia phòng thành công!", { id: 'jam-toast' });
                }
            } catch (err) {
                // Prevent error cascade if unmounted by React StrictMode
                if (!isMounted || err.message?.includes("stopped during negotiation")) return;
                
                console.error("SignalR: ", err);
                toast.error("Không thể kết nối phòng.", { id: 'jam-toast' });
                if (isMounted) endJamSession();
            }
        };

        connect();

        return () => {
             isMounted = false;
             if (connection) {
                 connection.stop();
             }
        };
    }, [isJamActive, jamRoomId, user, isHost]);

    // Handle incoming guest actions (Host checks this)
    useEffect(() => {
        const handleJamAction = (e) => {
            if (!isHost) return;
            const { actionType, payload } = e.detail;
            if (actionType === "Next") nextSong();
            if (actionType === "Prev") prevSong();
            if (actionType === "TogglePlay") togglePlay();
            if (actionType === "PlaySong") playSong(payload.song, payload.queue);
            if (actionType === "AddToQueue") {
                setQueue(prev => [...prev, payload.song]);
                toast(`Khách vừa thêm: ${payload.song.tieuDe}`, { icon: '🎵' });
            }
            if (actionType === "SuggestSong") {
                // Host nhận lệnh SuggestSong -> đẩy vào suggestedQueue riêng để duyệt
                setSuggestedQueue(prev => {
                    // Kiểm tra xem bài hát đã tồn tại trong hàng chờ chưa
                    // Hỗ trợ cả 2 định dạng: Object {song, suggestedBy} hoặc chỉ Song
                    if (prev.some(s => (s.song?.id || s.id) === payload.song.id)) return prev;
                    
                    toast(`💡 ${payload.suggestedBy || 'Khách'} vừa đề xuất bài: ${payload.song.tieuDe}`);
                    // Định dạng payload: { song, suggestedBy }
                    return [...prev, payload];
                });
            }
        };
        document.addEventListener('JamAction', handleJamAction);
        return () => document.removeEventListener('JamAction', handleJamAction);
    }, [isHost, queue, currentIndex, currentSong, suggestedQueue]);

    useEffect(() => {
        if (isHost && jamRoomId && hubConnectionRef.current?.state === "Connected") {
            const stateObj = { 
                song: currentSong, queue: queue, pos: audioRef.current.currentTime, 
                source: sourceInfo, isPlaying: isPlaying, timestamp: Date.now()
            };
            hubConnectionRef.current.invoke("SyncStateToAll", jamRoomId, stateObj);
        }
    }, [currentSong?.id, queue.length, isPlaying]);

    // Background Sync Heartbeat: Host gửi vị trí hiện tại mỗi 10 giây
    // Chỉ để phát hiện drift nghiêm trọng (mất gói, tab bị sleep...)
    // Interval dài hơn = ít lần can thiệp audio hơn = nghe mượt hơn
    useEffect(() => {
        let syncInterval;
        if (isHost && jamRoomId && isJamActive && isPlaying) {
             syncInterval = setInterval(() => {
                 if (hubConnectionRef.current?.state === "Connected") {
                     const s = roomStateRef.current;
                     if (!s.isPlaying) return;
                     // Chỉ gửi pos + song + isPlaying (KHÔNG gửi queue để Guest nhận biết đây là Heartbeat)
                     const stateObj = { 
                         song: s.currentSong, 
                         pos: audioRef.current.currentTime, 
                         isPlaying: s.isPlaying, 
                         timestamp: Date.now()
                         // queue: undefined → Guest biết đây là heartbeat, không re-render React state
                     };
                     hubConnectionRef.current.invoke("SyncStateToAll", jamRoomId, stateObj)
                        .catch(e => console.error("Heartbeat sync error:", e));
                 }
             }, 10000); // Tăng lên 10s: ít can thiệp = mượt hơn
        }
        return () => clearInterval(syncInterval);
    }, [isHost, jamRoomId, isJamActive, isPlaying]);

    // Public Jam Functions
    const startJamSession = (bypassWarning = false) => {
        if (isJamActive && jamRoomId && !bypassWarning) {
            setPendingJamAction({
                type: isHost ? 'host_replace' : 'guest_leave',
                executeFn: () => {
                    if (!isHost) endJamSession();
                    else setSuggestedQueue([]);
                    startJamSession(true);
                }
            });
            return;
        }

        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setJamRoomId(newRoomId);
        setIsHost(true);
        setIsJamActive(true);
        setIsJamPanelOpen(true);
        setGuestPermissions(false);
        toast.success(`Đã tạo phòng: ${newRoomId}`);
    };

    const joinJamSession = (roomId, bypassWarning = false) => {
        if (isJamActive && jamRoomId && !bypassWarning) {
            setPendingJamAction({
                type: isHost ? 'host_replace' : 'guest_leave',
                executeFn: () => {
                    endJamSession();
                    joinJamSession(roomId, true);
                }
            });
            return;
        }

        setJamRoomId(roomId);
        setIsHost(false);
        setIsJamActive(true);
        setIsJamPanelOpen(true);
        toast.loading(`Đang vào phòng ${roomId}...`, { id: 'jam-toast' });
    };

    const endJamSession = () => {
        if (hubConnectionRef.current) hubConnectionRef.current.stop();
        setJamRoomId(null);
        setIsHost(false);
        setIsJamActive(false);
        setIsJamPanelOpen(false);
    };

    const emitGuestAction = (actionType, payload, forceLocal = false) => {
        if (forceLocal) return true; // Bỏ qua kiểm tra Jam nếu được yêu cầu (vd: vừa rời Jam)
        if (!jamRoomId) return true;
        if (!isHost && !guestPermissions) {
            toast.error("Trưởng phòng đang khóa quyền điều khiển.");
            return false; // Prevent action
        }
        if (!isHost && guestPermissions) {
            hubConnectionRef.current?.invoke("RequestAction", jamRoomId, actionType, payload);
            return false; // Prevent local immediate action, wait for Host to SyncState
        }
        return true; // Host executing locally
    };

    const refreshUser = async () => {
        const token = Cookies.get('access_token');
        if (!token) {
            setUser(null);
            setLikedSongIds(new Set());
            setLikedPlaylistId(null);
            setMyPlaylists([]);
            return;
        }

        try {
            const [uRes, lRes, myRes] = await Promise.all([
                getCurrentUserApi(),
                getLikedPlaylistApi(),
                getMyPlaylistsApi()
            ]);

            if (uRes) setUser(uRes);
            if (myRes) setMyPlaylists(myRes);

            if (lRes && lRes.id) {
                setLikedPlaylistId(lRes.id);
                const ids = new Set((lRes.songs || []).map(s => s.id));
                setLikedSongIds(ids);
            }

            // Restore playback state if available and not currently playing
            if (!currentSong && uRes.playbackState?.lastSongId) {
                try {
                    const song = await getSongByIdApi(uRes.playbackState.lastSongId);
                    if (song) {
                        setCurrentSong(song);
                        setQueue([song]);
                        if (uRes.playbackState.lastSourceInfo) {
                            try {
                                setSourceInfo(JSON.parse(uRes.playbackState.lastSourceInfo));
                            } catch (e) {}
                        }
                        
                        const API_URL = import.meta.env.VITE_API_URL || '';
                        const songUrl = song.url?.startsWith('http') ? song.url : `${API_URL}${song.url}`;
                        audioRef.current.src = songUrl;
                        audioRef.current.load();
                        audioRef.current.currentTime = uRes.playbackState.lastPosition || 0;
                        setIsPlaying(false);
                    }
                } catch (err) {
                    console.error("Lỗi khi khôi phục trạng thái phát nhạc:", err);
                }
            }
            return uRes;
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin người dùng:", error);
            // If token is invalid/expired
            if (error.response?.status === 401) {
                logout();
            }
        }
    };

    const logout = () => {
        Cookies.remove('access_token');
        setUser(null);
        setLikedSongIds(new Set());
        setLikedPlaylistId(null);
        setCurrentSong(null);
        setIsPlaying(false);
        audioRef.current.pause();
        audioRef.current.src = '';
    };

    // Initialize: load liked songs and user
    useEffect(() => {
        refreshUser();
    }, []);

    // Playback logic
    // Tự động tải lời nhạc khi bài hát thay đổi
    useEffect(() => {
        if (!currentSong) return;
        
        setCurrentLyrics({ synced: [], plain: [], status: 'loading' });

        const trackName = currentSong.tieuDe || '';
        const artistName = (currentSong.tenNgheSi || '') + (currentSong.ngheSiHopTac ? `, ${currentSong.ngheSiHopTac}` : '');
        const albumName = currentSong.tenAlbum || '';
        const duration = currentSong.thoiLuongGiay || 0;

        fetchLyrics(trackName, artistName, albumName, duration)
            .then(res => {
                if (res.synced) {
                    setCurrentLyrics({ synced: parseLRC(res.synced), plain: [], status: 'success' });
                } else if (res.plain) {
                    setCurrentLyrics({ synced: [], plain: res.plain.split('\n').filter(l => l.trim().length > 0), status: 'success' });
                } else {
                    setCurrentLyrics({ synced: [], plain: [], status: 'notfound' });
                }
            })
            .catch(() => {
                setCurrentLyrics({ synced: [], plain: [], status: 'error' });
            });
    }, [currentSong?.id]);
    
    // Extract dominant color from cover
    useEffect(() => {
        if (!currentSong?.anhBia) {
            setDominantColor('#1a1a1a');
            return;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = currentSong.anhBia.startsWith('http') ? currentSong.anhBia : `${API_BASE}${currentSong.anhBia.startsWith('/') ? '' : '/'}${currentSong.anhBia}`;
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 50; canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            
            let r = 0, g = 0, b = 0, count = 0;
            for (let i = 0; i < data.length; i += 20) {
                const pr = data[i], pg = data[i+1], pb = data[i+2];
                const max = Math.max(pr, pg, pb), min = Math.min(pr, pg, pb);
                const l = (max + min) / 2 / 255;
                if (l > 0.15 && l < 0.6) {
                    r += pr; g += pg; b += pb;
                    count++;
                }
            }

            if (count > 0) {
                let fr = Math.floor(r / count), fg = Math.floor(g / count), fb = Math.floor(b / count);
                const finalL = (Math.max(fr, fg, fb) + Math.min(fr, fg, fb)) / 2 / 255;
                if (finalL > 0.4) {
                    fr = Math.floor(fr * 0.7); fg = Math.floor(fg * 0.7); fb = Math.floor(fb * 0.7);
                }
                setDominantColor(`rgb(${fr}, ${fg}, ${fb})`);
            } else {
                setDominantColor('#1a1a1a');
            }
        };
        img.onerror = () => setDominantColor('#1a1a1a');
    }, [currentSong?.anhBia]);

    const playSong = async (song, newQueue, newSourceInfo, bypassWarning = false) => {
        if (!song) return;

        // Nếu cố gắng phát một bài hát từ ngoài (không phải next/prev/queue list)
        // và bạn đang trong Jam -> Chặn lại báo Warning.
        const isReplacingQueue = !newQueue || newQueue !== queue;
        
        if (isJamActive && jamRoomId && isReplacingQueue && !bypassWarning) {
            setPendingJamAction({
                type: isHost ? 'host_replace' : 'guest_leave',
                executeFn: () => {
                    if (!isHost) {
                        endJamSession(); // Khách phải rời phòng
                    } else {
                        setSuggestedQueue([]); // Host reset danh sách đề xuất cũ
                    }
                    playSong(song, newQueue, newSourceInfo, true); // Chạy lại hàm và bypass
                }
            });
            return;
        }

        if (!emitGuestAction("PlaySong", { song, queue: newQueue }, bypassWarning)) return;

        // Tránh report trùng bài hát liên tục
        if (lastReportedSongIdRef.current !== song.id) {
            lastReportedSongIdRef.current = song.id;
            // Gọi API để ghi nhận lượt phát nhạc
            playSongApi(song.id).catch(e => console.error("Error reporting play:", e));
        }

        if (newQueue && newQueue.length > 0) {
            setQueue(newQueue);
            const idx = newQueue.findIndex(s => s.id === song.id);
            setCurrentIndex(idx !== -1 ? idx : 0);
        } else if (currentSong?.id !== song.id) {
            setQueue([song]);
            setCurrentIndex(0);
        }

        if (newSourceInfo) {
            setSourceInfo(newSourceInfo);
        }

        if (currentSong?.id === song.id) {
            if (!isPlaying) togglePlay();
            return;
        }

        setCurrentSong(song);
        setIsPlaying(true);
        
        const API_URL = import.meta.env.VITE_API_URL || '';
        const songPath = song.url || song.Url || song.URL;
        
        if (!songPath) return;

        const songUrl = songPath.startsWith('http') ? songPath : `${API_URL}${songPath}`;
        audioRef.current.playbackRate = 1.0;

        // Nếu bài này đã được pre-load sẵn → tận dụng buffer, chuyển bài gần như tức thì
        if (preloadRef.current.src === songUrl && preloadRef.current.readyState >= 2) {
            audioRef.current.src = songUrl;
            audioRef.current.currentTime = preloadRef.current.currentTime || 0;
            preloadRef.current.src = ''; // Reset preload để sẵn sàng cho bài tiếp
        } else {
            audioRef.current.src = songUrl;
        }
        audioRef.current.play().catch(e => console.error("Playback error:", e));

    };

    const togglePlay = () => {
        if (!currentSong) return;
        if (!emitGuestAction("TogglePlay", null)) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const nextSong = () => {
        if (queue.length === 0 || currentIndex === -1) return;
        if (!emitGuestAction("Next", null)) return;

        let nextIdx;
        if (isShuffle) {
            if (queue.length > 1) {
                do { nextIdx = Math.floor(Math.random() * queue.length); } while (nextIdx === currentIndex);
            } else { nextIdx = 0; }
        } else {
            nextIdx = currentIndex + 1;
            if (nextIdx >= queue.length) {
                if (repeatMode === 'all') nextIdx = 0;
                else return;
            }
        }

        setCurrentIndex(nextIdx);
        playSong(queue[nextIdx], queue, sourceInfo);
    };

    const prevSong = () => {
        if (queue.length === 0 || currentIndex === -1) return;
        if (!emitGuestAction("Prev", null)) return;
        
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) {
            if (repeatMode === 'all') prevIdx = queue.length - 1;
            else prevIdx = 0;
        }

        setCurrentIndex(prevIdx);
        playSong(queue[prevIdx], queue, sourceInfo);
    };

    const playFromQueue = (index) => {
        if (index >= 0 && index < queue.length) {
            if (!emitGuestAction("PlaySong", { song: queue[index], queue: queue })) return;
            
            const song = queue[index];
            setCurrentIndex(index);
            setCurrentSong(song);
            setIsPlaying(true);
            
            if (lastReportedSongIdRef.current !== song.id) {
                lastReportedSongIdRef.current = song.id;
                playSongApi(song.id).catch(e => console.error("Error reporting play:", e));
            }

            const API_URL = import.meta.env.VITE_API_URL || '';
            const songUrl = song.url?.startsWith('http') ? song.url : `${API_URL}${song.url}`;
            audioRef.current.src = songUrl;
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        }
    };

    const addSongToQueue = (song) => {
        if (!song) return;
        
        // Gửi lệnh "AddToQueue" đến Host qua SignalR (GuestPermission đã kiểm tra trong emitGuestAction)
        if (!emitGuestAction("AddToQueue", { song })) {
            // Guest được cấp quyền sẽ bị Return False để chờ Host SyncState lại, ko đẩy cục bộ
            return;
        }

        // Nếu là Host (emit trẩ về true), tiến hành Add cục bộ ngay và luôn
        setQueue(prev => [...prev, song]);
        toast.success(`Đã thêm "${song.tieuDe}"!`, { icon: '🎵' });
    };

    const suggestSongToHost = (song) => {
        if (!song) return;
        const submitterName = user?.hoTen || user?.fullName || 'Khách';
        if (hubConnectionRef.current && jamRoomId) {
            hubConnectionRef.current.invoke("RequestAction", jamRoomId, "SuggestSong", { song, suggestedBy: submitterName })
                .then(() => toast.success(`Đã gửi đề xuất bài: ${song.tieuDe}`))
                .catch(err => console.error("Error SuggestSong:", err));
        }
    };

    const approveSuggestion = (songId) => {
        if (!isHost) return;
        const item = suggestedQueue.find(s => (s.song?.id || s.id) === songId);
        if (item) {
            const actualSong = item.song || item;
            setSuggestedQueue(prev => prev.filter(s => (s.song?.id || s.id) !== songId));
            setQueue(prev => [...prev, actualSong]);
            toast.success(`Đã duyệt: ${actualSong.tieuDe}`);
        }
    };

    const rejectSuggestion = (songId) => {
        if (!isHost) return;
        setSuggestedQueue(prev => prev.filter(s => (s.song?.id || s.id) !== songId));
        toast.error("Đã bỏ qua 1 đề xuất");
    };

    const confirmJamAction = () => {
        if (pendingJamAction?.executeFn) {
            pendingJamAction.executeFn();
            setPendingJamAction(null);
        }
    };

    const cancelJamAction = () => {
        setPendingJamAction(null);
    };

    const approveAllSuggestions = () => {
        if (!isHost || suggestedQueue.length === 0) return;
        const pendingSongs = suggestedQueue.map(item => item.song || item);
        setQueue(prev => [...prev, ...pendingSongs]);
        setSuggestedQueue([]);
        toast.success(`Đã thêm tất cả ${pendingSongs.length} bài hát đề xuất vào hàng chờ!`);
    };

    const rejectAllSuggestions = () => {
        if (!isHost || suggestedQueue.length === 0) return;
        setSuggestedQueue([]);
        toast("Đã bỏ qua tất cả bài hát đề xuất.", { icon: '🧹' });
    };

    const toggleLike = async (song) => {
        if (!song || !likedPlaylistId) return;
        const isLiked = likedSongIds.has(song.id);
        const newLikedIds = new Set(likedSongIds);

        try {
            if (isLiked) {
                newLikedIds.delete(song.id);
                await removeSongFromPlaylistApi(likedPlaylistId, song.id);
            } else {
                newLikedIds.add(song.id);
                await addSongToPlaylistApi(likedPlaylistId, song.id);
            }
            setLikedSongIds(newLikedIds);
        } catch (error) {
            console.error("Lỗi khi cập nhật yêu thích:", error);
        }
    };

    // Audio event listeners + Pre-loading bài tiếp theo
    useEffect(() => {
        const audio = audioRef.current;
        const preload = preloadRef.current;
        preload.preload = 'auto';
        preload.volume = 0; // Tắt tiếng, chỉ để buffer

        const handleEnded = () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                nextSong();
            }
        };

        // Pre-load bài tiếp theo khi còn khoảng 30 giây
        const handleTimeUpdate = () => {
            if (!audio.duration || audio.duration === Infinity) return;
            const remaining = audio.duration - audio.currentTime;
            
            if (remaining < 30 && remaining > 25) {
                // Tính index bài tiếp theo
                const nextIdx = isShuffle
                    ? Math.floor(Math.random() * queue.length)
                    : currentIndex + 1;
                
                if (nextIdx >= 0 && nextIdx < queue.length) {
                    const nextSongData = queue[nextIdx];
                    if (nextSongData?.url) {
                        const API_URL = import.meta.env.VITE_API_URL || '';
                        const nextUrl = nextSongData.url.startsWith('http') ? nextSongData.url : `${API_URL}${nextSongData.url}`;
                        
                        // Chỉ load nếu chưa load bài này
                        if (preload.src !== nextUrl) {
                            preload.src = nextUrl;
                            preload.load(); // Bắt đầu buffer ngầm
                        }
                    }
                }
            }
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [currentIndex, queue, isShuffle, repeatMode]);


    // Periodically save playback state to backend
    useEffect(() => {
        if (!user?.id || !currentSong?.id) return;

        const savePlaybackState = async () => {
            const state = {
                LastSongId: currentSong.id,
                LastQueueIds: queue.map(s => s.id).join(','),
                LastSourceInfo: sourceInfo ? JSON.stringify(sourceInfo) : null,
                LastPosition: audioRef.current.currentTime
            };
            try {
                await updatePlaybackStateApi(state);
            } catch (e) {
                console.error("Lỗi khi lưu trạng thái phát nhạc:", e);
            }
        };

        const interval = setInterval(savePlaybackState, 15000); // Save every 15 seconds
        return () => clearInterval(interval);
    }, [user?.id, currentSong?.id, queue.length, sourceInfo]);

    return (
        <MusicContext.Provider value={{
            currentSong, isPlaying, queue, currentIndex, sourceInfo,
            suggestedQueue, approveSuggestion, rejectSuggestion, suggestSongToHost,
            approveAllSuggestions, rejectAllSuggestions,
            pendingJamAction, confirmJamAction, cancelJamAction,
            likedSongIds, volume, audioRef, isShuffle, repeatMode,
            playSong, togglePlay, nextSong, prevSong, toggleLike, 
            setVolume, playFromQueue, addSongToQueue, setIsShuffle, setRepeatMode,
            currentLyrics, user, setUser, refreshUser, logout,
            myPlaylists, setMyPlaylists,
            isJamPanelOpen, setIsJamPanelOpen,
            isJamActive, setIsJamActive,
            dominantColor,
            jamRoomId, isHost, guestPermissions, setGuestPermissions, jamParticipants,
            startJamSession, joinJamSession, endJamSession, hubConnectionRef
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
