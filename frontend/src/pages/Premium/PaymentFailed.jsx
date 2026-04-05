import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, HelpCircle, MessageCircle } from 'lucide-react';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-red-900/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="text-center relative z-10 max-w-md w-full animate-fade-in-up">
                <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <div className="absolute inset-0 bg-red-900/30 rounded-full animate-pulse opacity-50" />
                    <AlertCircle size={48} className="text-red-500" />
                </div>

                <h1 className="text-4xl font-black mb-4 tracking-tight">Thanh toán thất bại</h1>
                <p className="text-gray-400 mb-12 leading-relaxed">
                    Có vẻ như một vấn đề gì đó đã xảy ra trong quá trình thanh toán của bạn. 
                    Đừng lo, hệ thống chưa trừ tiền của bạn.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12 space-y-4">
                    <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center text-orange-400">
                            <HelpCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Bạn đã điền ID chưa?</p>
                            <p className="text-xs text-gray-500">Mã chuyển khoản cần khớp hoàn toàn với mẫu.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => navigate('/premium')}
                        className="w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg shadow-red-900/10 hover:shadow-red-900/20"
                        style={{ background: '#e11d48' }}
                    >
                        Thử lại ngay
                    </button>
                    <button 
                        className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={18} /> Liên hệ hỗ trợ kỹ thuật
                    </button>
                </div>
            </div>

            <footer className="absolute bottom-8 text-gray-600 text-xs">
                &copy; 2026 Buzzify Music. Support ID: #ERR_PAY_500
            </footer>
        </div>
    );
};

export default PaymentFailed;
