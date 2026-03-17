import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { 
    Play, Pause, Heart, MoreHorizontal, Clock, 
    Music2, Plus, Download, Share2, Trash2
} from 'lucide-react';
import { getPlaylistByIdApi, removeSongFromPlaylistApi } from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';

const ACCENT = '#0F5E8F';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const fmtTime = (s) => { 
    if (!s) return '0:00'; 
    const m = Math.floor(s / 60); 
    return `${m}:${String(s % 60).padStart(2, '0')}`; 
};

const PlaylistView = () => {
    const { id } = useParams();
    const { user } = useOutletContext();
    const { currentSong, isPlaying, playSong, toggleLike, likedSongIds } = useMusic();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylist = async () => {
            setLoading(true);
            try {
                const res = await getPlaylistByIdApi(id);
                setPlaylist(res);
            } catch (error) {
                console.error("Lỗi khi tải playlist:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [id]);

    const handlePlayAll = () => {
        if (playlist?.songs?.length > 0) {
            playSong(playlist.songs[0], playlist.songs, { type: 'playlist', id: playlist.id, name: playlist.ten });
        }
    };

    if (loading) return (
        <div className="flex flex-col gap-8 p-8 animate-pulse">
            <div className="flex gap-8 items-end">
                <div className="w-56 h-56 bg-white/5 rounded-xl"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-white/5 rounded w-24"></div>
                    <div className="h-12 bg-white/5 rounded w-64"></div>
                    <div className="h-4 bg-white/5 rounded w-32"></div>
                </div>
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-white/5 rounded w-full"></div>)}
            </div>
        </div>
    );

    if (!playlist) return <div className="p-8 text-center text-gray-400">Không tìm thấy danh sách phát.</div>;

    return (
        <div className="flex flex-col h-full overflow-y-auto px-8 py-6 custom-main-scroll" data-lenis-prevent>
            
            {/* Header */}
            <header className="flex gap-8 items-end mb-8">
                <div className="w-60 h-60 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl bg-gray-900 border border-white/5">
                    {playlist.anhBia ? (
                        <img src={imgUrl(playlist.anhBia)} alt={playlist.ten} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                            <Music2 size={80} className="text-white/10" />
                        </div>
                    )}
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60">Playlist</p>
                    <h1 className="text-7xl font-black text-white">{playlist.ten}</h1>
                    <div className="flex flex-col gap-3">
                        <p className="text-white/40 max-w-2xl">{playlist.moTa || 'Danh sách phát dành cho bạn.'}</p>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-white">{user?.hoTen || 'Người dùng'}</span>
                            <span className="text-white/20">•</span>
                            <span className="text-white/60">{playlist.songs?.length || 0} bài hát</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Actions */}
            <div className="flex items-center gap-6 mb-8">
                <button 
                    onClick={handlePlayAll}
                    style={{ background: ACCENT }}
                    className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                    <Play size={24} fill="white" className="text-white ml-1" />
                </button>
                <button className="text-white/40 hover:text-white transition-colors"><Heart size={32} /></button>
                <button className="text-white/40 hover:text-white transition-colors"><Download size={24} /></button>
                <button className="text-white/40 hover:text-white transition-colors"><Share2 size={24} /></button>
                <button className="text-white/40 hover:text-white transition-colors"><MoreHorizontal size={32} /></button>
            </div>

            {/* Song Table */}
            <div className="flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 border-b border-white/10 bg-[#0e0e0e]/80 backdrop-blur-md">
                        <tr className="text-white/40 text-[11px] uppercase tracking-widest">
                            <th className="px-4 py-3 font-medium w-12 text-center">#</th>
                            <th className="px-4 py-3 font-medium">Tiêu đề</th>
                            <th className="px-4 py-3 font-medium">Nghệ sĩ</th>
                            <th className="px-4 py-3 font-medium">Album</th>
                            <th className="px-4 py-3 font-medium w-12"><Clock size={16} /></th>
                            <th className="px-4 py-3 font-medium w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {playlist.songs?.map((song, idx) => {
                            const isCurrent = currentSong?.id === song.id;
                            return (
                                <tr key={song.id} 
                                    onClick={() => playSong(song, playlist.songs, { type: 'playlist', id: playlist.id, name: playlist.ten })}
                                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 py-4 text-center">
                                        {isCurrent && isPlaying ? (
                                            <div className="flex items-center justify-center gap-0.5 h-4">
                                                <div className="w-0.5 bg-buzzify-blue h-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                                <div className="w-0.5 bg-buzzify-blue h-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-0.5 bg-buzzify-blue h-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        ) : (
                                            <span className={`text-sm ${isCurrent ? 'text-blue-500 font-bold' : 'text-white/30'}`}>{idx + 1}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                                                <img src={imgUrl(song.anhBia)} alt={song.tieuDe} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold truncate ${isCurrent ? 'text-blue-500' : 'text-white'}`}>{song.tieuDe}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-white/60 truncate hover:text-white transition-colors">{song.tenNgheSi || 'Nghệ sĩ'}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm text-white/40 truncate hover:text-white transition-colors italic">Album Name</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="text-sm text-white/40 font-medium">{fmtTime(song.thoiLuongGiay)}</span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                                className="hover:scale-110 transition-transform active:scale-95"
                                            >
                                                <Heart size={16} fill={likedSongIds.has(song.id) ? ACCENT : "none"} color={likedSongIds.has(song.id) ? ACCENT : "white"} />
                                            </button>
                                            <button className="text-white/30 hover:text-white transition-colors">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {(!playlist.songs || playlist.songs.length === 0) && (
                    <div className="py-20 text-center text-white/20">
                        <Plus size={48} className="mx-auto mb-4 opacity-10" />
                        <p>Chưa có bài hát nào trong danh sách phát này.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistView;
