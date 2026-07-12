import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Loader2, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useSettingsStore } from '../admin/store/settingsStore';

export function Login() {
  const navigate = useNavigate();
  const appName = useSettingsStore((s) => s.general.appName);
  const welcomeText = useSettingsStore((s) => s.content.welcomeText);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!phoneNumber) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://185.222.163.113:7000/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        // ذخیره شماره تلفن و OTP برای صفحه تایید
        navigate('/verify', { state: { phone: phoneNumber, otp: data.otp } });
      } else {
        setError(data.message || 'خطا در ارسال کد تایید');
      }
    } catch (err) {
      setError('خطا در برقراری ارتباط با سرور');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-full overflow-y-auto bg-white" dir="rtl">
      {/* پس‌زمینه تزئینی بر پایه رنگ برند */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[rgba(90,200,245,0.16)] to-transparent" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[rgba(90,200,245,0.22)] blur-3xl" />
      <div className="pointer-events-none absolute top-52 -right-28 h-64 w-64 rounded-full bg-[rgba(90,200,245,0.14)] blur-3xl" />

      <div className="relative flex min-h-full flex-col justify-center px-6 py-10">
        {/* لوگو */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <img
            src="/logo.svg"
            alt={appName}
            className="mx-auto w-44 drop-shadow-sm"
            draggable={false}
          />
          {welcomeText && <p className="mt-4 text-gray-500">{welcomeText}</p>}
        </div>

        {/* فرم ورود */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
          className="rounded-3xl border border-[rgba(90,200,245,0.25)] bg-white/80 p-6 shadow-xl shadow-[rgba(90,200,245,0.15)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <h1 className="mb-1 text-xl text-gray-900">ورود | ثبت‌نام</h1>
          <p className="mb-6 text-sm text-gray-500">
            برای ادامه، شماره تلفن همراه خود را وارد کنید
          </p>

          <div className="space-y-4">
            <div className="relative" dir="ltr">
              <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(90,200,245)]" />
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="09123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-14 rounded-2xl border-gray-200 bg-gray-50 pl-12 text-lg tracking-widest focus-visible:border-[rgb(90,200,245)] focus-visible:ring-[rgba(90,200,245,0.25)]"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-14 w-full rounded-2xl bg-[rgb(90,200,245)] text-lg text-white shadow-lg shadow-[rgba(90,200,245,0.4)] transition-all hover:bg-[rgb(62,185,238)] active:scale-[0.98]"
              disabled={!phoneNumber || loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  دریافت کد تایید
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </>
              )}
            </Button>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-gray-400">
            با ادامه، شما با{' '}
            <span className="text-[rgb(62,185,238)]">شرایط و قوانین</span> و{' '}
            <span className="text-[rgb(62,185,238)]">حریم خصوصی</span> ما موافقت
            می‌کنید
          </p>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400">
          <ShieldCheck className="h-4 w-4 text-[rgb(90,200,245)]" />
          کد تایید از طریق پیامک برای شما ارسال خواهد شد
        </div>
      </div>
    </div>
  );
}
