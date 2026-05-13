import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Shield, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';

export function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone } = location.state || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setTokens } = useAuthStore();


  const handleVerify = async () => {
    if (otp.length !== 4) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://185.222.163.113:7000/api/user/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          code: otp,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        setTokens(data.data.access_token);
        navigate('/home');
      } else {
        setError(data.message || 'کد تأیید نادرست است');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://185.222.163.113:7000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        setOtp('');
      } else {
        setError(data.message || 'خطا در ارسال مجدد کد');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white px-6 py-8" dir="rtl">
        <div>
          {/* Back Button */}
          <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowRight className="w-5 h-5 ml-2" />
            بازگشت
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl mb-2 text-gray-900">تأیید شماره تلفن</h1>
            <p className="text-gray-600">کد ۴ رقمی ارسال شده را وارد کنید</p>
            <p className="text-gray-900 mt-1">{phone || '09123456789'}</p>
          </div>

          {/* OTP Card */}
          <Card className="p-6 shadow-xl border-0">
            <div className="space-y-6">
              {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
              )}

              <div>
                <label className="block text-sm mb-4 text-center text-gray-700">
                  کد تأیید
                </label>
                <div className="flex justify-center" dir="ltr">
                  <InputOTP maxLength={4} value={otp} onChange={setOtp} disabled={loading}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                  onClick={handleVerify}
                  className="w-full h-12 bg-green-500 hover:bg-green-600 text-white text-lg shadow-lg"
                  disabled={otp.length !== 4 || loading}
              >
                {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      در حال بررسی...
                    </>
                ) : (
                    'تأیید و ادامه'
                )}
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">کد را دریافت نکردید؟</p>
              <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-500 hover:text-blue-700 text-sm mt-1 disabled:opacity-50"
              >
                ارسال مجدد کد
              </button>
            </div>
          </Card>
        </div>
      </div>
  );
}
