import axios from './axios_customize';

// ─── Auth ─────────────────────────────────────────────────────────────────────

const loginApi = (email, password) => {
    const URL_BACKEND = "/api/v1/auth/login";
    const data = { Email: email, Password: password };
    return axios.post(URL_BACKEND, data);
}

const registerApi = (fullName, email, password) => {
    const URL_BACKEND = "/api/v1/auth/register";
    const data = { Email: email, FullName: fullName, Password: password };
    return axios.post(URL_BACKEND, data);
}

const forgotPasswordApi = (email) => {
    const URL_BACKEND = "/api/v1/auth/forgot-password";
    const data = { Email: email };
    return axios.post(URL_BACKEND, data);
}

const verifyEmailApi = (email, otp) => {
    const URL_BACKEND = "/api/v1/auth/verify-email";
    const data = { Email: email, Otp: otp };
    return axios.post(URL_BACKEND, data);
}

const resetPasswordApi = (email, otp, newPassword) => {
    const URL_BACKEND = "/api/v1/auth/reset-password";
    const data = { Email: email, Otp: otp, NewPassword: newPassword };
    return axios.post(URL_BACKEND, data);
}

const logoutApi = () => {
    const URL_BACKEND = "/api/v1/auth/logout";
    return axios.post(URL_BACKEND);
}

const googleLoginApi = (idToken) => {
    const URL_BACKEND = "/api/v1/auth/google-login";
    return axios.post(URL_BACKEND, { IdToken: idToken });
}

const facebookLoginApi = (token) => {
    const URL_BACKEND = "/api/v1/auth/facebook-login";
    return axios.post(URL_BACKEND, { Token: token });
}

// ─── User ─────────────────────────────────────────────────────────────────────

const getCurrentUserApi = () => {
    const URL_BACKEND = "/api/v1/users/me";
    return axios.get(URL_BACKEND);
}

// ─── Artist ───────────────────────────────────────────────────────────────────

const getArtistByIdApi = (id) => {
    const URL_BACKEND = `/api/v1/artists/${id}`;
    return axios.get(URL_BACKEND);
}

const getFollowedArtistsApi = (userId) => {
    const URL_BACKEND = `/api/v1/artists/followed?userId=${userId}`;
    return axios.get(URL_BACKEND);
}

const followArtistApi = (artistId, userId) => {
    const URL_BACKEND = `/api/v1/artists/${artistId}/follow?userId=${userId}`;
    return axios.post(URL_BACKEND);
}

const unfollowArtistApi = (artistId, userId) => {
    const URL_BACKEND = `/api/v1/artists/${artistId}/unfollow?userId=${userId}`;
    return axios.post(URL_BACKEND);
}

const checkFollowArtistApi = (artistId, userId) => {
    const URL_BACKEND = `/api/v1/artists/${artistId}/is-followed?userId=${userId}`;
    return axios.get(URL_BACKEND);
}

const getArtistStatsApi = (range = "28d") => {
    const URL_BACKEND = `/api/v1/artists/me/stats?range=${range}`;
    return axios.get(URL_BACKEND);
}

const getMyArtistProfileApi = () => {
    const URL_BACKEND = "/api/v1/artists/me";
    return axios.get(URL_BACKEND);
}

const getGenresApi = () => {
    const URL_BACKEND = "/api/v1/genres";
    return axios.get(URL_BACKEND);
}

// ─── Songs ────────────────────────────────────────────────────────────────────

const getSongsApi = (search = null, page = 1, pageSize = 20, artistId = null) => {
    let URL_BACKEND = `/api/v1/songs?page=${page}&pageSize=${pageSize}`;
    if (search) URL_BACKEND += `&search=${encodeURIComponent(search)}`;
    if (artistId) URL_BACKEND += `&artistId=${artistId}`;
    return axios.get(URL_BACKEND);
}

const getSongByIdApi = (id) => {
    const URL_BACKEND = `/api/v1/songs/${id}`;
    return axios.get(URL_BACKEND);
}

