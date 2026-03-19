import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
    Edit2, Share2, MoreHorizontal, User, Plus
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const ProfileView = () => {
    const { user } = useOutletContext();

    const avatarSrc = user?.anhDaiDien 
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.hoTen || 'U')}&background=e11d48&color=fff&bold=true&size=512`;

    return (
        <div className="flex-1 overflow-y-auto custom-main-scroll bg-[#0e0e0e]" data-lenis-prevent>
            {/* Header / Banner (Image 3) */}
            <header className="relative h-[500px] mb-12 overflow-hidden group">
                {/* Banner Image with Blur Backdrop */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80" 
                        className="w-full h-full object-cover blur-[80px] opacity-30 scale-110" 
                        alt="" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />
                </div>

                <div className="relative z-10 h-full flex items-end px-16 pb-12 gap-12">
                    <div className="w-64 h-64 rounded-full overflow-hidden border-[12px] border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.6)] bg-[#1a1a1a] flex-shrink-0 group/avatar relative">
                         <img src={avatarSrc} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" alt={user?.hoTen} />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                            <Edit2 size={32} className="text-white" />
                         </div>
                    </div>
                    <div className="flex flex-col gap-6 mb-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[100px] font-black text-white tracking-widest uppercase leading-[0.8] drop-shadow-2xl">
                                {user?.hoTen || 'User Name'}
                            </h1>
                            <div className="flex items-center gap-4 mt-6">
                                <p className="text-white font-black text-sm tracking-[0.3em] uppercase opacity-40">@{user?.email.split('@')[0] || 'username'}</p>
                                <span className="text-white/10">•</span>
                                <p className="text-white font-black text-sm tracking-[0.3em] uppercase opacity-40">0 Fans</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-12 mt-4 ml-1">
                            <button className="flex flex-col items-center gap-2 group/btn">
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/btn:border-white/40 group-hover/btn:bg-white/5 transition-all">
                                    <Edit2 size={20} className="text-white/40 group-hover/btn:text-white" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover/btn:text-white">Edit</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 group/btn">
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/btn:border-white/40 group-hover/btn:bg-white/5 transition-all">
                                    <Share2 size={20} className="text-white/40 group-hover/btn:text-white" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover/btn:text-white">Share</span>
                            </button>
                            <button className="flex flex-col items-center gap-2 group/btn">
                                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover/btn:border-white/40 group-hover/btn:bg-white/5 transition-all">
                                    <MoreHorizontal size={20} className="text-white/40 group-hover/btn:text-white" />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 group-hover/btn:text-white">More</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Section */}
            <div className="px-16 pb-32">
                <div className="flex items-center gap-6 mb-16 p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-emerald-400 group-hover:text-emerald-400 transition-all">
                        <Plus size={24} />
                    </div>
                    <div>
                        <p className="text-base font-black text-white uppercase tracking-[0.2em] group-hover:text-emerald-400 transition-colors">Add Contributions ›</p>
                        <p className="text-xs font-medium text-white/40 mt-1">Enable fan support and showcase your creative works.</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8">
                        <User size={48} className="text-white/10" strokeWidth={1} />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] opacity-20">Your profile is empty</h2>
                    <p className="text-sm font-medium text-white/20 mt-4 tracking-widest uppercase">Start creating playlists or adding your social links</p>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
