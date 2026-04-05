import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Crown, Home, Music } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Here we could trigger a refresh of user data to show the VIP badge
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#0F5E8F]/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="text-center relative z-10 max-w-md w-full animate-fade-in-up">
                <div className="w-24 h-24 bg-[#0F5E8F]/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-[#0F5E8F]/30 rounded-full animate-ping opacity-50" />
                    <CheckCircle2 size={48} className="text-[#0F5E8F]" />
                </div>

                <h1 className="text-4xl font-black mb-4 tracking-tight">Thanh toán thành công!</h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Chúc mừng bạn đã chính thức trở thành thành viên <span className="text-[#0F5E8F] font-bold">Buzzify VIP</span>. 
                    Mọi quyền lợi cao cấp đã được kích hoạt trên tài khoản của bạn.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                        <Crown size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Huy hiệu VIP đã sẵn sàng</p>
                        <p className="text-xs text-gray-500">Giờ đây bạn có vương miện cạnh tên mình.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => navigate('/home')}
                        className="w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-[#0F5E8F]/20"
                        style={{ background: '#0F5E8F' }}
                    >
                        Bắt đầu trải nghiệm ngay
                    </button>
                    <button 
                        onClick={() => navigate('/home/browse')}
                        className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <Music size={18} /> Khám phá kho nhạc VIP
                    </button>
                </div>
            </div>

            <footer className="absolute bottom-8 text-gray-600 text-xs">
                &copy; 2026 Buzzify Music. Mọi quyền lợi đã được đảm bảo.
            </footer>
        </div>
    );
};

export default PaymentSuccess;
