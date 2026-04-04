import React, { useState, useEffect } from 'react';
import { Search, Trash2, ExternalLink, Mic2, Star, CheckCircle, Edit3, X, Image } from 'lucide-react';
import { getAdminArtistsApi, deleteAdminArtistApi, toggleAdminArtistVerifyApi, updateAdminArtistInfoApi } from '../../services/api_services';
import toast from 'react-hot-toast';
import './Admin.css';

const ArtistManagement = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingArtist, setEditingArtist] = useState(null);
    const [editForm, setEditForm] = useState({ bio: '', coverImage: '', isVerified: false });

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

    const handleToggleVerify = async (id) => {
        try {
            await toggleAdminArtistVerifyApi(id);
            toast.success("Trạng thái xác minh đã thay đổi");
            fetchArtists();
        } catch (error) {
            toast.error("Lỗi thay đổi trạng thái");
        }
    };

    const handleEditClick = (artist) => {
        setEditingArtist(artist);
        setEditForm({
            bio: artist.bio || '',
            coverImage: artist.coverImage || '',
            isVerified: artist.isVerified || false
        });
    };

    const handleSaveEdit = async () => {
        if (!editingArtist) return;
        try {
            await updateAdminArtistInfoApi(editingArtist.id, editForm);
            toast.success("Cập nhật thông tin thành công");
            setEditingArtist(null);
            fetchArtists();
        } catch (error) {
            toast.error("Lỗi khi cập nhật thông tin");
        }
    };

    const filteredArtists = artists.filter(a => 
        a.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.bio?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                            {a.bio || 'Chưa có tiểu sử'}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="follower-count">
                                            <Star size={14} style={{ marginRight: '6px', color: '#fcc419' }} />
                                            {a.followerCount?.toLocaleString() || 0}
                                        </div>
                                    </td>
                                    <td>
                                        <span onClick={() => handleToggleVerify(a.id)} className={`badge-role ${a.isVerified ? 'artist' : 'user'}`} style={{ cursor: 'pointer' }} title="Click để thay đổi">
                                            {a.isVerified && <CheckCircle size={12} style={{ marginRight: '4px' }} />}
                                            {a.isVerified ? 'Verified' : 'Chưa xác minh'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="action-btn" title="Xem trang cá nhân" onClick={() => window.open(`/home/artist/${a.id}`, '_blank')}>
                                                <ExternalLink size={16} />
                                            </button>
                                            <button className="action-btn" title="Chỉnh sửa thông tin" onClick={() => handleEditClick(a)}>
                                                <Edit3 size={16} />
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

            {/* Modal chỉnh sửa nghệ sĩ */}
            {editingArtist && (
                <div className="admin-modal-overlay" onClick={() => setEditingArtist(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>Sửa thông tin nghệ sĩ</h2>
                            <button className="close-btn" onClick={() => setEditingArtist(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="admin-modal-body form-group-list">
                            <div className="form-group">
                                <label>Tiểu sử (Bio)</label>
                                <textarea rows="3" placeholder="Nhập tiểu sử..." value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Ảnh bìa (URL)</label>
                                <div className="input-with-icon">
                                    <Image size={18} className="input-icon" />
                                    <input type="text" placeholder="https://..." value={editForm.coverImage} onChange={(e) => setEditForm({...editForm, coverImage: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group row-checkbox">
                                <input type="checkbox" id="verify-check" checked={editForm.isVerified} onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})} />
                                <label htmlFor="verify-check">Tích xanh xác minh (Verified)</label>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setEditingArtist(null)}>Hủy</button>
                            <button className="btn-save" onClick={handleSaveEdit}>Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistManagement;
