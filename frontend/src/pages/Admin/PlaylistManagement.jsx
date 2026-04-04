import React, { useState, useEffect } from 'react';
import { Search, Trash2, Star, ListMusic, Plus, X, Image as ImageIcon, Check, Music } from 'lucide-react';
import { 
    getAdminPlaylistsApi, 
    deleteAdminPlaylistApi, 
    toggleAdminPlaylistFeaturedApi, 
    createAdminPlaylistApi, 
    updateAdminPlaylistApi,
    uploadMediaApi, 
    getGenresApi,
    getSongsApi,
    addAdminPlaylistSongApi,
    removeAdminPlaylistSongApi
} from '../../services/api_services';
import toast from 'react-hot-toast';
import './Admin.css';

const PlaylistManagement = () => {
    const [playlists, setPlaylists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); 
    
    // Modal Edit/Create State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [newPlaylist, setNewPlaylist] = useState({
        ten: '',
        moTa: '',
        anhBia: '',
        isSystem: true,
        idTheLoais: []
    });
    
    // Song Manager State
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [allSongs, setAllSongs] = useState([]);
    const [songSearchTerm, setSongSearchTerm] = useState('');
    const [isSearchingSongs, setIsSearchingSongs] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [playlistFile, setPlaylistFile] = useState(null);
    const [playlistPreview, setPlaylistPreview] = useState(null);

    useEffect(() => {
        fetchPlaylists();
        fetchGenres();
    }, []);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const res = await getAdminPlaylistsApi();
            setPlaylists(res || []);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách playlist");
        } finally {
            setLoading(false);
        }
    };

    const fetchGenres = async () => {
        try {
            const res = await getGenresApi();
            setGenres(res || []);
        } catch (error) {
            console.error("Lỗi tải thể loại", error);
        }
    }

    const searchSongs = async (term) => {
        if (!term) {
            setAllSongs([]);
            return;
        }
        setIsSearchingSongs(true);
        try {
            // Sử dụng search api chung
            const res = await getSongsApi(term, 1, 20);
            setAllSongs(res.items || []);
        } catch (error) {
            toast.error("Lỗi tìm kiếm bài hát");
        } finally {
            setIsSearchingSongs(false);
        }
    }

    const handleDeletePlaylist = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa playlist này?")) return;
        try {
            await deleteAdminPlaylistApi(id);
            toast.success("Đã xóa playlist");
            fetchPlaylists();
        } catch (error) {
            toast.error("Không thể xóa playlist");
        }
    };

    const handleOpenCreateModal = () => {
        setEditingPlaylist(null);
        setNewPlaylist({ ten: '', moTa: '', anhBia: '', isSystem: true, idTheLoais: [] });
        setPlaylistPreview(null);
        setPlaylistFile(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (playlist) => {
        setEditingPlaylist(playlist);
        setNewPlaylist({
            ten: playlist.ten,
            moTa: playlist.moTa,
            anhBia: playlist.anhBia,
            isSystem: playlist.isSystem,
            idTheLoais: playlist.genreIds || []
        });
        setPlaylistPreview(playlist.anhBia);
        setPlaylistFile(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPlaylist.ten) return toast.error("Vui lòng nhập tên playlist");

        setIsSubmitting(true);
        try {
            let coverUrl = newPlaylist.anhBia;
            if (playlistFile) {
                const formData = new FormData();
                formData.append('file', playlistFile);
                const uploadRes = await uploadMediaApi('playlist', formData, null, null, crypto.randomUUID());
                coverUrl = uploadRes.url || (uploadRes.data ? uploadRes.data.url : uploadRes);
            }

            const payload = { ...newPlaylist, anhBia: coverUrl };
            
            if (editingPlaylist) {
                await updateAdminPlaylistApi(editingPlaylist.id, payload);
                toast.success("Đã cập nhật playlist!");
            } else {
                await createAdminPlaylistApi(payload);
                toast.success("Đã tạo playlist hệ thống!");
            }
            
            setIsModalOpen(false);
            fetchPlaylists();
        } catch (error) {
            toast.error("Lỗi khi xử lý playlist");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleFeatured = async (id) => {
        try {
            await toggleAdminPlaylistFeaturedApi(id);
            fetchPlaylists();
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
        }
    }

    const handleGenreToggle = (genreId) => {
        setNewPlaylist(prev => {
            const current = [...prev.idTheLoais];
            if (current.includes(genreId)) {
                return { ...prev, idTheLoais: current.filter(id => id !== genreId) };
            } else {
                return { ...prev, idTheLoais: [...current, genreId] };
            }
        });
    };

    // Song Management Logic
    const handleOpenSongManager = (playlist) => {
        setSelectedPlaylist(playlist);
        setAllSongs([]);
        setSongSearchTerm('');
        setIsSongModalOpen(true);
    };

    const handleAddSong = async (songId) => {
        try {
            await addAdminPlaylistSongApi(selectedPlaylist.id, songId);
            toast.success("Đã thêm bài hát");
            
            // Cập nhật local state ngay lập tức để UX mượt
            const updatedPlaylists = playlists.map(p => {
                if (p.id === selectedPlaylist.id) {
                    // Cần fetch lại hoặc parse từ allSongs để lấy thông tin bài hát
                    const songDetails = allSongs.find(s => s.id === songId);
                    return {
                        ...p,
                        songCount: (p.songCount || 0) + 1,
                        songs: [...(p.songs || []), songDetails]
                    };
                }
                return p;
            });
            setPlaylists(updatedPlaylists);
            setSelectedPlaylist(updatedPlaylists.find(p => p.id === selectedPlaylist.id));

        } catch (error) {
            toast.error("Bài hát đã có trong playlist");
        }
    };

    const handleRemoveSong = async (songId) => {
        try {
            await removeAdminPlaylistSongApi(selectedPlaylist.id, songId);
            toast.success("Đã xóa bài hát");
            
            const updatedPlaylists = playlists.map(p => {
                if (p.id === selectedPlaylist.id) {
                    return {
                        ...p,
                        songCount: Math.max(0, (p.songCount || 0) - 1),
                        songs: (p.songs || []).filter(s => s.id !== songId)
                    };
                }
                return p;
            });
            setPlaylists(updatedPlaylists);
            setSelectedPlaylist(updatedPlaylists.find(p => p.id === selectedPlaylist.id));

        } catch (error) {
            toast.error("Lỗi khi xóa bài hát");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPlaylistFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPlaylistPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const filteredPlaylists = playlists.filter(p => {
        const matchesSearch = p.ten?.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterType === 'system') return matchesSearch && p.isSystem;
        if (filterType === 'user') return matchesSearch && !p.isSystem;
        return matchesSearch;
    });

    return (
        <div className="admin-playlists-page">
            <header className="content-header">
                <div>
                    <h1>Quản lý Playlist</h1>
                    <p className="subtitle">Tạo các bộ sưu tập chuyên nghiệp "By Buzzify" và gán nhãn thể loại.</p>
                </div>
                <button className="refresh-btn highlight" onClick={handleOpenCreateModal}>
                    <Plus size={18} />
                    Tạo Playlist mới
                </button>
            </header>

            <div className="flex-row-center" style={{ gap: '16px', marginBottom: '24px' }}>
                <div className="search-box" style={{ flex: 1, marginBottom: 0 }}>
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên playlist..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm" style={{ padding: '6px' }}>
                    {['all', 'system', 'user'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                                filterType === t ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            {t === 'all' ? 'Tất cả' : t === 'system' ? 'Hệ thống' : 'Người dùng'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-loading">Đang tải...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Playlist</th>
                                <th>Thể loại</th>
                                <th>Số bài</th>
                                <th>Nổi bật</th>
                                <th>Hệ thống</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlaylists.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="artist-cell">
                                            <div className="relative">
                                                <img src={p.anhBia || '/default-playlist.png'} alt="" className="cell-avatar" style={{ borderRadius: '12px', width: '48px', height: '48px' }} />
                                                {p.isSystem && (
                                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm" style={{ cursor: 'default' }} title="Editorial">
                                                        <Check size={8} strokeWidth={4} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="cell-info">
                                                <span className="cell-main">{p.ten}</span>
                                                <span className="cell-sub flex items-center gap-1">
                                                    {p.isSystem ? (
                                                        <span className="text-blue-600 font-bold text-[10px] uppercase tracking-wider">Bởi Buzzify</span>
                                                    ) : (
                                                        `Bởi: ${p.creatorName || 'N/A'}`
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {p.genres?.slice(0, 2).map((g, i) => (
                                                <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{g}</span>
                                            ))}
                                            {p.genres?.length > 2 && <span className="text-[10px] text-gray-400">+{p.genres.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td>{p.songCount || 0}</td>
                                    <td>
                                        <button 
                                            onClick={() => handleToggleFeatured(p.id)} 
                                            className={`badge-role ${p.isFeatured ? 'admin' : 'user'}`}
                                        >
                                            <Star size={12} fill={p.isFeatured ? 'currentColor' : 'none'} />
                                            {p.isFeatured ? 'Featured' : 'None'}
                                        </button>
                                    </td>
                                    <td>
                                        <span className={`badge-role ${p.isSystem ? 'artist' : 'user'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                                            {p.isSystem ? 'System Mix' : 'User'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="action-btn edit" title="Chỉnh sửa nội dung" onClick={() => handleOpenEditModal(p)}>
                                                <ImageIcon size={16} />
                                            </button>
                                            <button className="action-btn highlight" title="Quản lý bài hát" onClick={() => handleOpenSongManager(p)}>
                                                <ListMusic size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeletePlaylist(p.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Tạo/Sửa Playlist */}
            {isModalOpen && (
                <div className="admin-modal-overlay glass-morphism">
                    <div className="admin-modal-content admin-card animate-in fade-in zoom-in duration-200" style={{ maxWidth: '600px' }}>
                        <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                            <X size={20} />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                {editingPlaylist ? 'Cập nhật Playlist' : 'Tạo Playlist hệ thống'}
                            </h2>
                            <p className="text-gray-500 text-sm italic">Thiết kế phong cách editorial đẳng cấp "By Buzzify".</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <div 
                                        onClick={() => document.getElementById('playlist-img').click()}
                                        className="aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-all group overflow-hidden relative shadow-inner"
                                    >
                                        {playlistPreview ? (
                                            <img src={playlistPreview} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <>
                                                <ImageIcon size={32} className="text-gray-300 group-hover:text-indigo-400 mb-2" />
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ảnh bìa</span>
                                            </>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Plus size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <input type="file" id="playlist-img" hidden accept="image/*" onChange={handleImageChange} />
                                </div>
                                
                                <div className="md:col-span-2 flex flex-col gap-4">
                                    <div className="form-group">
                                        <label className="admin-label">Tên Playlist</label>
                                        <input 
                                            type="text" 
                                            className="admin-input"
                                            placeholder="VD: Nightly Jazzy Mix" 
                                            value={newPlaylist.ten}
                                            onChange={(e) => setNewPlaylist({...newPlaylist, ten: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="admin-label">Mô tả</label>
                                        <textarea 
                                            className="admin-input"
                                            placeholder="Lời giới thiệu thu hút về playlist này..." 
                                            value={newPlaylist.moTa}
                                            onChange={(e) => setNewPlaylist({...newPlaylist, moTa: e.target.value})}
                                            style={{ minHeight: '90px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="admin-label">Thể loại liên quan (Categories)</label>
                                <div className="flex flex-wrap gap-2 mt-2 max-h-[120px] overflow-y-auto p-2 border border-gray-100 rounded-2xl bg-gray-50/50">
                                    {genres.map((g) => (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => handleGenreToggle(g.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                newPlaylist.idTheLoais.includes(g.id)
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                            }`}
                                        >
                                            {g.ten}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-gray-100 transition-all">
                                    Hủy bỏ
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                                    {isSubmitting ? 'Đang xử lý...' : (editingPlaylist ? 'Lưu thay đổi' : 'Tạo Playlist')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Quản lý Bài hát */}
            {isSongModalOpen && (
                <div className="admin-modal-overlay glass-morphism">
                    <div className="admin-modal-content admin-card animate-in slide-in-from-bottom-4 duration-300" style={{ maxWidth: '800px' }}>
                        <button className="close-btn" onClick={() => setIsSongModalOpen(false)}>
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <img src={selectedPlaylist?.anhBia || '/default-playlist.png'} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Quản lý bài hát</h2>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{selectedPlaylist?.ten}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                            {/* Danh sách hiện tại */}
                            <div className="flex flex-col h-full border-r border-gray-100 pr-4">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    Trong playlist
                                    <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg">{selectedPlaylist?.songs?.length || 0}</span>
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                    {selectedPlaylist?.songs?.length > 0 ? (
                                        selectedPlaylist.songs.map((s) => (
                                            <div key={s.id} className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 group">
                                                <img src={s.anhBia || '/default-song.png'} className="w-10 h-10 rounded-xl" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate text-gray-800">{s.tieuDe}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{s.tenNgheSi}</p>
                                                </div>
                                                <button onClick={() => handleRemoveSong(s.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10">
                                            <Music size={40} strokeWidth={1} className="mb-2" />
                                            <p className="text-xs font-bold italic">Chưa có bài hát nào</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tìm kiếm & Thêm */}
                            <div className="flex flex-col h-full">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Thêm bài hát mới</h3>
                                <div className="search-box mb-4">
                                    <Search size={16} className="search-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Tìm theo tên bài hát hoặc nghệ sĩ..." 
                                        value={songSearchTerm}
                                        onChange={(e) => {
                                            setSongSearchTerm(e.target.value);
                                            searchSongs(e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                    {isSearchingSongs ? (
                                        <div className="text-center py-10 text-gray-400 text-xs font-bold">Đang tìm kiếm...</div>
                                    ) : allSongs.length > 0 ? (
                                        allSongs.map((s) => (
                                            <div key={s.id} className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all group">
                                                <img src={s.anhBia || '/default-song.png'} className="w-10 h-10 rounded-xl" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate text-gray-800">{s.tieuDe}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{s.tenNgheSi}</p>
                                                </div>
                                                <button 
                                                    onClick={() => handleAddSong(s.id)}
                                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-gray-300 text-[10px] font-bold uppercase tracking-widest italic">
                                            {songSearchTerm ? 'Không tìm thấy kết quả' : 'Nhập từ khóa để tìm kiếm'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistManagement;
