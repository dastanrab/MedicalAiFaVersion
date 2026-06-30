import { useState, type ReactNode } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Loader2, Mail, Lock, ShieldCheck, Stethoscope } from 'lucide-react';
import { providerLoginThemes } from '../../config/providerTheme';
import { useDoctorAuthStore } from '../store/doctorAuthStore';

export function DoctorLoginPage() {
    const navigate = useNavigate();
    const login = useDoctorAuthStore((s) => s.login);
    const theme = providerLoginThemes.doctor;
    const Icon = theme.icon;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password) {
            setError('ایمیل و رمز عبور را وارد کنید');
            return;
        }

        setLoading(true);
        setError('');

        const success = await login(username, password);
        if (success) {
            navigate('/provider/doctor/dashboard', { replace: true });
        } else {
            setError('ایمیل یا رمز عبور نادرست است');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-[YekanBakhFaNum]" dir="rtl">
            <div className="relative hidden w-1/2 overflow-hidden lg:block">
                <img
                    src={theme.loginImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className={`absolute inset-0 ${theme.imageOverlay}`} />

                <div className="relative z-10 flex h-full flex-col justify-between p-14 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                            <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-semibold">مدیرا AI — پنل پزشک</span>
                    </div>

                    <div className="space-y-5">
                        <h1 className="text-4xl font-bold leading-snug">{theme.headline}</h1>
                        <p className="block max-w-xl text-base leading-relaxed text-white/85">{theme.description}</p>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            <ShieldCheck className="h-4 w-4" />
                            <span>ورود امن با حساب کاربری پزشک</span>
                        </div>
                    </div>

                    <p className="text-xs text-white/50">© {new Date().getFullYear()} مدیرا AI</p>
                </div>
            </div>

            <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-right">
                        <div className="mb-4 flex justify-center lg:justify-start">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme.iconBg} ring-1 ${theme.iconRing}`}>
                                <Stethoscope className={`h-7 w-7 ${theme.iconColor}`} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">{theme.loginTitle}</h2>
                        <p className="mt-2 text-sm text-slate-600">{theme.loginSubtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm text-slate-700">ایمیل</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="doctor@test.com"
                                    dir="ltr"
                                    disabled={loading}
                                    className={`h-12 w-full rounded-xl border border-slate-200 bg-white pr-11 pl-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${theme.focusBorder} ${theme.focusRing}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-slate-700">رمز عبور</label>
                            <div className="relative">
                                <Lock className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••"
                                    dir="ltr"
                                    disabled={loading}
                                    className={`h-12 w-full rounded-xl border border-slate-200 bg-white pr-11 pl-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${theme.focusBorder} ${theme.focusRing}`}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l ${theme.buttonGradient} text-base font-medium text-white shadow-lg ${theme.buttonShadow} disabled:cursor-not-allowed disabled:opacity-50`}
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

                    <p className="mt-8 text-center text-xs text-slate-400">{theme.footerNote}</p>
                </div>
            </div>
        </div>
    );
}

interface DoctorPublicRouteProps {
    children: ReactNode;
}

export function DoctorPublicRoute({ children }: DoctorPublicRouteProps) {
    const isAuthenticated = useDoctorAuthStore((s) => s.isAuthenticated());
    if (isAuthenticated) {
        return <Navigate to="/provider/doctor/dashboard" replace />;
    }
    return children;
}

interface DoctorAuthGateProps {
    children: ReactNode;
}

export function DoctorAuthGate({ children }: DoctorAuthGateProps) {
    const isAuthenticated = useDoctorAuthStore((s) => s.isAuthenticated());
    if (!isAuthenticated) {
        return <Navigate to="/provider/doctor/login" replace />;
    }
    return children;
}
