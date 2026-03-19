import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';

import MusicHome from './pages/Home/MusicHome';

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('access_token');
  return token ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const token = Cookies.get('access_token');
  return token ? <Navigate to="/home" /> : children;
};

import { GoogleOAuthProvider } from '@react-oauth/google';

import { MusicProvider } from './context/MusicContext';
import MusicLayout from './layouts/MusicLayout';
import PlaylistView from './pages/Home/PlaylistView';
import LibraryView from './pages/Home/LibraryView';
import AlbumView from './pages/Home/AlbumView';
import ArtistView from './pages/Home/ArtistView';
import ProfileView from './pages/Home/ProfileView';
import ExploreView from './pages/Home/ExploreView';
import SearchView from './pages/Home/SearchView';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <MusicProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            <Route path="/home" element={<ProtectedRoute><MusicLayout /></ProtectedRoute>}>
              <Route index element={<MusicHome />} />
              <Route path="playlist/:id" element={<PlaylistView />} />
              <Route path="library" element={<LibraryView />} />
              <Route path="album/:id" element={<AlbumView />} />
              <Route path="artist/:id" element={<ArtistView />} />
              <Route path="profile" element={<ProfileView />} />
              <Route path="browse" element={<ExploreView />} />
              <Route path="search" element={<SearchView />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </MusicProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
