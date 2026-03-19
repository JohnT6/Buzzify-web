import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getCurrentUserApi, getPlaylistsApi, getSongsApi, playSongApi, getLikedPlaylistApi, addSongToPlaylistApi, removeSongFromPlaylistApi } from '../services/api_services';

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
    const audioRef = useRef(new Audio());

    // Sync volume with local storage or default
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('buzzify_volume') || '0.7'));

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Initialize: load liked songs and user
    useEffect(() => {
        const init = async () => {
            const token = Cookies.get('access_token');
            if (!token) return;

            try {
                const [uRes, lRes] = await Promise.all([
                    getCurrentUserApi(),
                    getLikedPlaylistApi()
                ]);

                if (uRes) setUser(uRes);

                const likedPl = lRes;
                if (likedPl && likedPl.id) {
                    setLikedPlaylistId(likedPl.id);
                    const ids = new Set((likedPl.songs || []).map(s => s.id));
                    setLikedSongIds(ids);
                }
            } catch (error) {
                console.error("Lỗi khi khởi tạo nhạc:", error);
            }
        };

        init();
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
        const songUrl = song.url?.startsWith('http') ? song.url : `${API_URL}${song.url}`;
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

    return (
        <MusicContext.Provider value={{
            currentSong, isPlaying, queue, currentIndex, sourceInfo,
            likedSongIds, volume, audioRef, isShuffle, repeatMode,
            playSong, togglePlay, nextSong, prevSong, toggleLike, 
            setVolume, playFromQueue, setIsShuffle, setRepeatMode,
            currentLyrics, user, setUser
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
