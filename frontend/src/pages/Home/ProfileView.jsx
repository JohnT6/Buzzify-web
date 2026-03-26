import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
    Edit2, Share2, MoreHorizontal, User, Play, Heart
} from 'lucide-react';
import {
    getMyPlaylistsApi, getFollowedArtistsApi, updateProfileApi
} from '../../services/api_services';
import FollowingModal from '../../components/Profile/FollowingModal';
import EditProfileModal from '../../components/Profile/EditProfileModal';

const ProfileView = () => {
    const { user, setUser } = useOutletContext();
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [followedArtists, setFollowedArtists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                setIsLoading(true);
                const [playlistsRes, followedRes] = await Promise.all([
                    getMyPlaylistsApi(),
                    getFollowedArtistsApi(user.id)
                ]);

                if (playlistsRes.data) setPlaylists(playlistsRes.data);
                if (followedRes.data) setFollowedArtists(followedRes.data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const handleUpdateProfile = async (formData) => {
        try {
            await updateProfileApi(formData);
            // Update local user state to reflect changes
            setUser(prev => ({
                ...prev,
                hoTen: formData.hoTen,
                bio: formData.bio,
                link: formData.link,
                anhDaiDien: formData.anhDaiDien || null
            }));
            // Optionally re-fetch full user data to ensure consistency
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const avatarSrc = user?.anhDaiDien || user?.anhDaiDienProvider
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.hoTen || 'U')}&background=e11d48&color=fff&bold=true&size=512`;

    const username = user?.email?.split('@')[0] || 'username';

    return (
        <div className="flex-1 overflow-y-auto custom-main-scroll bg-[#0e0e0e]" data-lenis-prevent>
            {/* Header / Banner */}
            <header className="relative h-[480px] mb-12 overflow-hidden group">
                {/* Background Images */}
                <div className="absolute inset-0 z-0 flex">
                    {/* Left Part - Blurred */}
                    <div className="flex-1 relative overflow-hidden">
                        <img
                            src={avatarSrc}
                            className="w-full h-full object-cover object-left blur-[6px] opacity-40"
                            alt=""
                        />
                    </div>

                    {/* Center Part - Clear */}
                    <div className="w-[45%] lg:w-[40%] relative">
                        <img
                            src={avatarSrc}
                            className="w-full h-full object-cover"
                            alt="Profile Background"
                        />
                    </div>

                    {/* Right Part - Blurred */}
                    <div className="flex-1 relative overflow-hidden">
                        <img
                            src={avatarSrc}
                            className="w-full h-full object-cover object-right blur-[6px] opacity-40"
                            alt=""
                        />
                    </div>
                </div>

                {/* Global Overlays for seamless blending */}
                {/* 1. Horizontal gradient: Darker on sides, clear in middle */}
                <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0e0e0e]/60 via-transparent to-[#0e0e0e]/60" />
                
                {/* 2. Bottom gradient for text readability */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 z-[2] bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/40 to-transparent" />

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end px-16 pb-12">
                    <div className="flex flex-col gap-6 max-w-4xl">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-6xl font-black text-white tracking-tight leading-tight">
                                {user?.hoTen || 'User Name'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-white/40 tracking-wider lowercase">@{username}</span>
                                <span className="text-white/10 mx-1">•</span>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-sm font-bold text-white/40 hover:text-white transition-all tracking-wider"
                                >
                                    {followedArtists?.length || 0} following
                                </button>
                            </div>
                            <button className="text-[11px] font-black text-white/20 tracking-[0.2em] mt-3 hover:text-white/60 transition-colors text-left w-fit uppercase">
                                Add bio
                            </button>
                        </div>

                        {/* Action Buttons (Icons above text) */}
                        <div className="flex items-center gap-10 mt-6 -ml-1">
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex flex-col items-center gap-2 group/btn cursor-pointer"
                            >
                                <div className="p-1 text-white/40 group-hover/btn:text-white transition-all transform group-hover/btn:scale-110">
                                    <Edit2 size={22} strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-bold text-white/40 group-hover/btn:text-white transition-colors">Edit</span>
                            </button>

                            <button className="flex flex-col items-center gap-2 group/btn cursor-pointer">
                                <div className="p-1 text-white/40 group-hover/btn:text-white transition-all transform group-hover/btn:scale-110">
                                    <Share2 size={22} strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-bold text-white/40 group-hover/btn:text-white transition-colors">Share</span>
                            </button>

                            <button className="flex flex-col items-center gap-2 group/btn cursor-pointer">
                                <div className="p-1 text-white/40 group-hover/btn:text-white transition-all transform group-hover/btn:scale-110">
                                    <MoreHorizontal size={22} strokeWidth={2} />
                                </div>
                                <span className="text-[11px] font-bold text-white/40 group-hover/btn:text-white transition-colors">More</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Section */}
            <div className="px-16 pb-32">
                {playlists.length > 0 && !isLoading && (
                    <section>
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em]">Your Playlists</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    className="group cursor-pointer"
                                    onClick={() => navigate(`/home/playlist/${playlist.id}`)}
                                >
                                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-[#1a1a1a] shadow-xl">
                                        <img
                                            src={playlist.anhBia || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80'}
                                            alt={playlist.ten}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                                                <Play size={24} fill="currentColor" className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-base font-black text-white uppercase tracking-wider truncate mb-1">
                                        {playlist.ten}
                                    </h3>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                        {playlist.songCount || 0} tracks
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {isLoading && (
                    <section>
                         <div className="flex items-center justify-between mb-12">
                            <div className="h-8 bg-white/5 rounded w-48 animate-pulse" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-white/5 rounded-2xl mb-4" />
                                    <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-white/5 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {playlists.length === 0 && !isLoading && (
                    <section className="flex flex-col items-center justify-center py-48">
                        <div className="w-32 h-32 rounded-full border-2 border-white/5 flex items-center justify-center mb-10 bg-white/[0.02]">
                            <User size={64} className="text-white/20" strokeWidth={1} />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">Your profile is empty</h2>
                        <p className="text-base text-white/40 max-w-[400px] text-center leading-relaxed">
                            Start creating playlists, or adding your social profiles.
                        </p>
                    </section>
                )}
            </div>

            {/* Modals */}
            <FollowingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                artists={followedArtists}
                userName={user?.hoTen}
            />

            <EditProfileModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onUpdate={handleUpdateProfile}
            />
        </div>
    );
};

export default ProfileView;
