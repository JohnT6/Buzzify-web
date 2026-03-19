import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { 
    Play, Shuffle, Heart, MoreHorizontal, Share2, 
    Wifi, Check, Plus
} from 'lucide-react';
import ImgFallback, { imgUrl } from '../../components/Common/ImgFallback';
import { 
    getSongsApi, getAlbumsApi, getArtistByIdApi
} from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';
import SongRow from '../../components/MusicPlayer/SongRow';

const ArtistView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const { playSong, isPlaying, currentSong, likedSongIds, toggleLike } = useMusic();
    const [artist, setArtist] = useState({ name: 'Bruno Mars', fans: '2.1M', bio: 'Bruno Mars is a 16x GRAMMY®-winning global superstar...' });
    const [topTracks, setTopTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtistData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [artRes, sRes, aRes] = await Promise.all([
                    getArtistByIdApi(id),
                    getSongsApi(null, 1, 10, id),
                    getAlbumsApi(null, 1, 10, id)
                ]);
                
                if (artRes) setArtist({
                    name: artRes.ten,
                    fans: artRes.luotTheoDoi || '0',
                    bio: artRes.tieuSu || 'Không có tiểu sử.'
                });

                setTopTracks(Array.isArray(sRes) ? sRes : (sRes?.data || []));
                setAlbums(Array.isArray(aRes) ? aRes : (aRes?.data || []));
            } catch (error) {
                console.error("Error fetching artist data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtistData();
    }, [id]);

    if (loading) return <div className="p-10 animate-pulse">Loading artist...</div>;

    return (
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-main-scroll" data-lenis-prevent>
            {/* Hero Banner (Image 2) */}
            <header className="relative h-[400px] mb-10 rounded-2xl overflow-hidden group">
                <ImgFallback 
                    src={artist.anhDaiDien || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80"} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt={artist.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4">
                    <h1 className="text-7xl font-black text-white tracking-widest uppercase">{artist.name}</h1>
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <p className="text-white font-bold text-sm tracking-widest uppercase">{artist.fans} fans</p>
                        <p className="text-white/60 text-sm leading-relaxed font-medium">
                            {artist.bio} <span className="text-white cursor-pointer hover:underline">Read more</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-6 mt-4">
                        <button className="bg-white text-black h-12 px-10 rounded-full flex items-center gap-2 hover:scale-105 active:scale-95 transition-all font-black uppercase text-xs">
                            <Play size={18} fill="black" /> Play
                        </button>
                        <button className="bg-white/10 text-white h-12 px-10 rounded-full flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all font-black uppercase text-xs border border-white/10 backdrop-blur-md">
                            <Shuffle size={18} /> Shuffle
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                             <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-all">
                                <Check size={18} />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Follow</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                             <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-all">
                                <Wifi size={18} />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Artist radio</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                             <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-all">
                                <Share2 size={18} />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">Share</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                             <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-all">
                                <MoreHorizontal size={18} />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">More</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content sections */}
            <div className="flex flex-col gap-16 px-10 pb-24">
                {/* Top Tracks Section */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Top Tracks</h2>
                        <button className="text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">View all</button>
                    </div>
                    
                    <div className="flex flex-col">
                        {/* Table Header */}
                        <div className="grid grid-cols-[32px_1fr_1fr_120px] gap-6 px-4 py-3 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">
                            <span className="text-center">#</span>
                            <span>Title</span>
                            <span>Album</span>
                            <span className="text-right pr-6">Time</span>
                        </div>

                        {topTracks.map((song, i) => {
                            const isActive = currentSong?.id === song.id;
                            return (
                                <div 
                                    key={song.id}
                                    className={`
                                        group grid grid-cols-[32px_1fr_1fr_120px] gap-6 px-4 py-4 rounded-xl transition-all cursor-pointer items-center
                                        ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                                    `}
                                    onClick={() => playSong(song, topTracks)}
                                >
                                    <span className={`text-xs font-bold text-center ${isActive ? 'text-[#0F5E8F]' : 'text-white/20 group-hover:text-white/40'}`}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-black truncate ${isActive ? 'text-[#0F5E8F]' : 'text-white'} uppercase tracking-tighter`}>{song.tieuDe}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white/60 truncate uppercase tracking-tighter">{song.tenAlbum || 'N/A'}</p>
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
                </section>

                {/* Albums Section (Image 2 style) */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Albums</h2>
                        <button className="text-xs font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">View all</button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {albums.map(album => (
                            <div key={album.id} className="group cursor-pointer flex flex-col gap-4" onClick={() => navigate(`/home/album/${album.id}`)}>
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-900 shadow-xl transition-transform duration-500 group-hover:scale-[1.03] relative">
                                    <img src={imgUrl(album.anhBia)} className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80" alt={album.tieuDe} />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <Play size={24} fill="black" className="ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 px-1">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter truncate">{album.tieuDe}</h3>
                                    <p className="text-xs font-black text-white/40 uppercase tracking-widest">{new Date(album.ngayPhatHanh).getFullYear()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ArtistView;
