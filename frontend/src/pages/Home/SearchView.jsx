import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Play, MoreHorizontal, User, Music2, Disc, LayoutGrid } from 'lucide-react';
import { globalSearchApi, searchByTypeApi } from '../../services/api_services';
import ImgFallback, { imgUrl } from '../../components/Common/ImgFallback';
import { useMusic } from '../../context/MusicContext';
import SongRow from '../../components/MusicPlayer/SongRow';

const SearchView = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const navigate = useNavigate();
    const { playSong, currentSong, isPlaying } = useMusic();

    const [activeTab, setActiveTab] = useState('top');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'top', label: 'Top results' },
        { id: 'profiles', label: 'Profiles' },
        { id: 'tracks', label: 'Tracks' },
        { id: 'albums', label: 'Albums' },
        { id: 'playlists', label: 'Playlists' }
    ];

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                if (activeTab === 'top') {
                    const res = await globalSearchApi(query);
                    setResults(res?.data || res || null);
                } else {
                    const res = await searchByTypeApi(query, activeTab);
                    setResults(res?.data || res || null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query, activeTab]);

    if (!query) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20">
                <Search size={80} strokeWidth={1} className="mb-4" />
                <p className="text-sm font-black uppercase tracking-widest">Nhập nội dung để tìm kiếm</p>
            </div>
        );
    }

    const renderTopResults = () => {
        if (!results) return null;
        const artists = (results.artists || []).map(a => ({ ...a, type: 'Artist' }));
        const profiles = (results.profiles || []).map(p => ({ ...p, type: 'Profile' }));
        const topArtists = [...artists, ...profiles];
        
        return (
            <div className="flex flex-col gap-12">
                {/* Songs Section - Vertical List */}
                {results.songs?.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                             <Music2 size={18} className="text-white/40" /> Bài hát
                        </h2>
                        <div className="grid grid-cols-1 gap-1">
                            {results.songs.slice(0, 4).map((song, i) => (
                                <div key={song.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all" onClick={() => playSong(song, results.songs, { type: 'Searching', name: 'Tìm kiếm' })}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                                            <ImgFallback src={song.anhBia} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Play size={16} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                                {song.tieuDe || song.TieuDe} <span className="px-1 py-0.5 rounded bg-white/10 text-[8px] font-black italic">E</span>
                                            </span>
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{song.tenNgheSi || song.TenNgheSi}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100">{song.thoiLuongGiay ? `${Math.floor(song.thoiLuongGiay / 60)}:${(song.thoiLuongGiay % 60).toString().padStart(2, '0')}` : '3:45'}</span>
                                        <button className="p-2 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white/40 hover:text-white">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Artists Section - Horizontal List */}
                {artists.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <User size={18} className="text-white/40" /> Nghệ sĩ
                        </h2>
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {artists.slice(0, 8).map(item => (
                                <div key={item.id} className="flex-shrink-0 flex flex-col items-center gap-4 p-4 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all w-32" 
                                    onClick={() => navigate(`/home/artist/${item.id}`)}>
                                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-2xl border border-white/5 relative">
                                        <ImgFallback src={item.anhDaiDien || item.avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <h3 className="text-[11px] font-black text-white uppercase tracking-tighter truncate w-full">{item.ten || item.hoTen || item.fullName || item.FullName || item.HoTen}</h3>
                                        <span className="px-2 py-0.5 mt-2 rounded-full bg-white/5 text-[7px] font-black text-white/40 uppercase tracking-widest">
                                            Artist
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Profiles Section - Horizontal List */}
                {profiles.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <User size={18} className="text-white/40" /> Hồ sơ cá nhân
                        </h2>
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {profiles.slice(0, 8).map(item => (
                                <div key={item.id} className="flex-shrink-0 flex flex-col items-center gap-4 p-4 rounded-2xl hover:bg-white/5 cursor-pointer group transition-all w-32" 
                                    onClick={() => navigate(`/home/profile/${item.id}`)}>
                                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-2xl border border-white/5 relative">
                                        <ImgFallback src={item.avatar || item.anhDaiDien} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <h3 className="text-[11px] font-black text-white uppercase tracking-tighter truncate w-full">{item.hoTen || item.fullName || item.FullName || item.ten || item.HoTen}</h3>
                                        <span className="px-2 py-0.5 mt-2 rounded-full bg-white/5 text-[7px] font-black text-white/40 uppercase tracking-widest">
                                            Profile
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Albums Section - Horizontal List */}
                {results.albums?.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Disc size={18} className="text-white/40" /> Album
                        </h2>
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {results.albums.slice(0, 8).map(album => (
                                <div key={album.id} className="flex-shrink-0 group flex flex-col gap-3 cursor-pointer w-40" onClick={() => navigate(`/home/album/${album.id}`)}>
                                    <div className="aspect-square relative rounded-xl overflow-hidden bg-white/5">
                                        <ImgFallback src={album.anhBia} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Play size={24} fill="white" className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xs font-black text-white uppercase truncate">{album.tieuDe || album.TieuDe}</h3>
                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">{album.artistName || album.ArtistName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Playlists Section - Horizontal List */}
                {results.playlists?.length > 0 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <LayoutGrid size={18} className="text-white/40" /> Playlist
                        </h2>
                        <div className="flex items-center gap-6 overflow-x-auto pb-4 hide-scrollbar">
                            {results.playlists.slice(0, 8).map(pl => (
                                <div key={pl.id} className="flex-shrink-0 group flex flex-col gap-3 cursor-pointer w-40" onClick={() => navigate(`/home/playlist/${pl.id}`)}>
                                    <div className="aspect-square relative rounded-xl overflow-hidden bg-white/5">
                                        <ImgFallback src={pl.anhBia} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Play size={24} fill="white" className="text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xs font-black text-white uppercase truncate">{pl.ten || pl.Ten}</h3>
                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">{pl.creatorName || pl.CreatorName || 'Buzzify User'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-y-auto overflow-x-hidden p-8 pt-6 relative" data-lenis-prevent>
            <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full">
                
                {/* Tabs */}
                <div className="flex items-center gap-3 sticky top-0 bg-[#0a0a0a] py-6 z-10 border-b border-white/5">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-2xl scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-white/5 border-t-white rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col w-full">
                        {((results && !results.songs?.length && !results.albums?.length && !results.artists?.length && !results.playlists?.length && !results.profiles?.length) || !results) ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 text-white/20 uppercase font-black tracking-widest text-center">
                                <Search size={64} strokeWidth={1} className="mb-4 opacity-10" />
                                <p>Không tìm thấy kết quả cho "{query}"</p>
                            </div>
                        ) : activeTab === 'top' ? renderTopResults() : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full text-left">
                                {/* Tracks */}
                                {activeTab === 'tracks' && results?.songs?.map((song, i) => (
                                    <div key={song.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer" onClick={() => playSong(song, results.songs, { type: 'Searching', name: 'Tìm kiếm' })}>
                                        <ImgFallback src={song.anhBia} className="w-14 h-14 rounded-lg object-cover" />
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-black text-white uppercase truncate">{song.tieuDe || song.TieuDe}</h4>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{song.tenNgheSi || song.TenNgheSi}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Profiles / Artists */}
                                {activeTab === 'profiles' && [
                                    ...(results?.artists || []).map(a => ({ ...a, type: 'Artist' })),
                                    ...(results?.profiles || []).map(p => ({ ...p, type: 'Profile' }))
                                ].map((item, i) => (
                                    <div key={i} className="group flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white/5 cursor-pointer text-center" onClick={() => navigate(item.anhDaiDien ? `/home/artist/${item.id}` : `/home/profile/${item.id}`)}>
                                        <div className="w-20 h-20 rounded-full overflow-hidden shadow-2xl border border-white/5">
                                            <ImgFallback src={item.anhDaiDien || item.avatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-[11px] font-black text-white uppercase truncate">{item.ten || item.hoTen || item.fullName || item.FullName}</h4>
                                            <span className="px-2 py-0.5 mt-2 rounded-full bg-white/5 text-[7px] font-black text-white/40 uppercase tracking-widest mx-auto">
                                                {item.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {/* Albums */}
                                {activeTab === 'albums' && results?.albums?.map((album, i) => (
                                    <div key={album.id} className="group flex flex-col gap-3 cursor-pointer" onClick={() => navigate(`/home/album/${album.id}`)}>
                                        <div className="aspect-square relative rounded-xl overflow-hidden bg-white/5">
                                            <ImgFallback src={album.anhBia} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Play size={24} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-xs font-black text-white uppercase truncate">{album.tieuDe || album.TieuDe}</h3>
                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{album.artistName || album.ArtistName}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Playlists */}
                                {activeTab === 'playlists' && results?.playlists?.map((pl, i) => (
                                    <div key={pl.id} className="group flex flex-col gap-3 cursor-pointer" onClick={() => navigate(`/home/playlist/${pl.id}`)}>
                                        <div className="aspect-square relative rounded-xl overflow-hidden bg-white/5">
                                            <ImgFallback src={pl.anhBia} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <Play size={24} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-xs font-black text-white uppercase truncate">{pl.ten || pl.Ten}</h3>
                                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{pl.creatorName || pl.CreatorName || 'Buzzify Playlist'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchView;
