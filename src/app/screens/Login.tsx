import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useSettingsStore } from '../admin/store/settingsStore';

export function Login() {
  const navigate = useNavigate();
  const appName = useSettingsStore((s) => s.general.appName);
  const logoUrl = useSettingsStore((s) => s.general.logoUrl);
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-6" dir="rtl">
        <div className="w-full">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={appName} className="h-full w-full object-cover" />
              ) : (
                <Heart className="w-10 h-10 text-white fill-white" />
              )}
            </div>
            <h1 className="text-3xl mb-2 text-gray-900">{appName}</h1>
            <p className="text-gray-600">{welcomeText}</p>
          </div>

          {/* Login Card */}
          <Card className="p-6 shadow-xl border-0">
            {/*<h2 className="text-2xl mb-2 text-gray-900">خوش آمدید</h2>*/}
            {/*<p className="text-gray-600 mb-6">شماره تلفن خود را وارد کنید</p>*/}

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">شماره تلفن</label>
                <div className="relative">
                  <Input
                      type="tel"
                      placeholder="09123456789"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pr-4 h-12 text-lg border-gray-300 focus:border-blue-500 text-right"
                      dir="ltr"
                      disabled={loading}
                  />
                </div>
              </div>

              {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
              )}

              <Button
                  onClick={handleContinue}
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg"
                  disabled={!phoneNumber || loading}
              >
                {loading ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      در حال ارسال...
                    </>
                ) : (
                    <>
                      ادامه
                      <ArrowRight className="mr-2 w-5 h-5 rotate-180" />
                    </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              با ادامه، شما با شرایط و قوانین و حریم خصوصی ما موافقت می‌کنید
            </p>
          </Card>

          <p className="text-center text-gray-600 mt-6 text-sm">
            کد تایید از طریق پیامک برای شما ارسال خواهد شد
          </p>
        </div>
      </div>
  );
}
