import React, { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, Mic2, Star, CheckCircle } from 'lucide-react';
import { getAdminArtistsApi, deleteAdminArtistApi } from '../../services/api_services';
import toast from 'react-hot-toast';
import './Admin.css';

const ArtistManagement = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        try {
            const res = await getAdminArtistsApi();
            setArtists(res);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách nghệ sĩ");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteArtist = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa nghệ sĩ này? Hành động này không thể hoàn tác.")) return;
        try {
            await deleteAdminArtistApi(id);
            toast.success("Đã xóa nghệ sĩ");
            fetchArtists();
        } catch (error) {
            toast.error("Không thể xóa nghệ sĩ");
        }
    };

    const filteredArtists = artists.filter(a => 
        a.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tieuSu?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-artists-page">
            <header className="content-header">
                <div>
                    <h1>Quản lý nghệ sĩ</h1>
                    <p className="subtitle">Quản lý hồ sơ và xác minh nghệ sĩ trên Buzzify.</p>
                </div>
            </header>

            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên nghệ sĩ..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-loading">Đang tải...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nghệ sĩ</th>
                                <th>Tiểu sử</th>
                                <th>Người theo dõi</th>
                                <th>Xác minh</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredArtists.map((a) => (
                                <tr key={a.id}>
                                    <td>
                                        <div className="artist-cell">
                                            <img src={a.anhDaiDien || '/default-artist.png'} alt="" className="cell-avatar" />
                                            <div className="cell-info">
                                                <span className="cell-main">{a.ten}</span>
                                                <span className="cell-sub">Artist ID: {a.id?.substring(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cell-sub" style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {a.tieuSu || 'Chưa có tiểu sử'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="follower-count">
                                            <Star size={14} style={{ marginRight: '6px', color: '#fcc419' }} />
                                            {a.followerCount?.toLocaleString() || 0}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge-role artist">
                                            <CheckCircle size={12} style={{ marginRight: '4px' }} />
                                            Verified
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="action-btn" title="Xem trang cá nhân" onClick={() => window.open(`/home/artist/${a.id}`, '_blank')}>
                                                <ExternalLink size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeleteArtist(a.id)}>
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
        </div>
    );
};

export default ArtistManagement;