const playSongApi = (id) => {
    const URL_BACKEND = `/api/v1/songs/${id}/play`;
    return axios.post(URL_BACKEND);
}

const getMySongsApi = (search = "") => {
    const URL_BACKEND = `/api/v1/songs/me?search=${encodeURIComponent(search)}`;
    return axios.get(URL_BACKEND);
}

const createSongApi = (data) => {
    const URL_BACKEND = "/api/v1/songs";
    return axios.post(URL_BACKEND, data);
}

const updateSongApi = (id, data) => {
    const URL_BACKEND = `/api/v1/songs/${id}`;
    return axios.put(URL_BACKEND, data);
}

const deleteSongApi = (id) => {
    const URL_BACKEND = `/api/v1/songs/${id}`;
    return axios.delete(URL_BACKEND);
}

const uploadMediaApi = (type, formData, artistId = null, albumId = null, resourceId = null) => {
    let URL_BACKEND = `/api/v1/media/upload?type=${type}`;
    if (artistId) URL_BACKEND += `&artistId=${artistId}`;
    if (albumId) URL_BACKEND += `&albumId=${albumId}`;
    if (resourceId) URL_BACKEND += `&resourceId=${resourceId}`;
    
    return axios.post(URL_BACKEND, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

// ─── Playlists ────────────────────────────────────────────────────────────────

const getPlaylistsApi = () => {
    const URL_BACKEND = "/api/v1/playlists";
    return axios.get(URL_BACKEND);
}

const getPlaylistByIdApi = (id) => {
    const URL_BACKEND = `/api/v1/playlists/${id}`;
    return axios.get(URL_BACKEND);
}

const getMyPlaylistsApi = () => {
    const URL_BACKEND = `/api/v1/playlists/my`;
    return axios.get(URL_BACKEND);
}

const getLikedPlaylistApi = () => {
    const URL_BACKEND = "/api/v1/playlists/liked";
    return axios.get(URL_BACKEND);
}

// ─── Albums ───────────────────────────────────────────────────────────────────

const getAlbumsApi = (search = null, page = 1, pageSize = 20, artistId = null) => {
    let URL_BACKEND = `/api/v1/albums?page=${page}&pageSize=${pageSize}`;
    if (search) URL_BACKEND += `&search=${encodeURIComponent(search)}`;
    if (artistId) URL_BACKEND += `&artistId=${artistId}`;
    return axios.get(URL_BACKEND);
}

const getMyAlbumsApi = (search = "", page = 1, pageSize = 50) => {
    let URL_BACKEND = `/api/v1/albums/me?page=${page}&pageSize=${pageSize}`;
    if (search) URL_BACKEND += `&search=${encodeURIComponent(search)}`;
    return axios.get(URL_BACKEND);
}

const addSongToPlaylistApi = (playlistId, songId) => {
    const URL_BACKEND = `/api/v1/playlists/${playlistId}/Songs/${songId}`;
    return axios.post(URL_BACKEND);
}

const removeSongFromPlaylistApi = (playlistId, songId) => {
    const URL_BACKEND = `/api/v1/playlists/${playlistId}/Songs/${songId}`;
    return axios.delete(URL_BACKEND);
}

const savePlaylistApi = (id) => {
    const URL_BACKEND = `/api/v1/playlists/${id}/save`;
    return axios.post(URL_BACKEND);
}

const unsavePlaylistApi = (id) => {
    const URL_BACKEND = `/api/v1/playlists/${id}/save`;
    return axios.delete(URL_BACKEND);
}

const checkIfPlaylistSavedApi = (id) => {
    const URL_BACKEND = `/api/v1/playlists/${id}/is-saved`;
    return axios.get(URL_BACKEND);
}

const getSavedPlaylistsApi = () => {
    const URL_BACKEND = `/api/v1/playlists/saved`;
    return axios.get(URL_BACKEND);
}

const createAlbumApi = (data) => {
    const URL_BACKEND = "/api/v1/albums";
    return axios.post(URL_BACKEND, data);
}

const updateAlbumApi = (id, data) => {
    const URL_BACKEND = `/api/v1/albums/${id}`;
    return axios.put(URL_BACKEND, data);
}

const deleteAlbumApi = (id) => {
    const URL_BACKEND = `/api/v1/albums/${id}`;
    return axios.delete(URL_BACKEND);
}

const createPlaylistApi = (data) => {
    const URL_BACKEND = "/api/v1/playlists";
    return axios.post(URL_BACKEND, data);
}

const updatePlaylistApi = (id, data) => {
    const URL_BACKEND = `/api/v1/playlists/${id}`;
    return axios.put(URL_BACKEND, data);
}

const saveAlbumApi = (id) => {
    const URL_BACKEND = `/api/v1/albums/${id}/save`;
    return axios.post(URL_BACKEND);
}

const unsaveAlbumApi = (id) => {
    const URL_BACKEND = `/api/v1/albums/${id}/save`;
    return axios.delete(URL_BACKEND);
}

const checkIfAlbumSavedApi = (id) => {
    const URL_BACKEND = `/api/v1/albums/${id}/is-saved`;
    return axios.get(URL_BACKEND);
}

const getSavedAlbumsApi = () => {
    const URL_BACKEND = `/api/v1/albums/saved`;
    return axios.get(URL_BACKEND);
}

const getAlbumByIdAsync = (id) => {
    const URL_BACKEND = `/api/v1/albums/${id}`;
    return axios.get(URL_BACKEND);
}

const reorderTracksApi = (albumId, songIds) => {
    const URL_BACKEND = `/api/v1/albums/${albumId}/reorder-tracks`;
    return axios.put(URL_BACKEND, songIds);
}

const updatePlaybackStateApi = (state) => {
    const URL_BACKEND = "/api/v1/users/me/playback-state";
    return axios.patch(URL_BACKEND, state);
}

const globalSearchApi = (query) => {
    const URL_BACKEND = `/api/v1/search?query=${encodeURIComponent(query)}`;
    return axios.get(URL_BACKEND);
}

const searchByTypeApi = (query, type, page = 1, pageSize = 20) => {
    const URL_BACKEND = `/api/v1/search/all?query=${encodeURIComponent(query)}&type=${type}&page=${page}&pageSize=${pageSize}`;
    return axios.get(URL_BACKEND);
}

const updateProfileApi = (profileData) => {
    const URL_BACKEND = "/api/v1/users/me";
    return axios.patch(URL_BACKEND, profileData);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

const getAdminStatsOverviewApi = () => {
    const URL_BACKEND = "/api/v1/Admin/Stats/Overview";
    return axios.get(URL_BACKEND);
}

const getAdminDailyStreamsApi = () => {
    const URL_BACKEND = "/api/v1/Admin/Stats/Streams/Daily";
    return axios.get(URL_BACKEND);
}

const getAdminUsersApi = () => {
    const URL_BACKEND = "/api/v1/Admin/Users";
    return axios.get(URL_BACKEND);
}

const deleteAdminUserApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Users/${id}`;
    return axios.delete(URL_BACKEND);
}

const updateAdminUserRoleApi = (id, role) => {
    const URL_BACKEND = `/api/v1/Admin/Users/${id}/Role`;
    return axios.put(URL_BACKEND, { Role: role });
}

const getAdminArtistsApi = () => {
    const URL_BACKEND = "/api/v1/Admin/Artists";
    return axios.get(URL_BACKEND);
}

const deleteAdminArtistApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Artists/${id}`;
    return axios.delete(URL_BACKEND);
}

const toggleAdminUserLockApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Users/${id}/ToggleLock`;
    return axios.put(URL_BACKEND);
}

const toggleAdminArtistVerifyApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Artists/${id}/ToggleVerify`;
    return axios.put(URL_BACKEND);
}

const updateAdminArtistInfoApi = (id, data) => {
    const URL_BACKEND = `/api/v1/Admin/Artists/${id}/Info`;
    return axios.put(URL_BACKEND, data);
}

const toggleAdminPlaylistFeaturedApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Playlists/${id}/ToggleFeatured`;
    return axios.put(URL_BACKEND);
}

const getAdminPlaylistsApi = () => {
    const URL_BACKEND = "/api/v1/Admin/Playlists";
    return axios.get(URL_BACKEND);
};

const createAdminPlaylistApi = (data) => {
    const URL_BACKEND = "/api/v1/Admin/Playlists";
    return axios.post(URL_BACKEND, data);
};

const deleteAdminPlaylistApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Playlists/${id}`;
    return axios.delete(URL_BACKEND);
}

