import React, { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Search, Home as HomeIcon, LayoutGrid, Heart, Library,
    ChevronLeft, ChevronRight, Play, MoreHorizontal, Music2, Lock, ArrowUp
} from 'lucide-react';
import { logoutApi, getCurrentUserApi, getSongsApi, getPlaylistsApi, getAlbumsApi } from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';
import SongMenu from '../../components/MusicPlayer/SongMenu';
import ImgFallback, { imgUrl } from '../../components/Common/ImgFallback';

/* ─── Màu chủ đạo theo logo = #0F5E8F (buzzify blue) ───────────────────────── */
const ACCENT = '#0F5E8F';

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const fmt = (s) => { 
    if (!s) return '0:00'; 
    const m = Math.floor(s / 60); 
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, '0')}`; 
};

/* ─── Song Card (New Releases) ───────────────────────────────────────────────── */

/* ─── Song Card (New Releases) ───────────────────────────────────────────────── */
/* ─── Album Card (New Releases) ───────────────────────────────────────────────── */
const AlbumCard = ({ album, onClick }) => {
    const navigate = useNavigate();
    return (
        <div className="flex-shrink-0 w-44 group cursor-pointer transition-all" onClick={() => onClick(album)}>
            <div className="relative w-44 h-44 rounded-md overflow-hidden mb-2.5 bg-gray-800">
                <ImgFallback src={album.anhBia} alt={album.tieuDe} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-black/50 hover:scale-105 transition-transform flex items-center justify-center backdrop-blur-sm">
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
                <p className="text-sm font-bold text-white truncate max-w-[130px] uppercase tracking-tighter">{album.tieuDe}</p>
                <div className="px-1.5 py-0.5 rounded bg-[#0F5E8F]/20 text-[#0F5E8F] text-[8px] font-black border border-[#0F5E8F]/20">ALBUM</div>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5 uppercase tracking-widest font-medium opacity-60 hover:text-white hover:opacity-100 transition-all"
               onClick={(e) => { 
                   if (album.artistId) { e.stopPropagation(); navigate(`/home/artist/${album.artistId}`); }
               }}>
                {album.artistName || 'Nghệ sĩ'}
            </p>
        </div>
    );
};

/* ─── Song Card ───────────────────────────────────────────────────────────── */
const SongCard = ({ song, onPlay }) => {
    const navigate = useNavigate();
    const artistName = song.tenNgheSi + (song.ngheSiHopTac ? `, ${song.ngheSiHopTac}` : '');
    const cover = song.anhBia;

    return (
        <div className="flex-shrink-0 w-44 group cursor-pointer transition-all" onClick={() => onPlay(song)}>
            <div className="relative w-44 h-44 rounded-md overflow-hidden mb-2.5 bg-gray-800">
                <ImgFallback src={cover} alt={song.tieuDe} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-12 h-12 rounded-full bg-black/50 hover:scale-105 transition-transform flex items-center justify-center backdrop-blur-sm">
                        <Play size={20} fill="white" className="text-white ml-0.5" />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
                <p className="text-sm font-bold text-white truncate max-w-[130px]">{song.tieuDe}</p>
                <ArrowUp size={12} className="text-gray-400 flex-shrink-0" />
                <Lock size={12} className="text-gray-400 flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5 hover:text-white transition-colors"
               onClick={(e) => {
                   if (song.artistId) { e.stopPropagation(); navigate(`/home/artist/${song.artistId}`); }
               }}>
                {artistName}
            </p>
        </div>
    );
};

/* ─── Mix Card (Custom Mixes) ───────────────────────────────────────────────── */
const MixCard = ({ playlist, onClick }) => {
    const [isLoved, setIsLoved] = useState(false);
    return (
        <div className="flex-shrink-0 w-48 group cursor-pointer transition-all" onClick={() => onClick(playlist)}>
            <div className="relative w-48 h-48 rounded-md overflow-hidden mb-3 bg-gray-800">
                <ImgFallback src={playlist.anhBia} alt={playlist.ten} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100">
                    <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-white hover:scale-105 transition-transform flex items-center justify-center shadow-lg">
                        <Play size={18} fill="black" className="text-black ml-0.5" />
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsLoved(!isLoved); }}
                        className="absolute bottom-4 right-3 hover:scale-110 transition-transform cursor-pointer">
                        <Heart size={22} fill={isLoved ? ACCENT : "none"} color={isLoved ? ACCENT : "white"} />
                    </button>
                </div>
            </div>
            <p className="text-base font-bold text-white truncate">{playlist.ten}</p>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed" style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{playlist.moTa || 'Mix playlist dành riêng cho bạn định kỳ.'}</p>
        </div>
    );
};

/* ─── You May Like avatar circle ─────────────────────────────────────────────── */
/* ─── You May Like avatar circle ─────────────────────────────────────────────── */
/* ─── You May Like avatar circle ─────────────────────────────────────────────── */
const ArtistCircle = ({ song, onClick }) => {
    const navigate = useNavigate();
    const name = song.tenNgheSi || song.tieuDe;
    const cover = song.anhNgheSi || song.anhBia;
    return (
        <div className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group w-[72px]" onClick={() => onClick(song)}>
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 ring-2 ring-transparent group-hover:ring-white/30 transition-all">
                <ImgFallback src={cover} alt={name} className="w-full h-full group-hover:scale-110 transition-transform duration-300" iconSize={20} />
            </div>
            <p className="text-[11px] font-medium text-gray-300 text-center leading-tight line-clamp-2 group-hover:text-white transition-colors">{name}</p>
        </div>
    );
};

/* ─── Top Stream Row ─────────────────────────────────────────────────────────── */
const TopStreamRow = ({ song, idx, onPlay, onOpenMenu, isLiked, onToggleLike }) => {
    const navigate = useNavigate();
    const ACCENT = '#0F5E8F';
    return (
        <div className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-white/5 group cursor-pointer transition-colors" onClick={() => onPlay(song)}>
            <span className="text-xs text-gray-600 w-4 text-right font-medium">{idx + 1}</span>
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-white/5">
                <ImgFallback src={song.anhBia} alt={song.tieuDe} className="w-full h-full" iconSize={14} />
            </div>
            <div className="flex-1 min-w-0 ml-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{song.tieuDe}</p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5 hover:text-white transition-colors"
                   onClick={(e) => {
                       if (song.artistId) { e.stopPropagation(); navigate(`/home/artist/${song.artistId}`); }
                   }}>
                    {song.tenNgheSi}{song.ngheSiHopTac ? `, ${song.ngheSiHopTac}` : ''}
                </p>
            </div>
            <div className={`flex items-center gap-3 transition-all ${isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLike(song); }}
                    className="hover:scale-110 transition-transform active:scale-95"
                >
                    <Heart size={14} fill={isLiked ? ACCENT : "none"} color={isLiked ? ACCENT : "white"} strokeWidth={isLiked ? 0 : 2} />
                </button>
                <span className="text-[11px] text-gray-600 font-medium">{fmt(song.thoiLuongGiay)}</span>
                <button 
                    className="text-gray-700 hover:text-gray-300 transition-all cursor-pointer"
                    onClick={(e) => onOpenMenu(e, song)}
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>
            <span className="text-[11px] text-gray-600 group-hover:hidden">{fmt(song.thoiLuongGiay)}</span>
        </div>
    );
};

