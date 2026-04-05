import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, ArrowLeft, RefreshCcw } from 'lucide-react';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gray-500/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="text-center relative z-10 max-w-md w-full animate-fade-in-up">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShoppingCart size={32} className="text-gray-500" />
                </div>

                <h1 className="text-3xl font-black mb-4 tracking-tight">Đã hủy thanh toán</h1>
                <p className="text-gray-400 mb-12 leading-relaxed">
                    Yêu cầu nâng cấp VIP của bạn đã bị hủy. Đừng lo lắng, chúng tôi vẫn luôn ở đây khi bạn sẵn sàng trải nghiệm các tính năng cao cấp.
                </p>

                <div className="flex flex-col md:flex-row gap-4">
                    <button 
                        onClick={() => navigate('/home')}
                        className="flex-1 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Quay lại Home
                    </button>
                    <button 
                        onClick={() => navigate('/premium')}
                        className="flex-1 py-4 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCcw size={18} /> Thử lại lần nữa
                    </button>
                </div>
            </div>

            <footer className="absolute bottom-8 text-gray-500 text-xs">
                &copy; 2026 Buzzify Premium. Trân trọng mọi sự ủng hộ của bạn.
            </footer>
        </div>
    );
};

export default PaymentCancel;
