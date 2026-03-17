import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Cookies from 'js-cookie';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { loginApi, googleLoginApi, facebookLoginApi } from '../../services/api_services';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId      : import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/vi_VN/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    // credentialResponse từ GoogleLogin component chứa .credential (id_token)
    setLoading(true);
    setError('');
    try {
      const res = await googleLoginApi(credentialResponse.credential);
      if (res && res.token) {
        Cookies.set('access_token', res.token, { expires: 7 });
        navigate('/home');
      }
    } catch (err) {
      console.error('Google login error:', err);
      const resData = err.response?.data;
      const message = resData?.message || resData?.error || 'Đăng nhập Google thất bại. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const responseFacebook = async (authResponse) => {
    if (authResponse && authResponse.accessToken) {
      setLoading(true);
      setError('');
      try {
        const res = await facebookLoginApi(authResponse.accessToken);
        if (res && res.token) {
          Cookies.set('access_token', res.token, { expires: 7 });
          navigate('/home');
        }
      } catch (err) {
        console.error('Facebook login error:', err);
        const resData = err.response?.data;
        const message = resData?.message || resData?.error || 'Đăng nhập Facebook thất bại.';
        setError(message);
      } finally {
        setLoading(false);
      }
    } else {
        setError('Bạn đã hủy đăng nhập Facebook.');
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setError('Facebook SDK chưa tải xong. Vui lòng thử lại sau.');
      return;
    }
    
    window.FB.login(function(response) {
      if (response.authResponse) {
        responseFacebook(response.authResponse);
      } else {
        setError('Bạn đã hủy đăng nhập Facebook.');
      }
    }, {scope: 'public_profile,email'});
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // tokenResponse từ useGoogleLogin chứa access_token, không phải id_token
      // Fetch userinfo để lấy thông tin, sau đó gửi access_token lên backend
      setLoading(true);
      setError('');
      try {
        // Backend sẽ dùng access_token để lấy thông tin từ Google
        const res = await googleLoginApi(tokenResponse.access_token);
        if (res && res.token) {
          Cookies.set('access_token', res.token, { expires: 7 });
          navigate('/home');
        }
      } catch (err) {
        console.error('Google login error:', err);
        const resData = err.response?.data;
        const message = resData?.message || resData?.error || 'Đăng nhập Google thất bại. Vui lòng thử lại.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Đăng nhập Google thất bại.'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginApi(email, password);
      
      // Backend trả về 'token' trong AuthResponseDto
      if (res && res.token) {
        Cookies.set('access_token', res.token, { expires: 7 });
        navigate('/home');
      } else {
        setError('Đăng nhập không thành công. Hãy kiểm tra lại thông tin.');
      }
    } catch (err) {
      console.error('Login error:', err);
      const resData = err.response?.data;
      const message = resData?.message || resData?.error || 'Email hoặc mật khẩu không đúng.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Đăng nhập" 
      subtitle="Chào mừng trở lại! Tiếp tục với tài khoản của bạn."
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="relative border border-gray-300 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
          <label className="absolute top-2 left-3 text-[10px] uppercase font-bold text-gray-500">
            Địa chỉ Email
          </label>
          <input
            type="email"
            required
            className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="relative border border-gray-300 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
          <label className="absolute top-2 left-3 text-[10px] uppercase font-bold text-gray-500">
            Mật khẩu
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-sm pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 mt-2 text-gray-400 hover:text-black transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-400"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Đăng nhập"}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative px-3 bg-white text-xs text-gray-400 uppercase">hoặc</span>
      </div>

      <div className="space-y-3">
        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center gap-3 border border-gray-200 py-2.5 px-4 rounded-md hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1 text-center">Tiếp tục với Google</span>
        </button>

        <button 
          onClick={handleFacebookLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center gap-3 border border-gray-200 py-2.5 px-4 rounded-md hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg" alt="Facebook" className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium flex-1 text-center text-[#1877F2]">Tiếp tục với Facebook</span>
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        Bạn chưa có tài khoản Buzzify?{' '}
        <Link to="/register" className="text-black font-semibold hover:underline">
          Đăng ký
        </Link>
      </div>
      <div className="mt-2 text-center text-xs">
        <Link to="/forgot-password" size="sm" className="text-gray-500 hover:underline">
           Quên mật khẩu?
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