/* ─── Recently Played Row ───────────────────────────────────────────────────── */
const RecentRow = ({ song, idx, onPlay, onOpenMenu, isLiked, onToggleLike }) => {
    const navigate = useNavigate();
    const ACCENT = '#0F5E8F';
    return (
        <div className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-white/5 group cursor-pointer transition-colors" onClick={() => onPlay(song)}>
            <span className="text-sm text-gray-600 w-5 text-center">{idx + 1}</span>
            <div className="w-9 h-9 rounded-md overflow-hidden bg-gray-800 flex-shrink-0 border border-white/5">
                <ImgFallback src={song.anhBia} alt={song.tieuDe} className="w-full h-full" iconSize={13} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{song.tieuDe}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5 hover:text-white transition-colors"
                   onClick={(e) => {
                       if (song.artistId) { e.stopPropagation(); navigate(`/home/artist/${song.artistId}`); }
                   }}>
                    {song.tenNgheSi}{song.ngheSiHopTac ? `, ${song.ngheSiHopTac}` : ''}
                </p>
            </div>
            <p className="text-xs text-gray-500 hidden lg:block truncate max-w-[120px] italic">{song.ngheSiHopTac || ''}</p>
            
            <div className={`flex items-center gap-5 transition-all ${isLiked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleLike(song); }}
                    className="hover:scale-110 transition-transform active:scale-95"
                >
                    <Heart size={16} fill={isLiked ? ACCENT : "none"} color={isLiked ? ACCENT : "white"} strokeWidth={isLiked ? 0 : 2} />
                </button>
                <span className="text-xs text-gray-500">{fmt(song.thoiLuongGiay)}</span>
                <button 
                    className="text-gray-700 hover:text-white transition-all cursor-pointer"
                    onClick={(e) => onOpenMenu(e, song)}
                >
                    <MoreHorizontal size={14} />
                </button>
            </div>
            <span className="text-xs text-gray-500 group-hover:hidden">{fmt(song.thoiLuongGiay)}</span>
        </div>
    );
};

/* ─── Categories ────────────────────────────────────────────────────────────── */
const CATS = [
    { name: 'Pop', cls: 'from-violet-600 to-violet-900', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&q=60' },
    { name: 'Chill', cls: 'from-pink-600 to-pink-900', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=60' },
    { name: 'Podcast', cls: 'from-orange-500 to-orange-900', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=100&q=60' },
    { name: 'Xmas', cls: 'from-green-600 to-green-900', img: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=100&q=60' },
    { name: 'Romance', cls: 'from-red-600 to-red-900', img: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=100&q=60' },
    { name: 'Hip Hop', cls: 'from-gray-500 to-gray-900', img: 'https://images.unsplash.com/photo-1571609860994-11fd4f673e66?w=100&q=60' },
];

/* ─── Section Header & Horizontal ScrollWrapper ─────────────────────────────── */
const SectionRow = ({ title, children, showViewAll = true }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    };

    const scroll = (dir) => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.clientWidth * 0.8;
        scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    };

    // Cập nhật mũi tên
    useEffect(() => { handleScroll(); }, [children]);

    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => scroll('left')} disabled={!canScrollLeft} className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <ChevronLeft size={18} className="text-white" />
                        </button>
                        <button onClick={() => scroll('right')} disabled={!canScrollRight} className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <ChevronRight size={18} className="text-white" />
                        </button>
                    </div>
                    {showViewAll && <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">View all</button>}
                </div>
            </div>
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar">
                {children}
            </div>
        </section>
    );
};

/* ─── Banner Slider ──────────────────────────────────────────────────────────── */
const GENRES = ['R&B', 'Pop', 'Rap', 'Ballad', 'Country', 'Hip Hop'];

const BannerSlider = ({ items, onPlay }) => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-play 3s
    useEffect(() => {
        if (!items || items.length === 0) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % items.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [items?.length]);

    if (!items || items.length === 0) return null;

    const currentItem = items[currentSlide];
    // Lấy danh sách tất cả các thể loại có mặt trong các album để hiển thị menu bên trái
    const allGenres = Array.from(new Set(items.flatMap(item => item.genreNames || []))).slice(0, 6);
    // Nếu không có thể loại nào từ DB, dùng mặc định để UI không trống
    const displayGenres = allGenres.length > 0 ? allGenres : GENRES;

    return (
        <div className="relative rounded-2xl overflow-hidden h-[450px] mb-10 bg-[#0f0f0f] flex group border border-white/5 shadow-2xl">
            {/* Full Background Image */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${imgUrl(currentItem.anhBia) || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80'})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            <div className="relative z-10 w-full h-full">
                {/* Bottom Left: Sidebar Genres (Nhỏ lại) */}
                <div className="absolute bottom-10 left-10 flex flex-col gap-1.5 focus:outline-none">
                    {displayGenres.map((g, i) => {
                        // Nhấn vào thể loại sẽ tìm album đầu tiên có thể loại đó
                        const targetIndex = items.findIndex(item => item.genreNames?.includes(g));
                        // Chỉ so khớp thể loại đầu tiên của album hiện tại để highlight
                        const isActive = currentItem.genreNames?.[0] === g;

                        return (
                            <div key={g} onClick={() => targetIndex !== -1 && setCurrentSlide(targetIndex)}
                                className={`flex items-center gap-3 py-1 cursor-pointer group/item transition-all select-none`}>
                                <div className={`w-1 h-1 rounded-full transition-all ${isActive ? 'bg-[#0F5E8F] scale-125' : 'bg-transparent group-hover/item:bg-white/30'}`} />
                                <span className={`text-[13px] tracking-wide transition-colors ${isActive ? 'text-white font-bold drop-shadow-md' : 'text-gray-400 font-medium group-hover/item:text-gray-200'}`}>
                                    {g}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Right: Banner Area */}
                <div className="absolute bottom-10 right-10 flex flex-col items-end text-right max-w-xl">
                    <h2 
                        onClick={() => navigate(`/home/album/${currentItem.id}`)}
                        className="text-4xl md:text-5xl font-extrabold text-white mb-1 tracking-tight drop-shadow-2xl truncate w-full cursor-pointer hover:underline"
                    >
                        {currentItem.tieuDe || 'Album'}
                    </h2>
                    <p className="text-lg text-gray-300 mb-6 font-medium drop-shadow-md">{currentItem.artistName || 'Nghệ sĩ'}</p>

                    <div className="flex items-center gap-5">
                        <button className="text-gray-300 hover:text-white transition-colors cursor-pointer active:scale-95">
                            <MoreHorizontal size={26} />
                        </button>
                        <button className="text-gray-300 hover:text-white transition-colors cursor-pointer active:scale-95">
                            <Heart size={26} />
                        </button>
                        <button onClick={() => onPlay(currentItem)} className="flex items-center justify-center w-12 h-12 rounded-full text-white transition-all hover:scale-110 active:scale-95 cursor-pointer ml-3 shadow-[0_0_20px_rgba(15,94,143,0.5)]" style={{ background: ACCENT }}>
                            <Play size={22} fill="white" className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Skeleton ───────────────────────────────────────────────────────────────── */
const Skeleton = ({ className }) => <div className={`bg-white/5 rounded-lg animate-pulse ${className}`} />;

/* ─── Main ───────────────────────────────────────────────────────────────────── */
const MusicHome = () => {
    const navigate = useNavigate();
    const { playSong, likedSongIds, toggleLike } = useMusic();
    const [user, setUser] = useState(null);
    const [songs, setSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeNav, setActiveNav] = useState('home');
    const [menuConfig, setMenuConfig] = useState({ open: false, x: 0, y: 0, song: null });

    const handleOpenMenu = (e, song) => {
        e.stopPropagation();
        setMenuConfig({
            open: true,
            x: e.clientX,
            y: e.clientY,
            song: song
        });
    };

    useEffect(() => {
        (async () => {
            try {
                const [uRes, sRes, pRes, aRes] = await Promise.allSettled([
                    getCurrentUserApi(), getSongsApi(null, 1, 30), getPlaylistsApi(), getAlbumsApi(null, 1, 10)
                ]);
                if (uRes.status === 'fulfilled') setUser(uRes.value);
                if (sRes.status === 'fulfilled') {
                    const d = sRes.value;
                    setSongs(Array.isArray(d) ? d : (d?.data || []));
                }
                if (pRes.status === 'fulfilled') {
                    const p = pRes.value;
                    setPlaylists(Array.isArray(p) ? p : (p?.data || []));
                }
                if (aRes.status === 'fulfilled') {
                    const a = aRes.value;
                    setAlbums(Array.isArray(a) ? a : (a?.data || []));
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const handlePlay = (song) => {
        if (!song) return;
        // If it's an album, we might want to play its first song or similar
        // For now, let's treat it as a single song if possible
        playSong(song, songs, { type: 'home', name: 'Trang chủ' });
    };

    const newReleases = albums.slice(0, 8);
    const youMayLike = songs.slice(8, 16);
    const recent = songs.slice(16, 22);
    const topStreams = songs.slice(0, 7);

    return (
        <div className="flex-1 flex min-h-0 overflow-hidden">

            {/* Scrollable main */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-8 py-6 h-full custom-main-scroll" data-lenis-prevent>

                {/* Banner Slider */}
                <BannerSlider items={albums.length > 0 ? albums : songs.slice(0, 6)} onPlay={handlePlay} />

                {/* Phát hành mới nhất (Albums) */}
                <SectionRow title="Phát hành mới nhất" showViewAll={true}>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex-shrink-0 w-44"><Skeleton className="w-44 h-44 mb-2.5" /><Skeleton className="h-4 w-28" /></div>)
                    ) : (
                        newReleases.map(alb => <AlbumCard key={alb.id} album={alb} onClick={(a) => navigate(`/home/album/${a.id}`)} />)
                    )}
                </SectionRow>

                {/* Custom mixes */}
                {playlists.filter(p => (p.congKhai === true || p.idNguoiTao === user?.id) && !(p.ten?.toLowerCase().includes('thích') || p.loaiPlaylist === 'liked')).length > 0 && (
                    <SectionRow title="Custom mixes" showViewAll={true}>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex-shrink-0 w-48"><Skeleton className="w-48 h-48 mb-3" /><Skeleton className="h-4 w-32" /></div>)
                        ) : (
                            playlists.filter(p => (p.congKhai === true || p.idNguoiTao === user?.id) && !(p.ten?.toLowerCase().includes('thích') || p.loaiPlaylist === 'liked')).map(p => (
                                <MixCard key={p.id} playlist={p} onClick={(p) => navigate(`/home/playlist/${p.id}`)} />
                            ))
                        )}
                    </SectionRow>
                )}

                {/* Nghệ sĩ yêu thích */}
                {youMayLike.length > 0 && (
                    <section className="mb-10">
                        <SectionRow title="Nghệ sĩ yêu thích" showViewAll={false}>
                            {youMayLike.map(s => (
                                <ArtistCircle 
                                    key={s.id} 
                                    song={s} 
                                    onClick={(song) => {
                                        if (song.artistId) navigate(`/home/artist/${song.artistId}`);
                                        else console.warn("No artistId found for song", song);
                                    }} 
                                />
                            ))}
                        </SectionRow>
                    </section>
                )}

                {/* Recently Played */}
                {recent.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">Đã nghe gần đây</h2>
                        </div>
                        <div className="space-y-0.5 max-w-4xl">
                            {recent.map((s, i) => (
                                <RecentRow 
                                    key={s.id} 
                                    song={s} 
                                    idx={i} 
                                    onPlay={handlePlay} 
                                    onOpenMenu={handleOpenMenu}
                                    isLiked={likedSongIds.has(s.id)}
                                    onToggleLike={toggleLike}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Right Column */}
            <div className="flex-shrink-0 overflow-y-auto px-4 py-5 hide-scrollbar h-full" style={{ width: '320px', background: '#0a0a0a', borderLeft: '1px solid rgba(255,255,255,0.05)' }} data-lenis-prevent>

                {/* Top Streams */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white">Top Streams</h3>
                        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {['Local', 'Global'].map((t, i) => (
                                <button key={t} className="text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all"
                                    style={i === 0 ? { background: ACCENT, color: '#fff' } : { color: '#666' }}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-3 items-center py-2"><Skeleton className="w-4 h-4" /><Skeleton className="w-9 h-9 rounded-lg" /><div className="flex-1"><Skeleton className="h-3 mb-1" /><Skeleton className="h-2.5 w-16" /></div></div>)
                        : topStreams.map((s, i) => (
                            <TopStreamRow 
                                key={s.id} 
                                song={s} 
                                idx={i} 
                                onPlay={handlePlay} 
                                onOpenMenu={handleOpenMenu}
                                isLiked={likedSongIds.has(s.id)}
                                onToggleLike={toggleLike}
                            />
                        ))
                    }
                </div>

                {/* Categories */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white">Thể loại</h3>
                        <button className="text-[11px] font-medium hover:underline" style={{ color: ACCENT }}>Xem tất cả</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {CATS.map(c => (
                            <div key={c.name} className={`relative rounded-xl overflow-hidden h-16 cursor-pointer bg-gradient-to-br ${c.cls} hover:scale-[1.03] transition-transform`}>
                                <img src={c.img} alt={c.name} className="absolute right-0 bottom-0 w-14 h-14 object-cover opacity-50" />
                                <div className="absolute inset-0 p-3 flex items-start">
                                    <span className="text-sm font-bold text-white drop-shadow">{c.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Options Menu */}
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

export default MusicHome;
