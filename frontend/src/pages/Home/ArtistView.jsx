import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
    Play, Pause, Shuffle, Heart, MoreHorizontal, Share2,
    Wifi, Check, Plus, Clock
} from 'lucide-react';
import ImgFallback, { imgUrl } from '../../components/Common/ImgFallback';
import {
    getSongsApi, getAlbumsApi, getArtistByIdApi,
    followArtistApi, unfollowArtistApi, checkFollowArtistApi
} from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';
import SongRow from '../../components/MusicPlayer/SongRow';
import SongMenu from '../../components/MusicPlayer/SongMenu';

const ACCENT = '#0F5E8F';

const ArtistView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const { playSong, isPlaying, currentSong, likedSongIds, toggleLike, togglePlay } = useMusic();
    const [artist, setArtist] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSticky, setShowSticky] = useState(false);
    const [menuConfig, setMenuConfig] = useState({ open: false, x: 0, y: 0, song: null });
    const [isFollowed, setIsFollowed] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '' });
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchArtistData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [artRes, sRes, aRes] = await Promise.all([
                    getArtistByIdApi(id),
                    getSongsApi(null, 1, 50, id),
                    getAlbumsApi(null, 1, 10, id)
                ]);

                if (artRes) {
                    setArtist(artRes);
                    setFollowerCount(artRes.followerCount || 0);
                }

                const rawSongs = Array.isArray(sRes) ? sRes : (sRes?.data || []);
                const sorted = [...rawSongs].sort((a, b) => (b.luotNghe || 0) - (a.luotNghe || 0)).slice(0, 5);
                setTopTracks(sorted);

                setAlbums(Array.isArray(aRes) ? aRes : (aRes?.data || []));
                
                // Check follow status if logged in
                const userId = user?.id || user?.Id;
                if (userId) {
                    const fRes = await checkFollowArtistApi(id, userId);
                    setIsFollowed(fRes.isFollowed || fRes.data?.isFollowed || false);
                }
            } catch (error) {
                console.error("Error fetching artist data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtistData();
    }, [id, user]);

    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        setShowSticky(scrollTop > 420);
    };

    const handleShuffle = () => {
        if (!topTracks || topTracks.length === 0) return;
        const shuffled = [...topTracks].sort(() => Math.random() - 0.5);
        playSong(shuffled[0], shuffled);
    };

    const showNotify = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 4000);
    };

    const handleFollowToggle = async () => {
        const userId = user?.id || user?.Id;
        if (!userId) {
            alert("Vui lòng đăng nhập để theo dõi nghệ sĩ!");
            return;
        }
        try {
            if (isFollowed) {
                await unfollowArtistApi(id, userId);
                setIsFollowed(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
                showNotify(`Đã dừng theo dõi ${artist?.ten}`);
            } else {
                await followArtistApi(id, userId);
                setIsFollowed(true);
                setFollowerCount(prev => prev + 1);
                showNotify(`Bạn đã theo dõi ${artist?.ten}`);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            alert("Có lỗi xảy ra khi thực hiện thao tác này. Vui lòng kiểm tra lại database (cột follower_count).");
        }
    };

    // logic đồng bộ nút Play
    const isArtistPlaying = currentSong && topTracks.some(s => s.id === currentSong.id);
    const handleTogglePlay = () => {
        if (isArtistPlaying) {
            togglePlay();
        } else if (topTracks.length > 0) {
            playSong(topTracks[0], topTracks);
        }
    };

    const handleOpenMenu = (e, song) => {
        e.stopPropagation();
        setMenuConfig({ open: true, x: e.clientX, y: e.clientY, song });
    };

    if (loading) return <div className="p-10 animate-pulse text-white/20 uppercase font-black tracking-widest text-center mt-20">Đang tải thông tin nghệ sĩ...</div>;
    if (!artist) return <div className="p-10 text-white/40 uppercase font-black tracking-widest text-center mt-20">Không tìm thấy nghệ sĩ này.</div>;

    const artistImageUrl = imgUrl(artist.anhDaiDien) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80";

    return (
        <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-main-scroll relative bg-black"
            data-lenis-prevent
        >
            {/* Sticky Header - Use sticky top-0 to stay below main header */}
            <div className={`
                sticky top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl z-[100] px-8 flex items-center justify-between transition-all duration-500 border-b border-white/5
                ${showSticky ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
            `}>
                <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10">
                        <ImgFallback src={artistImageUrl} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-widest">{artist.ten}</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* One clean play/pause button that is synced */}
                    <button
                        onClick={handleTogglePlay}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg text-black"
                    >
                        {isArtistPlaying && isPlaying ? (
                            <Pause size={18} fill="black" />
                        ) : (
                            <Play size={18} fill="black" className="ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={handleShuffle}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-md border border-white/5"
                    >
                        <Shuffle size={18} />
                    </button>

                    <div className="h-6 w-[1px] bg-white/10 mx-2" />

                    <button 
                        onClick={handleFollowToggle}
                        className={`text-[10px] font-black uppercase border px-5 py-2 rounded-full transition-all ${isFollowed ? 'bg-[#0F5E8F] text-white border-[#0F5E8F]' : 'text-white border-white/20 hover:bg-white hover:text-black'}`}
                    >
                        {isFollowed ? 'Following' : 'Follow'}
                    </button>
                    <button className="text-white/40 hover:text-white">
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </div>

            {/* Background Layer (3 images) */}
            <div className="absolute top-0 left-0 right-0 h-[500px] flex overflow-hidden pointer-events-none">
                <div className="flex-1 relative">
                    <ImgFallback src={artistImageUrl} className="w-full h-full object-cover blur-3xl opacity-30 scale-150" />
                </div>
                <div className="w-[600px] h-full relative z-10">
                    <ImgFallback src={artistImageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                <div className="flex-1 relative">
                    <ImgFallback src={artistImageUrl} className="w-full h-full object-cover blur-3xl opacity-30 scale-150" />
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-20">
                {/* Hero Header */}
                <header className="h-[500px] flex flex-col justify-end pb-12 px-10">
                    <div className="flex flex-col gap-6">
                        <div className="max-w-4xl">
                            <h1 className="text-5xl font-black text-white uppercase tracking-[0.1em] drop-shadow-2xl">{artist.ten}</h1>
                            <div className="flex flex-col gap-3 mt-4">
                                <span className="text-[11px] font-black text-white/60 uppercase tracking-[0.2em]">{followerCount.toLocaleString()} fans</span>
                                <p className="text-white/80 text-[13px] leading-relaxed max-w-2xl font-medium line-clamp-2">
                                    {artist.tieuSu || "Grammy-nominated R&B artist is an elegant baritone vocalist with a thoughtful approach to songwriting..."}
                                    <span className="text-white ml-2 cursor-pointer font-black border-b border-transparent hover:border-white transition-all">Read more</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center mt-4 w-full">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleTogglePlay}
                                    className="bg-white text-black h-12 px-10 rounded-full flex items-center gap-3 hover:scale-105 active:scale-95 transition-all font-black shadow-xl"
                                >
                                    {isArtistPlaying && isPlaying ? (
                                        <Pause size={18} fill="black" />
                                    ) : (
                                        <Play size={18} fill="black" />
                                    )}
                                    <span className="text-xs uppercase tracking-widest">{isArtistPlaying && isPlaying ? 'Tạm dừng' : 'Phát'}</span>
                                </button>
                                <button
                                    onClick={handleShuffle}
                                    className="bg-white/10 text-white h-12 px-8 rounded-full flex items-center gap-3 hover:bg-white/20 active:scale-95 transition-all font-black backdrop-blur-md border border-white/5"
                                >
                                    <Shuffle size={18} />
                                    <span className="text-xs uppercase tracking-widest">Trình tự ngẫu nhiên</span>
                                </button>
                            </div>

                            {/* Căn sát lề phải hoàn toàn */}
                            <div className="flex items-center gap-10 ml-auto pr-6">
                                <button onClick={handleFollowToggle} className="flex flex-col items-center gap-1.5 group">
                                    <div className={`transition-all ${isFollowed ? 'text-[#0F5E8F]' : 'text-white/40 group-hover:text-white'}`}>
                                        {isFollowed ? <Check size={28} strokeWidth={3} /> : <Plus size={28} strokeWidth={2} />}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isFollowed ? 'text-[#0F5E8F]' : 'opacity-40 group-hover:opacity-100'}`}>
                                        {isFollowed ? 'Following' : 'Follow'}
                                    </span>
                                </button>

                                <button className="flex flex-col items-center gap-1.5 group text-white/40 hover:text-white transition-all">
                                    <Wifi size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Artist radio</span>
                                </button>

                                <button className="flex flex-col items-center gap-1.5 group text-white/40 hover:text-white transition-all">
                                    <Share2 size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">Share</span>
                                </button>

                                <button className="flex flex-col items-center gap-1.5 group text-white/40 hover:text-white transition-all">
                                    <MoreHorizontal size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100">More</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content area */}
                <div className="bg-black/40 backdrop-blur-3xl pt-10 px-10 pb-32 flex flex-col gap-20">
                    {/* Top Tracks */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-base font-black text-white uppercase tracking-[0.3em]">Top Tracks</h2>
                            <button className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors uppercase">View all</button>
                        </div>

                        <div className="flex-1">
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="text-white/20 text-[10px] uppercase font-black tracking-[0.2em] border-b border-white/5">
                                        <th className="px-4 py-4 w-16 text-center">#</th>
                                        <th className="px-4 py-4 w-[40%]">Title</th>
                                        <th className="px-4 py-4 w-[25%]">Artist</th>
                                        <th className="px-4 py-4 w-[25%]">Album</th>
                                        <th className="px-4 py-4 w-20 text-right"><Clock size={16} className="ml-auto" /></th>
                                        <th className="px-4 py-4 w-24"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topTracks.map((song, i) => (
                                        <SongRow
                                            key={song.id}
                                            song={song}
                                            idx={i}
                                            isCurrent={currentSong?.id === song.id}
                                            isPlaying={isPlaying}
                                            likedSongIds={likedSongIds}
                                            onPlay={(s) => playSong(s, topTracks)}
                                            onToggleLike={toggleLike}
                                            onOpenMenu={handleOpenMenu}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Albums */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-base font-black text-white uppercase tracking-[0.3em]">Albums</h2>
                            <button className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors uppercase">View all</button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-8 px-2">
                            {albums.map(album => (
                                <div key={album.id} className="group flex flex-col gap-4 cursor-pointer" onClick={() => navigate(`/home/album/${album.id}`)}>
                                    <div className="aspect-square relative rounded-xl overflow-hidden bg-white/5 shadow-2xl">
                                        <ImgFallback src={album.anhBia} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="w-12 h-12 rounded-full bg-black/50 hover:scale-105 transition-transform flex items-center justify-center backdrop-blur-sm">
                                                <Play size={20} fill="white" className="text-white ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-xs font-black text-white uppercase tracking-tighter truncate">{album.tieuDe}</h3>
                                            <div className="px-1 py-0.5 rounded bg-[#0F5E8F]/20 text-[#0F5E8F] text-[7px] font-black border border-[#0F5E8F]/20">ALBUM</div>
                                        </div>
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.1em]">{new Date(album.ngayPhatHanh).getFullYear()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Song Menu Context */}
            {menuConfig.open && (
                <SongMenu
                    song={menuConfig.song}
                    position={{ x: menuConfig.x, y: menuConfig.y }}
                    onClose={() => setMenuConfig({ ...menuConfig, open: false })}
                />
            )}

            {/* Notification Toast */}
            {toast.show && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[999] bg-white text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-6 duration-500 font-bold">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                        <Check size={14} strokeWidth={4} />
                    </div>
                    <p className="text-xs uppercase tracking-widest">{toast.message}</p>
                </div>
            )}
        </div>
    );
};

export default ArtistView;
