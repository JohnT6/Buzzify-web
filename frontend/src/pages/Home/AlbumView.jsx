import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Play, Pause, Heart, MoreHorizontal, Clock, 
    Music2, ChevronLeft, Shuffle, Share2, Copy, Plus, User
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
    const { playSong, currentSong, isPlaying, togglePlay, likedSongIds, toggleLike } = useMusic();
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
            playSong(album.songs[0], album.songs, { type: 'album', id: album.id, name: album.tieuDe });
        }
    };

    const isAlbumPlaying = currentSong && album?.songs?.some(s => s.id === currentSong.id);

    if (loading) return <div className="p-10 text-white/20 uppercase font-black tracking-widest text-center">Đang tải album...</div>;
    if (!album) return <div className="p-10 text-white/20 uppercase font-black tracking-widest text-center">Không tìm thấy album.</div>;

    return (
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-main-scroll relative" data-lenis-prevent>
            {/* Blurred Background Image (Image 1 style) */}
            <div className="absolute top-0 left-0 right-0 h-[600px] z-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 blur-[100px] scale-125"
                    style={{ backgroundImage: `url(${imgUrl(album.anhBia)})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
            </div>

            <div className="relative z-10 flex flex-col w-full h-full"> 
                {/* Header (Image 1 style) */}
                <header className="flex gap-12 items-end mb-12 mt-6">
                    <div className="w-64 h-64 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] group relative">
                        <ImgFallback src={album.anhBia} alt={album.tieuDe} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                             <h1 className="text-8xl font-black text-white tracking-widest uppercase leading-none">{album.tieuDe}</h1>
                             <div className="flex items-center gap-3 mt-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex items-center justify-center">
                                    <ImgFallback src={album.anhNgheSi || album.anhBia} className="w-full h-full object-cover" alt="" />
                                </div>
                                <span className="text-white font-bold text-sm tracking-widest uppercase hover:underline cursor-pointer">{album.artistName || 'Nghệ sĩ'}</span>
                             </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                                <span>{album.songs?.length || 0} tracks</span>
                                <span>(31:34)</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                                <span>{new Date(album.ngayPhatHanh).getFullYear()}</span>
                                <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[9px] border border-yellow-500/20">MAX</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                            <button 
                                onClick={handlePlayAlbum}
                                className="bg-white text-black h-12 px-10 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-widest text-xs"
                            >
                                <Play size={18} fill="black" /> Play
                            </button>
                            <button className="bg-white/10 text-white h-12 px-10 rounded-full flex items-center justify-center gap-2 hover:bg-white/20 active:scale-95 transition-all font-black uppercase tracking-widest text-xs border border-white/5 backdrop-blur-md">
                                <Shuffle size={18} /> Shuffle
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-10 mt-1">
                            <button onClick={handleToggleSave} className="flex flex-col items-center gap-1 group">
                                <Plus size={24} className="text-white/40 group-hover:text-white transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white">Add</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 group">
                                <Share2 size={24} className="text-white/40 group-hover:text-white transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white">Share</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 group">
                                <MoreHorizontal size={24} className="text-white/40 group-hover:text-white transition-all" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white">More</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Table Header (Image 1 style) */}
                <div className="px-4 py-3 border-b border-white/5 grid grid-cols-[32px_1fr_1fr_120px] gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">
                    <span className="text-center">#</span>
                    <span>Title</span>
                    <span>Artist</span>
                    <span className="text-right pr-6">Time</span>
                </div>

                {/* Songs List */}
                <div className="flex flex-col pb-24">
                    {album.songs?.map((song, i) => {
                        const isActive = currentSong?.id === song.id;
                        return (
                            <div 
                                key={song.id}
                                className={`
                                    group grid grid-cols-[32px_1fr_1fr_120px] gap-6 px-4 py-4 rounded-xl transition-all cursor-pointer items-center
                                    ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                                `}
                                onClick={() => playSong(song, album.songs, { type: 'album', id: album.id, name: album.tieuDe })}
                            >
                                <span className={`text-xs font-bold text-center ${isActive ? 'text-[#0F5E8F]' : 'text-white/20 group-hover:text-white/40'}`}>
                                    {i + 1}
                                </span>
                                <div>
                                    <p className={`text-sm font-black truncate ${isActive ? 'text-[#0F5E8F]' : 'text-white'} uppercase tracking-tighter`}>{song.tieuDe}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white/60 truncate uppercase tracking-tighter">{song.tenNgheSi}</p>
                                </div>
                                <div className="flex justify-end items-center gap-6">
                                    <span className="text-xs font-bold text-white/40 font-mono">
                                        {Math.floor(song.thoiLuongGiay / 60)}:{String(song.thoiLuongGiay % 60).padStart(2, '0')}
                                    </span>
                                    <button onClick={(e) => { e.stopPropagation(); }} className="opacity-0 group-hover:opacity-100 transition-all text-white/40 hover:text-white">
                                        <Plus size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                                        className={`opacity-0 group-hover:opacity-100 transition-all ${likedSongIds.has(song.id) ? 'opacity-100' : ''}`}
                                    >
                                        <Heart size={18} fill={likedSongIds.has(song.id) ? ACCENT : "none"} color={likedSongIds.has(song.id) ? ACCENT : "white"} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
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
