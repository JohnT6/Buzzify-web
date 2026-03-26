import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Mic2, 
    Music, 
    PlayCircle, 
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';
import { getAdminStatsOverviewApi } from '../../services/api_services';
import toast from 'react-hot-toast';
import './Admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalArtists: 0,
        totalSongs: 0,
        totalStreams: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await getAdminStatsOverviewApi();
            setStats(res);
        } catch (error) {
            toast.error("Không thể tải thống kê");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="admin-loading">Đang tải dữ liệu...</div>;

    const cards = [
        {
            title: 'Tổng người dùng',
            value: stats.totalUsers,
            icon: <Users size={24} />,
            color: '#3b82f6', // Blue
            trend: '+12%',
            isUp: true
        },
        {
            title: 'Nghệ sĩ',
            value: stats.totalArtists,
            icon: <Mic2 size={24} />,
            color: '#8b5cf6', // Violet
            trend: '+5%',
            isUp: true
        },
        {
            title: 'Bài hát',
            value: stats.totalSongs,
            icon: <Music size={24} />,
            color: '#f59e0b', // Amber/Orange
            trend: '+24%',
            isUp: true
        },
        {
            title: 'Lượt nghe',
            value: stats.totalStreams,
            icon: <PlayCircle size={24} />,
            color: '#10b981', // Emerald
            trend: '+8%',
            isUp: true
        },
    ];

    return (
        <div className="admin-dashboard">
            <header className="content-header">
                <div>
                    <h1>Tổng quan hệ thống</h1>
                    <p className="subtitle">Chào mừng trở lại, đây là những gì đang diễn ra trên Buzzify hôm nay.</p>
                </div>
                <button className="refresh-btn" onClick={fetchStats}>
                    <Activity size={16} />
                    Làm mới
                </button>
            </header>

            <div className="stats-grid">
                {cards.map((card, index) => (
                    <div className="stat-card" key={index}>
                        <div className="card-top">
                            <div className="icon-box" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                                {card.icon}
                            </div>
                            <div className={`trend ${card.isUp ? 'up' : 'down'}`}>
                                {card.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {card.trend}
                            </div>
                        </div>
                        <div className="card-info">
                            <h3 className="card-value">{card.value.toLocaleString()}</h3>
                            <p className="card-title">{card.title}</p>
                        </div>
                        <div className="card-progress">
                            <div className="progress-bar" style={{ width: '70%', backgroundColor: card.color }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-charts-placeholder">
                <div className="chart-box">
                    <h3>Biểu đồ lượt nghe (30 ngày gần nhất)</h3>
                    <div className="placeholder-content">
                        <TrendingUp size={48} className="text-indigo-500 opacity-20" />
                        <p>Dữ liệu biểu đồ đang được xử lý...</p>
                    </div>
                </div>
                <div className="activity-box">
                    <h3>Hoạt động gần đây</h3>
                    <ul className="activity-list">
                        <li className="activity-item">
                            <div className="activity-dot blue"></div>
                            <div className="activity-info">
                                <strong>Người dùng mới</strong>
                                <span>Nguyen Van A vừa đăng ký</span>
                            </div>
                            <span className="activity-time">2 phút trước</span>
                        </li>
                        <li className="activity-item">
                            <div className="activity-dot green"></div>
                            <div className="activity-info">
                                <strong>Nghệ sĩ mới</strong>
                                <span>Charles Puth vừa được xác minh</span>
                            </div>
                            <span className="activity-time">15 phút trước</span>
                        </li>
                        <li className="activity-item">
                            <div className="activity-dot orange"></div>
                            <div className="activity-info">
                                <strong>Album mới</strong>
                                <span>Album "Night Vision" vừa được tải lên</span>
                            </div>
                            <span className="activity-time">1 giờ trước</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
