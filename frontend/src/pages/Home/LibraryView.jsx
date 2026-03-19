import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    Heart, Music2, Play, Plus, Clock, 
    MoreHorizontal, Disc, User, LayoutGrid
} from 'lucide-react';
import { 
    getLikedPlaylistApi, getSavedPlaylistsApi, 
    getPlaylistsApi, getAlbumsApi, getSavedAlbumsApi,
    getMyPlaylistsApi
} from '../../services/api_services';
import { useMusic } from '../../context/MusicContext';

const ACCENT = '#0F5E8F';

const API_BASE = import.meta.env.VITE_API_URL || '';
const imgUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    return `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
};

const LibraryCard = ({ item, type, onClick, onEdit }) => {
    const isLikedSongs = type === 'liked';
    const isOwner = type === 'playlist' && item.idNguoiTao === item.currentUserId; 
    const title = isLikedSongs ? 'Bài hát đã thích' : (item.ten || item.tieuDe);
    const creator = isLikedSongs ? 'Bạn' : (item.creatorName || item.artistName || 'Artist'); 
    
    const count = isLikedSongs ? (item.songs?.length || 0) : (item.songCount || 0);
    const footerText = `${count} ${type === 'album' ? 'ALBUMS' : 'TRACKS'}`;

    const renderThumbnail = () => {
        if (isLikedSongs) {
            return (
                <div className="w-full h-full bg-gradient-to-br from-indigo-700 to-emerald-500 flex items-center justify-center">
                    <Heart size={64} fill="white" className="text-white" />
                </div>
            );
        }

        if (item.anhBia) {
            return <img src={imgUrl(item.anhBia)} className="w-full h-full object-cover" alt={title} />;
        }

        const images = item.topSongImages || [];
        if (images.length >= 4) {
            return (
                <div className="grid grid-cols-2 w-full h-full">
                    {images.slice(0, 4).map((src, i) => (
                        <img key={i} src={imgUrl(src)} className="w-full h-full object-cover" alt="" />
                    ))}
                </div>
            );
        }

        if (images.length > 0) {
            return <img src={imgUrl(images[0])} className="w-full h-full object-cover" alt={title} />;
        }

        // Placeholder for empty (Like Image 2 "haha")
        return (
            <div className="w-full h-full bg-[#1a1a1a] flex flex-col items-center justify-center opacity-20">
                <div className="relative">
                    <Music2 size={80} strokeWidth={1} />
                    <div className="absolute top-1/2 left-full -translate-y-1/2 ml-4 flex flex-col gap-2">
                        <div className="w-12 h-1 bg-white/40 rounded-full" />
                        <div className="w-8 h-1 bg-white/40 rounded-full" />
                        <div className="w-10 h-1 bg-white/40 rounded-full" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div 
            onClick={onClick}
            className="transition-all cursor-pointer group flex flex-col gap-3 relative"
        >
            <div className="relative aspect-square rounded-lg overflow-hidden shadow-xl bg-gray-900">
                {renderThumbnail()}
                {/* Hover overlay content (Image 3) */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                            <Play size={18} fill="black" className="text-black ml-1" />
                        </div>
                        <div className="flex gap-0.5">
                            <div className="w-1 h-1 bg-white rounded-full" />
                            <div className="w-1 h-1 bg-white rounded-full" />
                            <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 px-1">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-white truncate uppercase tracking-tighter leading-tight flex-1">{title}</h3>
                </div>
                
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white/60 truncate">{creator}</p>
                    {onEdit && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="text-[9px] font-black text-[#00ffcc] uppercase tracking-widest hover:underline"
                        >
                            Thay đổi
                        </button>
                    )}
                </div>
                
                <div className="mt-0.5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{footerText}</p>
                </div>
            </div>
        </div>
    );
};

const LibraryView = () => {
    const navigate = useNavigate();
    const { user } = useOutletContext();
    const { playSong } = useMusic();
    const [likedPlaylist, setLikedPlaylist] = useState(null);
    const [myPlaylists, setMyPlaylists] = useState([]);
    const [savedPlaylists, setSavedPlaylists] = useState([]);
    const [savedAlbums, setSavedAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchLibrary = async () => {
            setLoading(true);
            try {
                const [lRes, mRes, sRes, saRes] = await Promise.allSettled([
                    getLikedPlaylistApi(),
                    getMyPlaylistsApi(),
                    getSavedPlaylistsApi(),
                    getSavedAlbumsApi()
                ]);

                if (lRes.status === 'fulfilled') setLikedPlaylist(lRes.value);
                if (mRes.status === 'fulfilled') {
                    // Filter out duplicate liked songs playlist
                    const filtered = (mRes.value || []).filter(p => p.loaiPlaylist !== 'liked_songs');
                    setMyPlaylists(filtered);
                }
                if (sRes.status === 'fulfilled') {
                    setSavedPlaylists(sRes.value || []);
                }
                if (saRes.status === 'fulfilled') {
                    setSavedAlbums(saRes.value || []);
                }

            } catch (error) {
                console.error("Lỗi khi tải thư viện:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [user?.id]);

    const handlePlayLiked = (e) => {
        e.stopPropagation();
        if (likedPlaylist?.songs?.length > 0) {
            playSong(likedPlaylist.songs[0], likedPlaylist.songs, { type: 'playlist', id: likedPlaylist.id, name: 'Bài hát đã thích' });
        }
    };

    if (loading) return (
        <div className="p-8 animate-pulse grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-xl"></div>
            ))}
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto px-8 py-10 custom-main-scroll" data-lenis-prevent>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Thư viện của bạn</h1>
            </div>

            <div className="flex gap-4 mb-10 overflow-x-auto pb-2 hide-scrollbar">
                {['all', 'playlists', 'albums', 'artists'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`
                            px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all
                            ${activeTab === tab ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}
                        `}
                    >
                        {tab === 'all' ? 'Tất cả' : (tab === 'playlists' ? 'Danh sách phát' : (tab === 'albums' ? 'Album' : 'Nghệ sĩ'))}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {/* Liked Songs Tile */}
                {(activeTab === 'all' || activeTab === 'playlists') && likedPlaylist && (
                    <LibraryCard 
                        type="liked" 
                        item={likedPlaylist} 
                        onClick={() => navigate(`/home/playlist/${likedPlaylist.id}`)}
                    />
                )}

                {/* My Playlists */}
                {(activeTab === 'all' || activeTab === 'playlists') && myPlaylists.map(p => (
                    <LibraryCard 
                        key={p.id} 
                        type="playlist" 
                        item={{ ...p, currentUserId: user?.id }} 
                        onClick={() => navigate(`/home/playlist/${p.id}`)}
                        onEdit={() => navigate(`/home/playlist/${p.id}/edit`)} // Or open modal
                    />
                ))}

                {/* Saved Playlists */}
                {(activeTab === 'all' || activeTab === 'playlists') && savedPlaylists.map(p => (
                    <LibraryCard 
                        key={p.id} 
                        type="playlist" 
                        item={p} 
                        onClick={() => navigate(`/home/playlist/${p.id}`)}
                    />
                ))}

                {/* Saved Albums */}
                {(activeTab === 'all' || activeTab === 'albums') && savedAlbums.map(a => (
                    <LibraryCard 
                        key={a.id} 
                        type="album" 
                        item={a} 
                        onClick={() => navigate(`/home/album/${a.id}`)}
                    />
                ))}
            </div>

            {(activeTab === 'all' && myPlaylists.length === 0 && savedPlaylists.length === 0 && savedAlbums.length === 0 && !likedPlaylist) && (
                <div className="py-24 text-center">
                    <LayoutGrid size={64} className="mx-auto mb-6 text-white/5" />
                    <p className="text-white/20 font-black uppercase tracking-[0.2em]">Thư viện của bạn đang trống.</p>
                </div>
            )}
        </div>
    );
};

export default LibraryView;
