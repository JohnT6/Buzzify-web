import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { getCurrentUserApi, getPlaylistsApi, getSongsApi, playSongApi } from '../services/api_services';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [sourceInfo, setSourceInfo] = useState(null); // { type: 'playlist' | 'album' | 'search', id: string, name: string }
    const [likedSongIds, setLikedSongIds] = useState(new Set());
    const [likedPlaylistId, setLikedPlaylistId] = useState(null);
    const audioRef = useRef(new Audio());

    // Sync volume with local storage or default
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('buzzify_volume') || '0.7'));

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Initialize: load liked songs
    useEffect(() => {
        const fetchLikedSongs = async () => {
            const token = Cookies.get('access_token');
            if (!token) return;

            try {
                const playlists = await getPlaylistsApi();
                const allPlaylists = Array.isArray(playlists) ? playlists : (playlists?.data || []);
                // Giả định playlist "Liked Songs" hoặc lấy từ API chuyên biệt nếu có
                const likedPl = allPlaylists.find(p => p.ten?.toLowerCase().includes('thích') || p.loaiPlaylist === 'liked');
                
                if (likedPl) {
                    setLikedPlaylistId(likedPl.id);
                    // Ở đây cần một API lấy bài hát của playlist. Hiện tại api_services chưa có getPlaylistSongs.
                    // Tạm thời để trống hoặc giả định setLikedSongIds sẽ được cập nhật khi tương tác.
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách yêu thích:", error);
            }
        };

        fetchLikedSongs();
    }, []);

    // Playback logic
    const playSong = (song, newQueue = [], source = null) => {
        if (!song) return;

        // Gọi API để ghi nhận lượt phát nhạc
        playSongApi(song.id).catch(e => console.error("Error reporting play:", e));

        if (currentSong?.id === song.id) {
            togglePlay();
            return;
        }

        setCurrentSong(song);
        setIsPlaying(true);
        
        if (newQueue.length > 0) {
            setQueue(newQueue);
            const idx = newQueue.findIndex(s => s.id === song.id);
            setCurrentIndex(idx);
        } else {
            setQueue([song]);
            setCurrentIndex(0);
        }

        if (source) setSourceInfo(source);

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
        const nextIdx = (currentIndex + 1) % queue.length;
        setCurrentIndex(nextIdx);
        playSong(queue[nextIdx], queue, sourceInfo);
    };

    const prevSong = () => {
        if (queue.length === 0 || currentIndex === -1) return;
        const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
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
        if (!song) return;
        const isLiked = likedSongIds.has(song.id);
        const newLikedIds = new Set(likedSongIds);

        if (isLiked) {
            newLikedIds.delete(song.id);
            // Gọi API xóa khỏi playlist yêu thích
        } else {
            newLikedIds.add(song.id);
            // Gọi API thêm vào playlist yêu thích
        }
        setLikedSongIds(newLikedIds);
        // TODO: Thực hiện gọi API thật ở đây
    };

    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => nextSong();
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [currentIndex, queue]);

    return (
        <MusicContext.Provider value={{
            currentSong, isPlaying, queue, currentIndex, sourceInfo,
            likedSongIds, volume, audioRef,
            playSong, togglePlay, nextSong, prevSong, toggleLike, setVolume, playFromQueue
        }}>
            {children}
        </MusicContext.Provider>
    );
};

export const useMusic = () => useContext(MusicContext);
