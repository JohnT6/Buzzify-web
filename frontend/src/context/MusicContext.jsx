import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
    getCurrentUserApi, getPlaylistsApi, getSongsApi, playSongApi, getLikedPlaylistApi, 
    addSongToPlaylistApi, removeSongFromPlaylistApi, updatePlaybackStateApi, getSongByIdApi,
    getMyPlaylistsApi
} from '../services/api_services';

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
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [sourceInfo, setSourceInfo] = useState(null); // { type: 'playlist' | 'album' | 'search', id: string, name: string }
    const [likedSongIds, setLikedSongIds] = useState(new Set());
    const [likedPlaylistId, setLikedPlaylistId] = useState(null);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none'); // 'none' | 'all' | 'one'
    const [currentLyrics, setCurrentLyrics] = useState({ synced: [], plain: [], status: 'idle' });
    const [user, setUser] = useState(null);
    const [myPlaylists, setMyPlaylists] = useState([]);
    const audioRef = useRef(new Audio());

    // Sync volume with local storage or default
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('buzzify_volume') || '0.7'));

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

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

    const playSong = async (song, newQueue, newSourceInfo) => {
        if (!song) return;

        // Gọi API để ghi nhận lượt phát nhạc
        playSongApi(song.id).catch(e => console.error("Error reporting play:", e));

        if (currentSong?.id === song.id) {
            togglePlay();
            return;
        }

        setCurrentSong(song);
        setIsPlaying(true);
        
        if (newQueue && newQueue.length > 0) {
            setQueue(newQueue);
            const idx = newQueue.findIndex(s => s.id === song.id);
            setCurrentIndex(idx);
        } else {
            setQueue([song]);
            setCurrentIndex(0);
        }

        if (newSourceInfo) setSourceInfo(newSourceInfo);

        // Update audio source and play
        const API_URL = import.meta.env.VITE_API_URL || '';
        const songPath = song.url || song.Url || song.URL;
        
        if (!songPath) {
            console.warn("Song path is missing for:", song.tieuDe || song.TieuDe);
            return;
        }

        const songUrl = songPath.startsWith('http') ? songPath : `${API_URL}${songPath}`;
        console.log("Playing song URL:", songUrl);
        audioRef.current.src = songUrl;
        audioRef.current.play().catch(e => console.error("Playback error:", e));
    };

    const togglePlay = () => {
        if (!currentSong) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const nextSong = () => {
        if (queue.length === 0 || currentIndex === -1) return;

        let nextIdx;
        if (isShuffle) {
            // Random index that is not the current one (if possible)
            if (queue.length > 1) {
                do {
                    nextIdx = Math.floor(Math.random() * queue.length);
                } while (nextIdx === currentIndex);
            } else {
                nextIdx = 0;
            }
        } else {
            nextIdx = currentIndex + 1;
            if (nextIdx >= queue.length) {
                if (repeatMode === 'all') {
                    nextIdx = 0;
                } else {
                    // Stop at the end
                    return;
                }
            }
        }

        setCurrentIndex(nextIdx);
        playSong(queue[nextIdx], queue, sourceInfo);
    };

    const prevSong = () => {
        if (queue.length === 0 || currentIndex === -1) return;
        
        // If current time > 3s, just restart the song
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        let prevIdx = currentIndex - 1;
        if (prevIdx < 0) {
            if (repeatMode === 'all') {
                prevIdx = queue.length - 1;
            } else {
                prevIdx = 0;
            }
        }

        setCurrentIndex(prevIdx);
        playSong(queue[prevIdx], queue, sourceInfo);
    };

    const playFromQueue = (index) => {
        if (index >= 0 && index < queue.length) {
            const song = queue[index];
            setCurrentIndex(index);
            setCurrentSong(song);
            setIsPlaying(true);
            
            playSongApi(song.id).catch(e => console.error("Error reporting play:", e));

            const API_URL = import.meta.env.VITE_API_URL || '';
            const songUrl = song.url?.startsWith('http') ? song.url : `${API_URL}${song.url}`;
            audioRef.current.src = songUrl;
            audioRef.current.play().catch(e => console.error("Playback error:", e));
        }
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

    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                nextSong();
            }
        };
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
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
            likedSongIds, volume, audioRef, isShuffle, repeatMode,
            playSong, togglePlay, nextSong, prevSong, toggleLike, 
            setVolume, playFromQueue, setIsShuffle, setRepeatMode,
            currentLyrics, user, setUser, refreshUser, logout,
            myPlaylists, setMyPlaylists
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
