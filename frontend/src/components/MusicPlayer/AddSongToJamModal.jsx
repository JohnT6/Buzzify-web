import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Plus, Music2, Check } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { getSongsApi, searchByTypeApi } from '../../services/api_services';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

// Custom Hook Debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const AddSongToJamModal = ({ isOpen, onClose }) => {
    const { addSongToQueue, suggestSongToHost, isHost, guestPermissions, queue, currentSong } = useMusic();
    const [searchQuery, setSearchQuery] = useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const debouncedSearchTerm = useDebounce(searchQuery, 400);

    const fetchSongs = async (query) => {
        setLoading(true);
        try {
            if (query && query.trim() !== '') {
                // Sử dụng api tìm kiếm theo kiểu để ra bài hát
                const res = await searchByTypeApi(query, 'songs', 1, 30);
                if (res?.data) {
                    setSongs(res.data);
                } else if (res?.songs) {
                    setSongs(res.songs); // Phòng trường hợp backend trả về res.songs
                } else {
                    setSongs([]);
                }
            } else {
                // Lấy nhạc rỗng -> trả về nhạc phổ biến / mới nhất
                const res = await getSongsApi(null, 1, 30);
                if (res?.songs) {
                    setSongs(res.songs);
                } else if (res?.data) {
                    setSongs(res.data);
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải bài hát:", error);
            setSongs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery('');
            setSongs([]);
        } else {
            // Load initial popular/recent songs immediately
            fetchSongs('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        fetchSongs(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div 
                className="relative w-full max-w-md bg-[#121212]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl flex flex-col animate-scale-up"
                style={{ height: '70vh' }}
                data-lenis-prevent
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-[14px] font-black text-white uppercase tracking-widest">Thêm vào Jam</h2>
                    <button 
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search Input */}
                <div className="p-6 pb-2">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center justify-center text-white/40 group-focus-within:text-emerald-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Gõ từ khóa để tìm bài hát..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                            className="w-full bg-white/5 border border-white/10 text-white text-[12px] font-bold rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 uppercase tracking-widest"
                        />
                    </div>
                </div>

                {/* Song List */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 mt-4 custom-main-scroll">
                    {loading ? (
                        <div className="w-full h-32 flex items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-500" size={24} />
                        </div>
                    ) : songs.length > 0 ? (
                        <div className="space-y-2">
                            {songs.map((song) => {
                                const isAdded = queue.some(q => q.id === song.id) || currentSong?.id === song.id;
                                return (
                                    <div 
                                        key={song.id}
                                        className="flex items-center gap-4 group p-2 hover:bg-white/5 rounded-xl transition-colors"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 relative">
                                            {song.anhBia ? (
                                                <img src={imgUrl(song.anhBia)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Music2 size={16} className="text-white/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white text-[12px] truncate uppercase tracking-tight">{song.tieuDe}</p>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5 truncate">{song.tenNgheSi}</p>
                                        </div>
                                        
                                        {isAdded ? (
                                            <button 
                                                disabled
                                                className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 opacity-100 cursor-not-allowed"
                                                title="Đã có trong hàng chờ"
                                            >
                                                <Check size={18} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => {
                                                    // Nếu là Host hoặc có quyền thì add luôn
                                                    if (isHost || guestPermissions) {
                                                        addSongToQueue(song);
                                                    } else {
                                                        suggestSongToHost(song);
                                                        onClose();
                                                    }
                                                }}
                                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-emerald-500 hover:text-black text-white flex items-center justify-center transition-all flex-shrink-0 shadow-lg"
                                                title={isHost || guestPermissions ? "Thêm vào hàng chờ" : "Gửi đề xuất"}
                                            >
                                                <Plus size={18} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="w-full h-32 flex items-center justify-center flex-col gap-2 opacity-50">
                            <Music2 size={32} className="text-white/20" />
                            <p className="text-[10px] font-black uppercase text-white tracking-widest">Không tìm thấy bài hát</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddSongToJamModal;
