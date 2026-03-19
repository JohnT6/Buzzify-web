import React from 'react';
import { Search as SearchIcon, Clock, X, Play } from 'lucide-react';
import ImgFallback from '../Common/ImgFallback';

const SearchDropdown = ({ 
    search, 
    results, 
    loading, 
    history, 
    onSearchHistory, 
    onRemoveHistory, 
    onPlaySong, 
    onNavigate 
}) => {
    const hasResults = results && (
        (results.songs?.length > 0) || 
        (results.albums?.length > 0) || 
        (results.artists?.length > 0) || 
        (results.playlists?.length > 0) || 
        (results.profiles?.length > 0)
    );

    return (
        <div 
            className="absolute top-full right-0 mt-3 w-96 bg-[#121212] rounded-2xl shadow-2xl border border-white/5 overflow-hidden z-[600] py-2 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseDown={e => e.stopPropagation()}
        >
            {loading ? (
                <div className="p-10 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Đang tìm kiếm...</p>
                </div>
            ) : search ? (
                hasResults ? (
                    <div className="max-h-[70vh] overflow-y-auto px-2 custom-main-scroll" data-lenis-prevent>
                        {/* Songs */}
                        {results.songs?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-4 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Bài hát</h3>
                                {results.songs.map(song => (
                                    <div key={song.id} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer" onClick={() => onPlaySong(song, results.songs)}>
                                        <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0">
                                            <ImgFallback src={song.anhBia} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                                                <Play size={14} fill="white" className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{song.tieuDe || song.TieuDe || song.ten || song.Ten}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{song.tenNgheSi || song.TenNgheSi || song.artistName || 'Unknown Artist'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Artists */}
                        {results.artists?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-4 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Nghệ sĩ</h3>
                                {results.artists.map(art => (
                                    <div key={art.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer" onClick={() => onNavigate(`/home/artist/${art.id}`)}>
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                                            <ImgFallback src={art.anhDaiDien} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{art.ten || art.Ten}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Artist</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Albums */}
                        {results.albums?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-4 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Album</h3>
                                {results.albums.map(album => (
                                    <div key={album.id} className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer" onClick={() => onNavigate(`/home/album/${album.id}`)}>
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                            <ImgFallback src={album.anhBia} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{album.tieuDe || album.TieuDe}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">{album.artistName || album.ArtistName || 'Various Artists'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Profiles */}
                        {results.profiles?.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-4 py-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Người dùng</h3>
                                {results.profiles.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer" onClick={() => onNavigate(`/home/profile/${p.id}`)}>
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
                                            <ImgFallback src={p.anhDaiDien || p.avatar || p.AnhDaiDien} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-sm font-bold text-white truncate">{p.hoTen || p.fullName || p.FullName || p.HoTen}</p>
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Profile</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null
            ) : (
                <div className="flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2">
                        <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Tìm kiếm gần đây</h3>
                    </div>
                    {history.length > 0 ? (
                        <div className="px-2">
                            {history.slice(0, 8).map((item, i) => (
                                <div key={i} className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 cursor-pointer">
                                    <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => onSearchHistory(item)}>
                                        <Clock size={16} className="text-white/20 flex-shrink-0" />
                                        <span className="text-sm text-gray-300 truncate font-bold">{item}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemoveHistory(item); }}
                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                            <SearchIcon size={32} className="text-white/5" />
                            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">Chưa có tìm kiếm nào gần đây</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchDropdown;
