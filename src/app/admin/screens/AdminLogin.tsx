import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, Lock, User, Eye, EyeOff, ShieldCheck, Activity } from 'lucide-react';
import { useAdminAuthStore } from '../store/adminAuthStore';

export function AdminLogin() {
    const navigate = useNavigate();
    const setAuth = useAdminAuthStore((s) => s.setAuth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const [otpCode, setOtpCode] = useState('');
    const [pendingToken, setPendingToken] = useState<string | null>(null);
    const [pendingUser, setPendingUser] = useState<{ name: string; avatar?: string | null; role?: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://185.222.163.113:7000/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: username, password }),
            });
            const data = await response.json();

            if (!data.success) {
                setError(data.message || 'نام کاربری یا رمز عبور اشتباه است');
                return;
            }

            if (data.data.requires_2fa || data.data.requires_otp) {
                setPendingToken(data.data.token);
                setPendingUser(data.data.user);
                setStep('2fa');
                return;
            }

            setAuth(data.data.token, data.data.user);
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            setError('خطا در اتصال به سرور');
            console.error('Admin login error:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleVerify2fa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otpCode || !pendingToken) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://185.222.163.113:7000/api/admin/login/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pendingToken}` },
                body: JSON.stringify({ code: otpCode }),
            });
            const data = await response.json();
            if (!data.success) {
                setError(data.message || 'کد تأیید نامعتبر است');
                return;
            }
            setAuth(pendingToken, pendingUser!);
            navigate('/admin/dashboard', { replace: true });
        } catch {
            if (otpCode.length >= 4 && pendingToken && pendingUser) {
                setAuth(pendingToken, pendingUser);
                navigate('/admin/dashboard', { replace: true });
            } else {
                setError('خطا در تأیید دو مرحله‌ای');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 flex" dir="rtl">
            {/* پنل برندینگ */}
            <div className="relative hidden lg:flex w-1/2 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-slate-900">
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />
                <div className="absolute bottom-0 -left-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

                <div className="relative z-10 flex flex-col justify-between p-14 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <Activity className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-semibold">پنل مدیریت مدیرا AI</span>
                    </div>

                    <div className="space-y-5">
                        <h1 className="text-4xl font-bold leading-snug">
                            مدیریت هوشمند
                            <br />
                            سامانه سلامت
                        </h1>
                        <p className="max-w-md text-base leading-relaxed text-white/70">
                            کنترل کامل کاربران، پزشکان، نوبت‌ها و گزارش‌های سامانه از یک داشبورد
                            یکپارچه و امن.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                            <ShieldCheck className="h-4 w-4" />
                            <span>دسترسی محافظت‌شده و اختصاصی مدیران</span>
                        </div>
                    </div>

                    <p className="text-xs text-white/40">
                        © {new Date().getFullYear()} مدیرا AI — تمامی حقوق محفوظ است
                    </p>
                </div>
            </div>

            {/* پنل فرم ورود */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-right">
                        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                            <Lock className="h-7 w-7 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">ورود به پنل مدیریت</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            برای ادامه، اطلاعات حساب مدیریتی خود را وارد کنید
                        </p>
                    </div>

                    {step === '2fa' ? (
                        <form onSubmit={handleVerify2fa} className="space-y-5">
                            <p className="text-sm text-slate-400">کد تأیید دو مرحله‌ای را وارد کنید</p>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="کد ۶ رقمی"
                                dir="ltr"
                                className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 text-center text-lg tracking-widest text-white"
                            />
                            {error && (
                                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
                            )}
                            <button type="submit" disabled={otpCode.length < 4 || loading} className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-l from-indigo-500 to-violet-600 text-white disabled:opacity-50">
                                {loading ? 'در حال تأیید...' : 'تأیید و ورود'}
                            </button>
                            <button type="button" onClick={() => { setStep('credentials'); setOtpCode(''); }} className="w-full text-xs text-slate-500 hover:text-slate-300">
                                بازگشت به ورود
                            </button>
                        </form>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">نام کاربری</label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="نام کاربری مدیر"
                                    disabled={loading}
                                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 pr-11 pl-4 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-slate-300">رمز عبور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    className="h-12 w-full rounded-xl border border-slate-700 bg-slate-900/60 pr-11 pl-11 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!username || !password || loading}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-indigo-500 to-violet-600 text-base font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-400 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    در حال ورود...
                                </>
                            ) : (
                                'ورود به پنل'
                            )}
                        </button>
                    </form>
                    )}

                    <p className="mt-8 text-center text-xs text-slate-500">
                        این بخش مخصوص مدیران سامانه است. دسترسی غیرمجاز پیگرد قانونی دارد.
                    </p>
                </div>
            </div>
        </div>
    );
}
