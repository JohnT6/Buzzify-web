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
    getAlbumByIdAsync,
    getArtistByIdApi,
    getFollowedArtistsApi,
    followArtistApi,
    unfollowArtistApi,
    checkFollowArtistApi,
    updatePlaybackStateApi,
    globalSearchApi,
    searchByTypeApi,
};
