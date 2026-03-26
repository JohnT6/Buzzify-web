import React from 'react';
import { X } from 'lucide-react';

const FollowingModal = ({ isOpen, onClose, artists, userName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[#121212] rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300 border border-white/5">
                {/* Header */}
                <div className="px-8 pt-8 pb-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex-1" />
                        <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] flex-1 text-center">{userName}</h2>
                        <div className="flex-1 flex justify-end">
                            <button 
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 relative border-b border-white/5">
                        <button className="pb-3 text-sm font-black uppercase tracking-widest text-white/20 cursor-not-allowed">
                            0 Fans
                        </button>
                        <button className="pb-3 text-sm font-black uppercase tracking-widest text-white relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white">
                            {artists?.length || 0} Following
                        </button>
                    </div>
                </div>

                {/* List */}
                <div 
                    className="px-4 pb-8 max-h-[400px] overflow-y-auto custom-main-scroll" 
                    data-lenis-prevent
                >
                    <p className="px-4 py-4 text-[11px] font-bold text-white/20 uppercase tracking-widest">
                        We limit the number of following shown
                    </p>

                    <div className="flex flex-col">
                        {artists && artists.length > 0 ? (
                            artists.map((artist) => {
                                const avatarSrc = artist.anhDaiDien || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.ten)}&background=random&size=128`;
                                return (
                                    <div 
                                        key={artist.id} 
                                        className="flex items-center justify-between px-4 py-4 hover:bg-white/5 rounded-2xl transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-white/10 transition-all">
                                                <img 
                                                    src={avatarSrc} 
                                                    alt={artist.ten} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-base font-black text-white uppercase tracking-wider">
                                                {artist.ten}
                                            </span>
                                        </div>
                                        <button className="px-6 py-3 rounded-full bg-white/10 text-xs font-black text-white/80 uppercase tracking-widest hover:bg-white/20 transition-all">
                                            Following
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center opacity-20">
                                <p className="text-sm font-black uppercase tracking-widest">No following yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FollowingModal;
