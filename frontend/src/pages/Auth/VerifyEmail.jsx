import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Cookies from 'js-cookie';
import { Loader2 } from 'lucide-react';
import { verifyEmailApi } from '../../services/api_services';

const VerifyEmail = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await verifyEmailApi(email, fullCode);
      if (res && res.token) {
        Cookies.set('access_token', res.token, { expires: 7 });
        navigate('/home');
      } else {
        // Nếu API verify không trả token ngay thì về login
        navigate('/login');
      }
    } catch (err) {
      console.error('Verify error:', err);
      setError(err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Xác thực Email" 
      subtitle={`Chúng tôi đã gửi mã xác thực gồm 6 chữ số tới ${email || 'email của bạn'}`}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md animate-shake text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2">
          {code.map((digit, idx) => (
            <input
              key={idx}
              id={`code-${idx}`}
              type="text"
              pattern="\d*"
              maxLength="1"
              className="w-12 h-14 border border-gray-300 rounded-md text-center text-xl font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digit && idx > 0) {
                  document.getElementById(`code-${idx - 1}`).focus();
                }
              }}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-400"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "Xác nhận"}
        </button>

        <p className="text-center text-xs text-gray-500">
          Không nhận được mã? <button type="button" className="text-black font-semibold hover:underline">Gửi lại</button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyEmail;
