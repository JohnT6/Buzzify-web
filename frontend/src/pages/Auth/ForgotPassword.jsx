import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { Loader2 } from 'lucide-react';
import { forgotPasswordApi, resetPasswordApi } from '../../services/api_services';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [step, setStep] = useState(1); // 1: Gửi Email, 2: Nhập OTP & Đổi Mật khẩu
  
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPasswordApi(email);
      setStep(2);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra lại email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPasswordApi(email, otp, newPassword);
      setSuccessMsg("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng kiểm tra mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  if (successMsg) {
    return (
      <AuthLayout title="Thành công!" subtitle={successMsg}>
        <div className="text-center space-y-6">
          <div className="flex justify-center">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
               <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
             </div>
          </div>
          <p className="text-sm text-gray-600">Bạn sẽ được chuyển hướng về trang đăng nhập trong giây lát.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title={step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"} 
      subtitle={step === 1 ? "Nhập email của bạn để nhận mã OTP lấy lại mật khẩu" : `Vui lòng nhập mã OTP đã gửi tới ${email}`}
    >
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
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
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors mt-2 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Gửi yêu cầu"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative border border-gray-300 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
            <label className="absolute top-2 left-3 text-[10px] uppercase font-bold text-gray-500">
              Mã OTP
            </label>
            <input
              type="text"
              required
              className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-sm"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="VD: 123456"
              disabled={loading}
            />
          </div>

          <div className="relative border border-gray-300 rounded-md focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
            <label className="absolute top-2 left-3 text-[10px] uppercase font-bold text-gray-500">
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              className="w-full pt-6 pb-2 px-3 outline-none bg-transparent text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors mt-2 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đặt lại mật khẩu"}
          </button>
        </form>
      )}

      <div className="mt-8 text-center text-xs text-gray-500">
        Quay lại{' '}
        <Link to="/login" className="text-black font-semibold hover:underline">
          Đăng nhập
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
