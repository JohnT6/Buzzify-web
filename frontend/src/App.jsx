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
import { useParams } from 'react-router-dom';

const JamJoiner = () => {
    const { id } = useParams();
    const { joinJamSession } = useMusic();

    useEffect(() => {
        if (id) {
            // Slight delay to ensure context is fully mounted/ready
            setTimeout(() => {
                joinJamSession(id);
            }, 500);
        }
    }, [id]);

    return <Navigate to="/home" />;
};

const ProtectedRoute = ({ children }) => {
  const token = Cookies.get('access_token');
  return token ? children : <Navigate to="/" />;
};

const PublicRoute = ({ children }) => {
  const token = Cookies.get('access_token');
  return token ? <Navigate to="/home" /> : children;
};

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

import { MusicProvider, useMusic } from './context/MusicContext';
import MusicLayout from './layouts/MusicLayout';
import PlaylistView from './pages/Home/PlaylistView';
import LibraryView from './pages/Home/LibraryView';
import AlbumView from './pages/Home/AlbumView';
import ArtistView from './pages/Home/ArtistView';
import ProfileView from './pages/Home/ProfileView';
import ExploreView from './pages/Home/ExploreView';
import SearchView from './pages/Home/SearchView';

import ArtistLayout from './layouts/ArtistLayout';
import PerformanceOverview from './pages/Artist/PerformanceOverview';
import MusicManagement from './pages/Artist/MusicManagement';
import ArtistAlbumManagement from './pages/Artist/AlbumManagement';
import ArtistSettings from './pages/Artist/ArtistSettings';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import ArtistManagement from './pages/Admin/ArtistManagement';
import AdminAlbumManagement from './pages/Admin/AlbumManagement';
import PlaylistManagement from './pages/Admin/PlaylistManagement';

import PremiumUpgrade from './pages/Premium/PremiumUpgrade';
import PaymentSuccess from './pages/Premium/PaymentSuccess';
import PaymentFailed from './pages/Premium/PaymentFailed';
import PaymentCancel from './pages/Premium/PaymentCancel';

import ConfirmJamActionModal from './components/MusicPlayer/ConfirmJamActionModal';

const ArtistRoute = ({ children }) => {
  const token = Cookies.get('access_token');
  const { user } = useMusic();
  
  if (!token) return <Navigate to="/login" />;
  // Nếu đã có user mà không phải artist thì đá về home
  if (user && user.vaiTro !== 'artist') return <Navigate to="/home" />;
  
  return children;
};

const AdminRoute = ({ children }) => {
  const token = Cookies.get('access_token');
  const { user } = useMusic();
  
  if (!token) return <Navigate to="/login" />;
  if (user && user.vaiTro !== 'admin') return <Navigate to="/home" />;
  
  return children;
};


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
      <Toaster position="top-right" reverseOrder={false} />
      <MusicProvider>
        <ConfirmJamActionModal />
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

            {/* Jam Share Link Route */}
            <Route path="/jam/:id" element={<ProtectedRoute><JamJoiner /></ProtectedRoute>} />

            {/* Artist Dashboard Routes */}
            <Route path="/artist" element={<ArtistRoute><ArtistLayout /></ArtistRoute>}>
              <Route index element={<PerformanceOverview />} />
              <Route path="music" element={<MusicManagement />} />
              <Route path="albums" element={<ArtistAlbumManagement />} />
              <Route path="settings" element={<ArtistSettings />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="artists" element={<ArtistManagement />} />
              <Route path="albums" element={<AdminAlbumManagement />} />
              <Route path="playlists" element={<PlaylistManagement />} />
            </Route>

            {/* Premium Routes */}
            <Route path="/premium" element={<ProtectedRoute><PremiumUpgrade /></ProtectedRoute>} />
            <Route path="/premium/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/premium/failed" element={<ProtectedRoute><PaymentFailed /></ProtectedRoute>} />
            <Route path="/premium/cancel" element={<ProtectedRoute><PaymentCancel /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </BrowserRouter>
      </MusicProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
