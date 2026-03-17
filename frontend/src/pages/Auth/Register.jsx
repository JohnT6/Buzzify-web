import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { registerApi } from '../../services/api_services';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await registerApi(fullName, email, password);
      // Giả sử sau khi đăng ký thành công thì sang trang verify
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      console.error('Register error:', err);
      const resData = err.response?.data;
      const message = resData?.message || resData?.error || 'Đăng ký không thành công. Vui lòng thử lại.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Tạo tài khoản" 
      subtitle="Bắt đầu hành trình âm nhạc của bạn với Buzzify"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="relative border border-gray-300 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
          <label className="absolute top-2 left-3 text-[10px] uppercase font-bold text-gray-500">
            Họ và tên
          </label>
          <input
            type="text"
            required
            className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-sm"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-400 mt-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Tạo tài khoản"}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-gray-500">
        Bạn đã có tài khoản?{' '}
        <Link to="/login" className="text-black font-semibold hover:underline">
          Đăng nhập
        </Link>
      </div>

      <div className="mt-8 text-[10px] text-gray-400 text-center leading-relaxed">
        Bằng cách tạo tài khoản, bạn đồng ý với{' '}
        <a href="#" className="underline">Điều khoản dịch vụ</a> và{' '}
        <a href="#" className="underline">Chính sách bảo mật</a> của Buzzify.
      </div>
    </AuthLayout>
  );
};

export default Register;
