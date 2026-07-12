import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowRight, Loader2, Pencil } from 'lucide-react';
import { Button } from '../components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../components/ui/input-otp';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../admin/store/settingsStore';

export function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone } = location.state || {};
  const appName = useSettingsStore((s) => s.general.appName);
  const otpLength = useSettingsStore((s) => s.auth.otpLength);
  const resendCooldown = useSettingsStore((s) => s.auth.resendCooldownSeconds);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const { setTokens } = useAuthStore();

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);


  const handleVerify = async () => {
    if (otp.length !== otpLength) return;

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
        setCooldown(resendCooldown);
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
    <div className="relative h-full overflow-y-auto bg-white" dir="rtl">
      {/* پس‌زمینه تزئینی بر پایه رنگ برند */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[rgba(90,200,245,0.16)] to-transparent" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[rgba(90,200,245,0.22)] blur-3xl" />
      <div className="pointer-events-none absolute top-52 -left-28 h-64 w-64 rounded-full bg-[rgba(90,200,245,0.14)] blur-3xl" />

      <div className="relative flex min-h-full flex-col px-6 py-8">
        {/* دکمه بازگشت */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(90,200,245,0.3)] bg-white/80 text-gray-600 shadow-sm transition-colors hover:text-[rgb(62,185,238)]"
          aria-label="بازگشت"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="flex flex-1 flex-col justify-center">
          {/* لوگو */}
          <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
            <img
              src="/logo.svg"
              alt={appName}
              className="mx-auto w-40 drop-shadow-sm"
              draggable={false}
            />
          </div>

          {/* کارت تایید کد */}
          <div className="rounded-3xl border border-[rgba(90,200,245,0.25)] bg-white/80 p-6 shadow-xl shadow-[rgba(90,200,245,0.15)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="mb-1 text-xl text-gray-900">کد تایید را وارد کنید</h1>
            <p className="text-sm text-gray-500">
              کد {otpLength.toLocaleString('fa-IR')} رقمی به شماره زیر پیامک شد
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-[rgb(62,185,238)]"
              dir="ltr"
            >
              <Pencil className="h-3.5 w-3.5" />
              {phone || '09123456789'}
            </button>

            <div className="mt-6 space-y-5">
              <div dir="ltr">
                <InputOTP
                  maxLength={otpLength}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                  containerClassName="w-full"
                >
                  <InputOTPGroup className="w-full justify-between gap-0">
                    {Array.from({ length: otpLength }, (_, i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-13 w-11 rounded-xl border border-gray-200 bg-gray-50 text-xl first:rounded-l-xl last:rounded-r-xl data-[active=true]:border-[rgb(90,200,245)] data-[active=true]:ring-[rgba(90,200,245,0.25)]"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerify}
                className="h-12 w-full rounded-2xl bg-[rgb(90,200,245)] text-base text-white shadow-lg shadow-[rgba(90,200,245,0.4)] transition-all hover:bg-[rgb(62,185,238)] active:scale-[0.98]"
                disabled={otp.length !== otpLength || loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'تأیید و ادامه'
                )}
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-400">کد را دریافت نکردید؟ </span>
              <button
                onClick={handleResend}
                disabled={loading || cooldown > 0}
                className="text-[rgb(62,185,238)] transition-opacity disabled:opacity-50"
              >
                {cooldown > 0
                  ? `ارسال مجدد (${cooldown.toLocaleString('fa-IR')} ثانیه)`
                  : 'ارسال مجدد کد'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
