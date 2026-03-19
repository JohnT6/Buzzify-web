import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Play, Pause, Heart, MoreHorizontal, Clock, 
    Music2, ChevronLeft, Shuffle, Share2, Copy, Plus, User, Check
} from 'lucide-react';
import ImgFallback, { imgUrl } from '../../components/Common/ImgFallback';
import { 
    getAlbumByIdAsync, checkIfAlbumSavedApi, 
    saveAlbumApi, unsaveAlbumApi 
} from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';
import SongMenu from '../../components/MusicPlayer/SongMenu';

const ACCENT = '#0F5E8F';

const AlbumView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying, togglePlay, likedSongIds, toggleLike, setIsShuffle } = useMusic();
    const [album, setAlbum] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [menuConfig, setMenuConfig] = useState({ open: false, x: 0, y: 0, song: null });

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const [aRes, sRes] = await Promise.allSettled([
                    getAlbumByIdAsync(id),
                    checkIfAlbumSavedApi(id)
                ]);

                if (aRes.status === 'fulfilled') setAlbum(aRes.value);
                if (sRes.status === 'fulfilled') setIsSaved(sRes.value.isSaved);
            } catch (error) {
                console.error("Lỗi khi tải album:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlbum();
    }, [id]);

    const handleToggleSave = async () => {
        try {
            if (isSaved) await unsaveAlbumApi(id);
            else await saveAlbumApi(id);
            setIsSaved(!isSaved);
        } catch (error) {
            console.error("Lỗi khi lưu album:", error);
        }
    };

    const handlePlayAlbum = () => {
        if (album?.songs?.length > 0) {
            setIsShuffle(false);
            playSong(album.songs[0], album.songs, { type: 'album', id: album.id, name: album.tieuDe });
        }
    };

    const handleAlbumShuffle = () => {
        if (album?.songs?.length > 0) {
            setIsShuffle(true);
            const randomIdx = Math.floor(Math.random() * album.songs.length);
            playSong(album.songs[randomIdx], album.songs, { type: 'album', id: album.id, name: album.tieuDe });
        }
    };

    const isAlbumPlaying = currentSong && album?.songs?.some(s => s.id === currentSong.id);

    if (loading) return <div className="p-10 text-white/20 uppercase font-black tracking-widest text-center">Đang tải album...</div>;
    if (!album) return <div className="p-10 text-white/20 uppercase font-black tracking-widest text-center">Không tìm thấy album.</div>;

    return (
        <div className="flex flex-col h-full overflow-y-auto px-8 py-6 custom-main-scroll relative" data-lenis-prevent>
            {/* Background Image (No Blur, Playlist style) */}
            <div className="absolute top-0 left-0 right-0 h-[480px] z-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
                    style={{ backgroundImage: `url(${imgUrl(album.anhBia)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
            </div>

            <div className="relative z-10 flex flex-col w-full h-full"> 
                {/* Header (Playlist style) */}
                <header className="flex gap-8 items-end mb-10 mt-4">
                    <div className="w-60 h-60 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-gray-900 border border-white/5 group relative">
                        <ImgFallback src={album.anhBia} alt={album.tieuDe} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                             <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Album</p>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{album.tieuDe}</h1>
                        
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-white/60">
                                <div className="w-5 h-5 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                                    <ImgFallback src={album.anhNgheSi || album.anhBia} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="text-white hover:underline cursor-pointer">{album.artistName || 'Nghệ sĩ'}</span>
                                <span className="text-white/20">•</span>
                                <span>{album.songs?.length || 0} track{album.songs?.length !== 1 ? 's' : ''}</span>
                                <span className="text-white/20">•</span>
                                <span>{album.ngayPhatHanh ? new Date(album.ngayPhatHanh).getFullYear() : '2026'}</span>
                                <span className="text-white/20">•</span>
                                <span className="px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-[8px] font-black border border-yellow-500/30">MAX</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Primary Actions (Playlist style) */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handlePlayAlbum}
                            className="bg-white text-black h-12 px-8 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all font-bold shadow-lg"
                        >
                            {isAlbumPlaying && isPlaying ? (
                                <Pause size={20} fill="black" className="text-black" />
                            ) : (
                                <Play size={20} fill="black" className="text-black" />
                            )}
                            <span className="text-sm">{isAlbumPlaying && isPlaying ? 'Tạm dừng' : 'Phát'}</span>
                        </button>
                        
                        <button 
                            onClick={handleAlbumShuffle}
                            className="bg-white/10 text-white h-12 px-8 rounded-full flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all font-bold border border-white/5"
                        >
                            <Shuffle size={20} className="text-white" />
                            <span className="text-sm">Trình tự ngẫu nhiên</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-6">
                        <button 
                            onClick={handleToggleSave}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 focus:outline-none"
                            title={isSaved ? "Xóa khỏi thư viện" : "Lưu vào thư viện"}
                        >
                            <Heart size={20} fill={isSaved ? '#0F5E8F' : 'none'} color={isSaved ? '#0F5E8F' : 'currentColor'} className="transition-transform hover:scale-110" />
                        </button>

                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5">
                            <Share2 size={20} />
                        </button>

                        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                </div>

                {/* Song Table (Playlist style) */}
                <div className="flex-1">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
                            <tr className="text-white/40 text-[10px] uppercase font-black tracking-[0.2em]">
                                <th className="px-4 py-4 w-16 text-center">#</th>
                                <th className="px-4 py-4 w-[45%]">Tiêu đề</th>
                                <th className="px-4 py-4 w-[35%]">Nghệ sĩ</th>
                                <th className="px-4 py-4 w-20 text-right"><Clock size={16} className="ml-auto" /></th>
                                <th className="px-4 py-4 w-24"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02] pb-24">
                            {album.songs?.map((song, idx) => {
                                const isActive = currentSong?.id === song.id;
                                return (
                                    <tr 
                                        key={song.id}
                                        onClick={() => playSong(song, album.songs, { type: 'album', id: album.id, name: album.tieuDe })}
                                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="px-4 py-4 text-center align-middle">
                                            {isActive ? (
                                                <div className="flex items-end justify-center gap-[2px] h-4 w-4 mx-auto">
                                                    <div className={`w-[2px] bg-[#0F5E8F] ${isPlaying ? 'animate-music-bar-1' : 'h-1'}`} />
                                                    <div className={`w-[2px] bg-[#0F5E8F] ${isPlaying ? 'animate-music-bar-2' : 'h-2'}`} />
                                                    <div className={`w-[2px] bg-[#0F5E8F] ${isPlaying ? 'animate-music-bar-3' : 'h-1.5'}`} />
                                                </div>
                                            ) : (
                                                <span className="text-[11px] font-bold text-white/30">{song.trackNumber || idx + 1}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 align-middle">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                                                    <ImgFallback src={song.anhBia} alt={song.tieuDe} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-black truncate uppercase tracking-tight ${isActive ? 'text-[#0F5E8F]' : 'text-white'}`}>{song.tieuDe}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 align-middle">
                                            <p className="text-xs font-black text-white/50 truncate uppercase tracking-tight group-hover:text-white/80 transition-colors">
                                                {song.tenNgheSi}{song.ngheSiHopTac ? `, ${song.ngheSiHopTac}` : ''}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 align-middle text-right">
                                            <span className="text-[10px] font-bold text-white/30 font-mono">
                                                {Math.floor((song.thoiLuongGiay || 0) / 60)}:{String((song.thoiLuongGiay || 0) % 60).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 align-middle text-right">
                                            <div className={`flex items-center justify-end gap-4 transition-opacity ${likedSongIds.has(song.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                                    className="hover:scale-110 transition-transform active:scale-95"
                                                >
                                                    <Heart size={16} fill={likedSongIds.has(song.id) ? '#0F5E8F' : "none"} color="currentColor" className={likedSongIds.has(song.id) ? '' : 'text-white/40 hover:text-white transition-colors'} strokeWidth={likedSongIds.has(song.id) ? 0 : 2} />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setMenuConfig({ open: true, x: e.clientX, y: e.clientY, song: song }); }}
                                                    className="text-white/30 hover:text-white transition-colors"
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Context Menu */}
            {menuConfig.open && (
                <SongMenu 
                    song={menuConfig.song}
                    position={{ x: menuConfig.x, y: menuConfig.y }}
                    onClose={() => setMenuConfig({ ...menuConfig, open: false })}
                />
            )}
        </div>
    );
};

export default AlbumView;
