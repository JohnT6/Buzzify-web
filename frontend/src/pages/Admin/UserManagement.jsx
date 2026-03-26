import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit3, UserPlus, Shield, User as UserIcon, Mic2 } from 'lucide-react';
import { getAdminUsersApi, deleteAdminUserApi, updateAdminUserRoleApi } from '../../services/api_services';
import toast from 'react-hot-toast';
import './Admin.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await getAdminUsersApi();
            setUsers(res);
        } catch (error) {
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
        try {
            await deleteAdminUserApi(id);
            toast.success("Đã xóa người dùng");
            fetchUsers();
        } catch (error) {
            toast.error("Không thể xóa người dùng");
        }
    };

    const handleChangeRole = async (id, newRole) => {
        try {
            await updateAdminUserRoleApi(id, newRole);
            toast.success(`Đã cập nhật vai trò thành ${newRole}`);
            fetchUsers();
        } catch (error) {
            toast.error("Lỗi khi cập nhật vai trò");
        }
    };

    const filteredUsers = users.filter(u => 
        u.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-users-page">
            <header className="content-header">
                <div>
                    <h1>Quản lý người dùng</h1>
                    <p className="subtitle">Xem, chỉnh sửa hoặc xóa các tài khoản trên hệ thống.</p>
                </div>
            </header>

            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Tìm theo tên hoặc email..." 
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
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Ngày đăng ký</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <img src={u.anhDaiDien || '/default-avatar.png'} alt="" className="cell-avatar" />
                                            <div className="cell-info">
                                                <span className="cell-main">{u.hoTen}</span>
                                                <span className="cell-sub">ID: {u.id?.substring(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <div className="role-selector">
                                            <span className={`badge-role ${u.vaiTro?.toLowerCase()}`}>
                                                {u.vaiTro}
                                            </span>
                                            <select 
                                                value={u.vaiTro} 
                                                onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                                className="hidden-select"
                                            >
                                                <option value="user">User</option>
                                                <option value="artist">Artist</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td>{new Date(u.createdDate || Date.now()).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="action-btn" onClick={() => handleChangeRole(u.id, u.vaiTro === 'admin' ? 'user' : 'admin')}>
                                                <Shield size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeleteUser(u.id)}>
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

export default UserManagement;
