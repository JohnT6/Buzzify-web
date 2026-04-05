import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Check, Crown, Zap, Users, 
    ShieldCheck, ArrowLeft, Copy, QrCode
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMusic } from '../../context/MusicContext';
import Cookies from 'js-cookie';

const ACCENT = '#0F5E8F';
const API_BASE = import.meta.env.VITE_API_URL || '';

const PremiumUpgrade = () => {
    const { refreshUser } = useMusic();
    const navigate = useNavigate();
    const [paymentStep, setPaymentStep] = useState(1); // 1: Benefits, 2: Payment QR
    const [copying, setCopying] = useState(false);
    const [intentCreated, setIntentCreated] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    
    // Tạo mã ngẫu nhiên 1 lần khi load trang
    const [paymentCode] = useState(() => "BZFY" + Math.floor(100000 + Math.random() * 900000));

    const price = "3.000";
    
    // QR: Ưu tiên dùng SePay QR URL (cài sẵn từ .env), nếu chưa có thì fallback sang VietQR
    const sepayQrUrl = import.meta.env.VITE_SEPAY_QR_URL || '';
    const bankBin = import.meta.env.VITE_BANK_BIN || '970422';
    const bankAccount = import.meta.env.VITE_BANK_ACCOUNT || '';
    const bankName = import.meta.env.VITE_BANK_ACCOUNT_NAME || 'BUZZIFY PREMIUM';
    
    // Build QR src: nếu có SePay QR thì thêm addInfo vào URL, nếu không thì dùng VietQR
    const qrSrc = sepayQrUrl
        ? `${sepayQrUrl}` // SePay QR tĩnh, nội dung chuyển khoản bạn nhúp thủ công theo mã BZFY
        : `https://api.vietqr.io/image/${bankBin}-${bankAccount}-K3f0p2v.jpg?amount=3000&addInfo=${encodeURIComponent(paymentCode)}&accountName=${encodeURIComponent(bankName)}`;

    // Bước 1: Khi chuyển sang màn QR, đăng ký mã với Backend
    useEffect(() => {
        if (paymentStep === 2 && !intentCreated) {
            const createIntent = async () => {
                try {
                    const res = await fetch(`${API_BASE}/api/v1/payments/intent`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${Cookies.get('access_token')}`
                        },
                        body: JSON.stringify({ paymentCode })
                    });
                    if (res.ok) {
                        setIntentCreated(true);
                    } else {
                        toast.error("Lỗi khởi tạo thanh toán.");
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Lỗi kết nối máy chủ thanh toán.");
                }
            };
            createIntent();
        }
    }, [paymentStep, intentCreated, paymentCode]);

    // Bước 2: Polling – Tự động kiểm tra trạng thái VIP mỗi 3 giây
    useEffect(() => {
        let interval;
        if (paymentStep === 2) {
            interval = setInterval(async () => {
                setIsChecking(true);
                try {
                    const res = await fetch(`${API_BASE}/api/v1/users/me`, {
                        headers: { 'Authorization': `Bearer ${Cookies.get('access_token')}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data.loaiTaiKhoan === 'vip') {
                            clearInterval(interval);
                            if (refreshUser) await refreshUser();
                            navigate('/premium/success');
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
                setIsChecking(false);
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [paymentStep, navigate, refreshUser]);

    const benefits = [
        { 
            icon: <Users size={20} className="text-blue-400" />, 
            title: "Phòng Jam không giới hạn", 
            desc: "Tạo và tham gia phòng nghe chung với số lượng thành viên không hạn chế." 
        },
        { 
            icon: <Crown size={20} className="text-yellow-400" />, 
            title: "Huy hiệu VIP độc quyền", 
            desc: "Hiển thị biểu tượng vương miện cạnh tên người dùng để khẳng định đẳng cấp." 
        },
        { 
            icon: <Zap size={20} className="text-purple-400" />, 
            title: "Âm thanh Lossless", 
            desc: "Trải nghiệm chất lượng âm thanh cao nhất, trung thực nhất từ kho nhạc." 
        },
        { 
            icon: <ShieldCheck size={20} className="text-green-400" />, 
            title: "Hoàn toàn không quảng cáo", 
            desc: "Nghe nhạc liền mạch, không bao giờ bị gián đoạn bởi các nội dung quảng cáo." 
        }
    ];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopying(true);
        toast.success("Đã sao chép mã chuyển khoản!");
        setTimeout(() => setCopying(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0F5E8F]/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <header className="p-6 flex items-center justify-between relative z-10">
                <button 
                    onClick={() => paymentStep === 2 ? setPaymentStep(1) : navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Quay lại</span>
                </button>
                <img src="/logo/FullLogo_Transparent.png" alt="buzzify" className="h-8 w-auto opacity-80" />
                <div className="w-20" />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 max-w-5xl mx-auto w-full">
                {paymentStep === 1 ? (
                    <div className="w-full animate-fade-in-up">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F5E8F]/10 border border-[#0F5E8F]/30 text-[#0F5E8F] text-xs font-bold uppercase tracking-widest mb-6">
                                <Crown size={14} /> Buzzify Premium
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                                Nâng cấp trải nghiệm <br /> 
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#0F5E8F]">Âm nhạc của bạn</span>
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                Chỉ với mức giá cực rẻ để sở hữu trọn bộ tính năng cao cấp nhất dành riêng cho thành viên VIP.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                            {benefits.map((b, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                        {b.icon}
                                    </div>
                                    <h3 className="font-bold mb-2">{b.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-b from-white/10 to-transparent border border-white/20 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
                            <div className="text-center md:text-left">
                                <p className="text-blue-400 font-bold mb-1">Gói trải nghiệm thử</p>
                                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                    <span className="text-5xl font-black tracking-tighter">{price}đ</span>
                                    <span className="text-gray-500">/ tháng</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-3 flex items-center gap-2 justify-center md:justify-start">
                                    <Check size={14} className="text-green-500" /> Hủy đăng ký bất cứ lúc nào
                                </p>
                            </div>

                            <button 
                                onClick={() => setPaymentStep(2)}
                                className="w-full md:w-auto px-10 py-5 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-[#0F5E8F]/20 hover:shadow-[#0F5E8F]/40"
                                style={{ background: ACCENT }}
                            >
                                Nâng cấp ngay
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-2xl animate-fade-in-up">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black mb-2">Thanh toán an toàn</h2>
                            <p className="text-gray-400">Quét mã QR bằng ứng dụng Ngân hàng hoặc Ví điện tử của bạn</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* QR Code */}
                            <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative group">
                                <div className="aspect-square w-full bg-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                                    {/* VietQR Generator API */}
                                    <img 
                                        src={qrSrc}
                                        alt="QR Thanh toán"
                                        className="w-full h-full object-contain"
                                    />
                                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="p-3 bg-black/80 rounded-full">
                                            <QrCode size={32} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 italic">Hỗ trợ tất cả ngân hàng</p>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="space-y-5">
                                <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Thông tin chuyển khoản</p>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Số tiền</label>
                                            <p className="text-2xl font-black text-blue-400">{price} VNĐ</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Nội dung chuyển khoản</label>
                                            <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5">
                                                <code className="text-[#0F5E8F] font-black text-lg tracking-wider">{paymentCode}</code>
                                                <button 
                                                    onClick={() => handleCopy(paymentCode)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#0F5E8F]/10 border border-[#0F5E8F]/20 p-5 rounded-2xl">
                                    <p className="text-xs text-[#0F5E8F] leading-relaxed font-medium">
                                        <span className="font-black">Lưu ý:</span> Điền <span className="underline">chính xác</span> nội dung chuyển khoản ở trên để hệ thống tự động kích hoạt VIP ngay lập tức, không cần thao tác thêm.
                                    </p>
                                </div>

                                {/* Trạng thái chờ */}
                                <div className="flex flex-col items-center gap-3 py-2">
                                    <div className="flex items-center gap-3 text-blue-400">
                                        <div className={`w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full ${isChecking ? 'animate-spin' : 'opacity-30'}`} />
                                        <span className="text-sm font-bold">Hệ thống đang chờ xác nhận thanh toán...</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/premium/cancel')}
                                        className="w-full py-2 text-xs text-gray-500 hover:text-white transition-colors"
                                    >
                                        Hủy giao dịch
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <footer className="p-8 text-center text-gray-600 text-xs relative z-10">
                <div className="flex items-center justify-center gap-6 mb-4">
                    <span>Điều khoản dịch vụ</span>
                    <span>Chính sách bảo mật</span>
                    <span>Liên hệ hỗ trợ</span>
                </div>
                <p>&copy; 2026 Buzzify Music. Bảo lưu mọi quyền.</p>
            </footer>
        </div>
    );
};

export default PremiumUpgrade;
