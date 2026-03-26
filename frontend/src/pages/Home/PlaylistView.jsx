import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { 
    Play, Pause, Heart, MoreHorizontal, Clock, 
    Music2, Plus, Download, Share2, Trash2, Shuffle, Check,
    Pencil, Lock, Unlock, X
} from 'lucide-react';
import { 
    getPlaylistByIdApi, removeSongFromPlaylistApi, 
    savePlaylistApi, unsavePlaylistApi, checkIfPlaylistSavedApi,
    updatePlaylistApi 
} from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';
import SongRow from '../../components/MusicPlayer/SongRow';
import SongMenu from '../../components/MusicPlayer/SongMenu';
import PlaylistMenu from '../../components/MusicPlayer/PlaylistMenu';
import CreatePlaylistModal from '../../components/Playlist/CreatePlaylistModal';

const ACCENT = '#0F5E8F';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const PlaylistView = () => {
    const { id } = useParams();
    const { user } = useOutletContext();
    const { currentSong, isPlaying, playSong, togglePlay, toggleLike, likedSongIds, sourceInfo, setIsShuffle, refreshUser } = useMusic();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [menuConfig, setMenuConfig] = useState({ open: false, x: 0, y: 0, song: null });
    const [playlistMenuOpen, setPlaylistMenuOpen] = useState({ open: false, x: 0, y: 0 });
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPrivacyConfirmOpen, setIsPrivacyConfirmOpen] = useState(false);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

    const isOwner = user?.id === playlist?.idNguoiTao;

    const handleOpenMenu = (e, song) => {
        e.stopPropagation();
        setMenuConfig({
            open: true,
            x: e.clientX,
            y: e.clientY,
            song: song
        });
    };

    const handleOpenPlaylistMenu = (e) => {
        e.stopPropagation();
        setPlaylistMenuOpen({
            open: true,
            x: e.clientX,
            y: e.clientY
        });
    };

    const fetchPlaylist = async () => {
        try {
            const res = await getPlaylistByIdApi(id);
            setPlaylist(res);
            
            // Check if saved
            const savedRes = await checkIfPlaylistSavedApi(id);
            setIsSaved(savedRes.isSaved);
        } catch (error) {
            console.error("Lỗi khi tải playlist:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchPlaylist();
    }, [id]);

    const isCurrentPlaylist = sourceInfo?.type === 'playlist' && sourceInfo?.id === id;

    const handlePlayToggle = () => {
        if (isCurrentPlaylist) {
            togglePlay();
        } else if (playlist?.songs?.length > 0) {
            setIsShuffle(false);
            playSong(playlist.songs[0], playlist.songs, { type: 'playlist', id: playlist.id, name: playlist.ten });
        }
    };

    const handleShufflePlay = () => {
        if (playlist?.songs?.length > 0) {
            setIsShuffle(true);
            const randomIdx = Math.floor(Math.random() * playlist.songs.length);
            playSong(playlist.songs[randomIdx], playlist.songs, { type: 'playlist', id: playlist.id, name: playlist.ten });
        }
    };

    const handleToggleSave = async () => {
        try {
            if (isSaved) {
                await unsavePlaylistApi(id);
                setIsSaved(false);
            } else {
                await savePlaylistApi(id);
                setIsSaved(true);
            }
        } catch (error) {
            console.error("Lỗi khi lưu playlist:", error);
        }
    };

    const handleTogglePrivacy = async () => {
        if (!playlist || isUpdatingPrivacy) return;
        
        // Nếu đang riêng tư -> muốn công khai: Hiện modal xác nhận (như hình 3)
        if (!playlist.congKhai) {
            setIsPrivacyConfirmOpen(true);
        } else {
            // Đang công khai -> riêng tư: Đổi luôn
            updatePrivacy(false);
        }
    };

    const updatePrivacy = async (isPublic) => {
        setIsUpdatingPrivacy(true);
        try {
            await updatePlaylistApi(playlist.id, {
                Ten: playlist.ten,
                CongKhai: isPublic
            });
            // Reload playlist
            await fetchPlaylist();
            refreshUser(); // Update sidebar
            setIsPrivacyConfirmOpen(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật quyền riêng tư:", error);
        } finally {
            setIsUpdatingPrivacy(false);
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
        <div className="flex flex-col h-full overflow-y-auto px-8 py-6 custom-main-scroll relative" data-lenis-prevent>
            {/* Blurred Background Image */}
            <div className="absolute top-0 left-0 right-0 h-[500px] z-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 blur-[80px] scale-110"
                    style={{ backgroundImage: `url(${imgUrl(playlist.anhBia || (playlist.topSongImages && playlist.topSongImages[0]))})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
            </div>
            
            <div className="relative z-10 flex flex-col w-full h-full"> 
                {/* Header */}
                <header className="flex gap-8 items-end mb-10 mt-4">
                    <div className="w-60 h-60 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-gray-900 border border-white/5 group relative">
                        {playlist.anhBia ? (
                            <img src={imgUrl(playlist.anhBia)} alt={playlist.ten} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                                {playlist.topSongImages && playlist.topSongImages.length >= 4 ? (
                                    <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                                        {playlist.topSongImages.slice(0, 4).map((img, i) => (
                                            <img key={i} src={imgUrl(img)} alt="" className="w-full h-full object-cover" />
                                        ))}
                                    </div>
                                ) : playlist.topSongImages && playlist.topSongImages.length > 0 ? (
                                    <img src={imgUrl(playlist.topSongImages[0])} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Music2 size={80} className="text-white/10" />
                                    </div>
                                )}
                            </div>
                        )}
                        {isOwner && (
                            <div 
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                            >
                                <Pencil size={32} className="text-white mb-2" />
                                <span className="text-xs font-black uppercase tracking-widest text-white">Chỉnh sửa</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            {playlist.congKhai && (
                                <p className="text-[14px] font-black text-white/60 uppercase tracking-tighter">Danh sách phát công khai</p>
                            )}
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Playlist</p>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{playlist.ten}</h1>
                        <div className="flex flex-col gap-4">
                            <p className="text-white/40 max-w-2xl font-medium leading-relaxed">{playlist.moTa || 'Danh sách phát dành cho bạn.'}</p>
                            <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest">
                                <span className="text-white hover:underline cursor-pointer">{playlist.creatorName || 'Người dùng'}</span>
                                <span className="text-white/20">•</span>
                                <span className="text-white/60">{playlist.songs?.length || 0} bài hát</span>
                                <span className="text-white/20">•</span>
                                <span className="text-white/40 italic">Mới cập nhật</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handlePlayToggle}
                            className="bg-white text-black h-12 px-8 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all font-bold shadow-lg"
                        >
                            {isCurrentPlaylist && isPlaying ? (
                                <Pause size={20} fill="black" className="text-black" />
                            ) : (
                                <Play size={20} fill="black" className="text-black" />
                            )}
                            <span className="text-sm">{isCurrentPlaylist && isPlaying ? 'Tạm dừng' : 'Phát'}</span>
                        </button>
                        
                        <button 
                            onClick={handleShufflePlay}
                            className="bg-white/10 text-white h-12 px-8 rounded-full flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all font-bold"
                        >
                            <Shuffle size={20} className="text-white" />
                            <span className="text-sm">Trình tự ngẫu nhiên</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        {!isOwner && (
                            <button 
                                onClick={handleToggleSave}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isSaved ? 'bg-[#0F5E8F]/10 border-[#0F5E8F]/20 text-[#0F5E8F] group-hover:bg-[#0F5E8F]/20' : 'bg-white/5 border-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
                                    <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${isSaved ? 'text-[#0F5E8F]' : 'text-white/40 group-hover:text-white'}`}>
                                    {isSaved ? 'Saved' : 'Save'}
                                </span>
                            </button>
                        )}

                        {isOwner && (
                            <>
                                <button 
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                                        <Pencil size={18} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white">Edit</span>
                                </button>

                                <button 
                                    onClick={handleTogglePrivacy}
                                    className="flex flex-col items-center gap-1 group"
                                >
                                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${playlist.congKhai ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 group-hover:bg-cyan-500/20' : 'bg-white/5 border-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
                                        {playlist.congKhai ? <Unlock size={18} /> : <Lock size={18} />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${playlist.congKhai ? 'text-cyan-500' : 'text-white/40 group-hover:text-white'}`}>
                                        {playlist.congKhai ? 'Public' : 'Private'}
                                    </span>
                                </button>
                            </>
                        )}

                        <button className="flex flex-col items-center gap-1 group">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                                <Share2 size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-all">Share</span>
                        </button>

                        <button 
                            onClick={handleOpenPlaylistMenu}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                                <MoreHorizontal size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-all">More</span>
                        </button>
                    </div>
                </div>

                {/* Song Table */}
                <div className="flex-1">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
                            <tr className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">
                                <th className="px-4 py-4 w-16 text-center">#</th>
                                <th className="px-4 py-4 w-[40%]">Tiêu đề</th>
                                <th className="px-4 py-4 w-[25%]">Nghệ sĩ</th>
                                <th className="px-4 py-4 w-[25%]">Album</th>
                                <th className="px-4 py-4 w-20 text-right"><Clock size={16} className="ml-auto" /></th>
                                <th className="px-4 py-4 w-24"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {playlist.songs?.map((song, idx) => (
                                <SongRow 
                                    key={song.id}
                                    song={song}
                                    idx={idx}
                                    isCurrent={currentSong?.id === song.id}
                                    isPlaying={isPlaying}
                                    likedSongIds={likedSongIds}
                                    onPlay={(s) => playSong(s, playlist.songs, { type: 'playlist', id: playlist.id, name: playlist.ten })}
                                    onToggleLike={toggleLike}
                                    onOpenMenu={handleOpenMenu}
                                />
                            ))}
                        </tbody>
                    </table>
                    {(!playlist.songs || playlist.songs.length === 0) && (
                        <div className="py-24 text-center">
                            <Plus size={64} className="mx-auto mb-6 text-white/5" />
                            <p className="text-white/20 font-black uppercase tracking-[0.2em]">Hãy thêm bài hát đầu tiên nào.</p>
                        </div>
                    )}
                </div>
                
                {/* Options Menu */}
                {menuConfig.open && (
                    <SongMenu 
                        song={menuConfig.song}
                        position={{ x: menuConfig.x, y: menuConfig.y }}
                        onClose={() => setMenuConfig({ ...menuConfig, open: false })}
                    />
                )}
                {/* Playlist Menu */}
                {playlistMenuOpen.open && (
                    <PlaylistMenu 
                        playlist={playlist}
                        position={{ x: playlistMenuOpen.x, y: playlistMenuOpen.y }}
                        onClose={() => setPlaylistMenuOpen({ ...playlistMenuOpen, open: false })}
                        isOwner={isOwner}
                        isSaved={isSaved}
                        onToggleSave={handleToggleSave}
                        onDelete={() => {/* handle delete */}}
                        onEdit={() => setIsEditModalOpen(true)}
                    />
                )}

                {/* Modals */}
                <CreatePlaylistModal 
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    playlist={playlist}
                    onSuccess={fetchPlaylist}
                />

                {/* Privacy Confirmation Modal (Image 3) */}
                {isPrivacyConfirmOpen && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsPrivacyConfirmOpen(false)} />
                        <div className="relative w-full max-w-[500px] bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in duration-300">
                            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-black text-white tracking-tight">Make it public</h2>
                                <button onClick={() => setIsPrivacyConfirmOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8">
                                <p className="text-[15px] font-bold text-white/60 leading-relaxed">
                                    Your playlist will be visible on your Profile and accessible by anyone.
                                </p>
                            </div>
                            <div className="px-8 py-6 bg-[#121212] flex justify-end gap-5">
                                <button 
                                    onClick={() => setIsPrivacyConfirmOpen(false)} 
                                    className="px-6 py-2.5 text-sm font-black text-white hover:text-white/80 transition-colors uppercase tracking-widest"
                                    disabled={isUpdatingPrivacy}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => updatePrivacy(true)}
                                    className="px-8 py-2.5 bg-white hover:bg-white/90 text-black text-sm font-black rounded-full transition-all active:scale-95 disabled:opacity-50"
                                    disabled={isUpdatingPrivacy}
                                >
                                    {isUpdatingPrivacy ? 'Confirming...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaylistView;