const updateAdminPlaylistApi = (id, data) => {
    const URL_BACKEND = `/api/v1/Admin/Playlists/${id}`;
    return axios.put(URL_BACKEND, data);
}

const addAdminPlaylistSongApi = (playlistId, songId) => {
    const URL_BACKEND = `/api/v1/Admin/Playlists/${playlistId}/Songs/${songId}`;
    return axios.post(URL_BACKEND);
}

const removeAdminPlaylistSongApi = (playlistId, songId) => {
    const URL_BACKEND = `/api/v1/Admin/Playlists/${playlistId}/Songs/${songId}`;
    return axios.delete(URL_BACKEND);
}

const toggleAdminSongMuteApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Songs/${id}/ToggleMute`;
    return axios.put(URL_BACKEND);
}

const toggleAdminSongHideApi = (id) => {
    const URL_BACKEND = `/api/v1/Admin/Songs/${id}/ToggleHide`;
    return axios.put(URL_BACKEND);
}

export {
    loginApi,
    registerApi,
    forgotPasswordApi,
    resetPasswordApi,
    verifyEmailApi,
    logoutApi,
    googleLoginApi,
    facebookLoginApi,
    getCurrentUserApi,
    updateProfileApi,
    getSongsApi,
    getSongByIdApi,
    playSongApi,
    getPlaylistsApi,
    getPlaylistByIdApi,
    getLikedPlaylistApi,
    getAlbumsApi,
    addSongToPlaylistApi,
    removeSongFromPlaylistApi,
    savePlaylistApi,
    unsavePlaylistApi,
    checkIfPlaylistSavedApi,
    getSavedPlaylistsApi,
    getSavedAlbumsApi,
    saveAlbumApi,
    unsaveAlbumApi,
    checkIfAlbumSavedApi,
    getMyPlaylistsApi,
    reorderTracksApi,
    getMyAlbumsApi,
    getAlbumByIdAsync,
    getArtistByIdApi,
    getFollowedArtistsApi,
    followArtistApi,
    unfollowArtistApi,
    checkFollowArtistApi,
    updatePlaybackStateApi,
    globalSearchApi,
    searchByTypeApi,
    createPlaylistApi,
    updatePlaylistApi,
    getArtistStatsApi,
    getMyArtistProfileApi,
    getGenresApi,
    createAlbumApi,
    updateAlbumApi,
    deleteAlbumApi,
    getMySongsApi,
    createSongApi,
    updateSongApi,
    deleteSongApi,
    uploadMediaApi,
    // Admin
    getAdminStatsOverviewApi,
    getAdminDailyStreamsApi,
    getAdminUsersApi,
    deleteAdminUserApi,
    updateAdminUserRoleApi,
    getAdminArtistsApi,
    deleteAdminArtistApi,
    toggleAdminUserLockApi,
    toggleAdminArtistVerifyApi,
    updateAdminArtistInfoApi,
    toggleAdminPlaylistFeaturedApi,
    deleteAdminPlaylistApi,
    toggleAdminSongMuteApi,
    toggleAdminSongHideApi,
    getAdminPlaylistsApi,
    createAdminPlaylistApi,
    updateAdminPlaylistApi,
    addAdminPlaylistSongApi,
    removeAdminPlaylistSongApi,
};
