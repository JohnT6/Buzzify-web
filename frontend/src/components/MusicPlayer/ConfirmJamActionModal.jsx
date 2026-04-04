import React from 'react';
import { useMusic } from '../../context/MusicContext';
import { TriangleAlert, LogOut, FileWarning, Play } from 'lucide-react';

const ConfirmJamActionModal = () => {
    const { pendingJamAction, confirmJamAction, cancelJamAction } = useMusic();

    if (!pendingJamAction) return null;

    const isHostReplace = pendingJamAction.type === 'host_replace';

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={cancelJamAction}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Pattern */}
                <div className={`h-32 absolute top-0 left-0 right-0 opacity-20 bg-gradient-to-b ${isHostReplace ? 'from-amber-500/50' : 'from-rose-500/50'} to-transparent`} />

                <div className="relative p-8 text-center pt-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-[#1a1a1a] outline outline-1 outline-white/10 ${isHostReplace ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'} relative`}>
                            <div className="absolute inset-0 bg-current blur-2xl opacity-20 rounded-full" />
                            {isHostReplace ? <FileWarning size={32} /> : <LogOut size={32} />}
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-black text-white mb-3 tracking-tight">
                        {isHostReplace ? 'Xóa Hàng Chờ & Đề xuất?' : 'Rời Khỏi Phiên Jam?'}
                    </h2>
                    
                    <p className="text-[14px] text-white/50 leading-relaxed mb-8">
                        {isHostReplace 
                            ? "Thao tác này sẽ phát bài hát mới và thay thế toàn bộ Hàng chờ cùng Đề xuất hiện tại của phòng Jam. Toàn bộ vị khách sẽ được chuyển sang bài hát mới."
                            : "Việc tiếp tục sẽ khiến bạn thoát khỏi phòng Jam hiện tại. Thiết bị của bạn sẽ mất kết nối đồng bộ nhạc với Trưởng phòng."
                        }
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={cancelJamAction}
                            className="flex-1 px-4 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all text-[13px] uppercase tracking-widest outline-none focus:bg-white/10"
                        >
                            Hủy Bỏ
                        </button>
                        <button
                            onClick={confirmJamAction}
                            className={`flex-1 px-4 py-4 rounded-xl font-black transition-all shadow-lg text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 outline-none focus:ring-4 ${
                                isHostReplace 
                                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 focus:ring-amber-500/30'
                                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20 focus:ring-rose-500/30'
                            }`}
                        >
                            {isHostReplace ? <Play size={16} strokeWidth={3} /> : <LogOut size={16} strokeWidth={3} />}
                            {isHostReplace ? 'Tiếp tục phát' : 'Đồng ý Rời'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmJamActionModal;
