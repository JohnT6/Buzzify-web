import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Trash2, 
    ChevronRight, 
    ChevronDown, 
    Music, 
    Calendar,
    User as UserIcon,
    Play,
    VolumeX,
    EyeOff,
    Volume2,
    Eye,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { getAlbumsApi, deleteAlbumApi, getAlbumByIdAsync, toggleAdminSongMuteApi, toggleAdminSongHideApi } from '../../services/api_services';
import toast from 'react-hot-toast';
import './Admin.css';

const AlbumManagement = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedAlbumId, setExpandedAlbumId] = useState(null);
    const [albumSongs, setAlbumSongs] = useState({}); // { albumId: [songs] }
    const [loadingSongs, setLoadingSongs] = useState({});

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async (search = searchTerm) => {
        setLoading(true);
        try {
            const res = await getAlbumsApi(search, 1, 100);
            setAlbums(res.data || []);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách album");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        // Debounce search
        const timeoutId = setTimeout(() => fetchAlbums(val), 500);
        return () => clearTimeout(timeoutId);
    };

    const toggleAlbum = async (albumId) => {
        if (expandedAlbumId === albumId) {
            setExpandedAlbumId(null);
            return;
        }

        setExpandedAlbumId(albumId);
        
        if (!albumSongs[albumId]) {
            setLoadingSongs(prev => ({ ...prev, [albumId]: true }));
            try {
                const res = await getAlbumByIdAsync(albumId);
                setAlbumSongs(prev => ({ ...prev, [albumId]: res.songs || [] }));
            } catch (error) {
                toast.error("Không thể tải danh sách bài hát");
            } finally {
                setLoadingSongs(prev => ({ ...prev, [albumId]: false }));
            }
        }
    };

    const handleDeleteAlbum = async (id) => {
        if (!window.confirm("Xóa album sẽ xóa tất cả bài hát bên trong. Bạn chắc chắn chứ?")) return;
        try {
            await deleteAlbumApi(id);
            toast.success("Đã xóa album");
            fetchAlbums();
        } catch (error) {
            toast.error("Lỗi khi xóa album");
        }
    };

    const handleToggleMute = async (songId, albumId) => {
        try {
            await toggleAdminSongMuteApi(songId);
            toast.success("Trạng thái âm thanh bài hát đã thay đổi");
            // Cập nhật state local
            setAlbumSongs(prev => ({
                ...prev,
                [albumId]: prev[albumId].map(s => s.id === songId ? { ...s, isMuted: !s.isMuted } : s)
            }));
        } catch (error) {
            toast.error("Lỗi thay đổi trạng thái bài hát");
        }
    };

    const handleToggleHide = async (songId, albumId, currentStatus) => {
        try {
            await toggleAdminSongHideApi(songId);
            toast.success(currentStatus === 'hidden' ? "Đã công khai bài hát!" : "Đã ẩn bài hát!");
            // Fetch lại album songs để lấy chuẩn trạng thái (từ hidden -> scheduled/published)
            const res = await getAlbumByIdAsync(albumId);
            setAlbumSongs(prev => ({ ...prev, [albumId]: res.songs || [] }));
        } catch (error) {
            toast.error("Lỗi thay đổi hiển thị bài hát");
        }
    };

    const getStatusBadge = (song) => {
        if (song.trangThai === 'hidden') {
          return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full border border-gray-200 uppercase tracking-wider w-fit">
              <Clock size={12} className="rotate-180" /> Đã ẩn
            </span>
          );
        }
        const isScheduled = song.scheduledPublishDate && new Date(song.scheduledPublishDate) > new Date();
        if (isScheduled) {
          return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-[11px] font-bold rounded-full border border-amber-100 uppercase tracking-wider w-fit">
              <Clock size={12} /> Hẹn giờ
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-600 text-[11px] font-bold rounded-full border border-green-100 uppercase tracking-wider w-fit">
            <CheckCircle2 size={12} /> Công khai
          </span>
        );
    };

    return (
        <div className="admin-albums-page">
            <header className="content-header">
                <div>
                    <h1>Quản lý Album & Nhạc</h1>
                    <p className="subtitle">Mở rộng album để quản lý danh sách bài hát bên trong.</p>
                </div>
            </header>

            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên album, nghệ sĩ hoặc bài hát..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchAlbums()}
                />
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-loading">Đang tải...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Album</th>
                                <th>Nghệ sĩ</th>
                                <th>Thể loại</th>
                                <th>Số bài</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {albums.map((a) => (
                                <React.Fragment key={a.id}>
                                    <tr className={expandedAlbumId === a.id ? 'expanded-row' : ''}>
                                        <td>
                                            <button className="expand-btn" onClick={() => toggleAlbum(a.id)}>
                                                {expandedAlbumId === a.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="artist-cell">
                                                <img src={a.anhBia || '/default-album.png'} alt="" className="cell-avatar" style={{ borderRadius: '4px' }} />
                                                <div className="cell-info">
                                                    <span className="cell-main">{a.tieuDe}</span>
                                                    <span className="cell-sub"><Calendar size={12} style={{ marginRight: '4px' }} /> {new Date(a.ngayPhatHanh).getFullYear()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <UserIcon size={14} color="#888" />
                                                <span>{a.artistName}</span>
                                            </div>
                                        </td>
                                        <td>{a.genreNames?.join(', ') || 'N/A'}</td>
                                        <td>{a.songsCount} bài</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="action-btn delete" onClick={() => handleDeleteAlbum(a.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    {/* Sub-table for Songs */}
                                    {expandedAlbumId === a.id && (
                                        <tr className="songs-row">
                                            <td colSpan="6">
                                                <div className="songs-detail">
                                                    {loadingSongs[a.id] ? (
                                                        <div className="songs-loading">Đang tải danh sách nhạc...</div>
                                                    ) : (
                                                        <div className="songs-list-admin">
                                                            <div className="songs-header">
                                                                <h4>Danh sách bài hát</h4>
                                                                <div className="songs-count">{albumSongs[a.id]?.length} tracks</div>
                                                            </div>
                                                            <table className="inner-songs-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>#</th>
                                                                        <th>Tiêu đề</th>
                                                                        <th>Lượt nghe</th>
                                                                        <th>Thời lượng</th>
                                                                        <th>Trạng thái</th>
                                                                        <th>Hợp tác</th>
                                                                        <th>Thao tác</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {albumSongs[a.id]?.map((s, idx) => (
                                                                        <tr key={s.id}>
                                                                            <td>{s.trackNumber || idx + 1}</td>
                                                                            <td>
                                                                                <div className="song-title-admin flex items-center gap-2">
                                                                                    <Music size={14} style={{ marginRight: '8px', color: '#1ed760' }} />
                                                                                    <span className="font-semibold">{s.tieuDe}</span>
                                                                                    {s.isMuted && (
                                                                                        <span className="bg-gray-100 text-gray-400 text-[9px] px-1.5 py-0.5 rounded border border-gray-100 font-bold uppercase">
                                                                                            Mute
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td>{s.luotNghe?.toLocaleString()}</td>
                                                                            <td>{Math.floor(s.thoiLuongGiay / 60)}:{(s.thoiLuongGiay % 60).toString().padStart(2, '0')}</td>
                                                                            <td>
                                                                                {getStatusBadge(s)}
                                                                            </td>
                                                                            <td>{s.ngheSiHopTac || '-'}</td>
                                                                            <td>
                                                                                <div className="action-btns">
                                                                                    <button className="action-btn" title={s.isMuted ? "Bật âm thanh" : "Tắt âm thanh (Mute)"} onClick={() => handleToggleMute(s.id, a.id)}>
                                                                                        {s.isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
                                                                                    </button>
                                                                                    <button 
                                                                                        onClick={() => handleToggleHide(s.id, a.id, s.trangThai)}
                                                                                        title={s.trangThai === 'hidden' ? "Hiện" : "Ẩn"} 
                                                                                        className={`p-2 rounded-lg transition-all ${s.trangThai === 'hidden' ? "text-green-600 hover:bg-green-50" : "text-amber-600 hover:bg-amber-50"}`}
                                                                                    >
                                                                                        {s.trangThai === 'hidden' ? <Eye size={16} /> : <EyeOff size={16} />}
                                                                                    </button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AlbumManagement;
