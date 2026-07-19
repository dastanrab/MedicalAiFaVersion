import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Loader2, Smartphone, ArrowRight, UserRound, Building2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp';
import { useSettingsStore } from '../../admin/store/settingsStore';
import type { ProviderRole, NurseAccountType } from '../config/providerNav';
import { providerBasePath, providerPath } from '../config/providerNav';
import {
    providerLoginThemes,
    providerRoleLabels,
    providerDefaultNames,
} from '../config/providerTheme';
import { useProviderAuthStore } from '../store/providerAuthStore';
import { labAuthService } from '../services/labAuthService';
import { medicalCenterAuthService } from '../services/medicalCenterAuthService';
import { pharmacyAuthService } from '../services/pharmacyAuthService';
import { showProviderError } from '../utils/toast';

/** کد OTP نمایشی — تا اتصال API واقعی؛ با طول تنظیم‌شده در پنل ادمین هماهنگ است */
function mockOtpForLength(length: number): string {
    return Array.from({ length }, (_, i) => String((i % 9) + 1)).join('');
}

interface ProviderLoginProps {
    role: ProviderRole;
}

export function ProviderLogin({ role }: ProviderLoginProps) {
    const navigate = useNavigate();
    const setAuth = useProviderAuthStore((s) => s.setAuth);
    const theme = providerLoginThemes[role];
    const Icon = theme.icon;

    const otpLength = useSettingsStore((s) => s.auth.otpLength);
    const resendCooldownSec = useSettingsStore((s) => s.auth.resendCooldownSeconds);

    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [pendingOtp, setPendingOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [nurseAccountType, setNurseAccountType] = useState<NurseAccountType>('individual');

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const normalizePhone = (value: string) => value.replace(/\D/g, '').slice(0, 11);

    const sendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const normalized = normalizePhone(phone);
        if (normalized.length < 10) {
            showProviderError('شماره موبایل معتبر وارد کنید');
            return;
        }

        setLoading(true);

        try {
            if (role === 'lab') {
                await labAuthService.sendOtp(normalized);
            } else if (role === 'nurse') {
                await medicalCenterAuthService.sendOtp(normalized);
            } else if (role === 'pharmacy') {
                await pharmacyAuthService.sendOtp(normalized);
            } else {
                // mock سایر رول‌ها
                await new Promise((r) => setTimeout(r, 600));
                setPendingOtp(mockOtpForLength(otpLength));
            }
            setPhone(normalized);
            setStep('otp');
            setOtp('');
            setCooldown(resendCooldownSec);
        } catch (err) {
            showProviderError(err instanceof Error ? err.message : 'خطا در ارسال کد تأیید');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (otp.length !== otpLength) return;

        setLoading(true);

        try {
            if (role === 'lab') {
                const { token, user } = await labAuthService.verifyOtp(phone, otp);

                // دریافت پروفایل کامل آزمایشگاه
                let profileName = (user.name as string) ?? providerDefaultNames[role];
                try {
                    const profileRes = await labAuthService.getLabProfile(token);
                    if (profileRes?.data?.name) {
                        profileName = profileRes.data.name ?? providerDefaultNames[role];
                    }
                } catch {
                    // اگه پروفایل دریافت نشد، از name توکن استفاده می‌کنیم
                }

                setAuth(role, token, {
                    phone,
                    name: profileName,
                });
            } else if (role === 'nurse') {
                const { token, user } = await medicalCenterAuthService.verifyOtp(phone, otp);

                let profileName = (user.name as string) ?? providerDefaultNames[role];
                try {
                    const profileRes = await medicalCenterAuthService.getMedicalCenterProfile(token);
                    if (profileRes?.data?.name) {
                        profileName = profileRes.data.name ?? providerDefaultNames[role];
                    }
                } catch {
                    // اگه پروفایل دریافت نشد، از name توکن استفاده می‌کنیم
                }

                setAuth(role, token, {
                    phone,
                    name: profileName,
                });
            } else if (role === 'pharmacy') {
                const { token, user } = await pharmacyAuthService.verifyOtp(phone, otp);

                let profileName = (user.name as string) ?? providerDefaultNames[role];
                try {
                    const profileRes = await pharmacyAuthService.getPharmacyProfile(token);
                    if (profileRes?.data?.name) {
                        profileName = profileRes.data.name ?? providerDefaultNames[role];
                    }
                } catch {
                    // fallback به name توکن
                }

                setAuth(role, token, { phone, name: profileName });
            } else {
                // mock سایر رول‌ها
                await new Promise((r) => setTimeout(r, 500));
                if (otp !== pendingOtp) {
                    showProviderError('کد تأیید نادرست است');
                    return;
                }
                const mockToken = `provider-${role}-${Date.now()}`;
                setAuth(role, mockToken, {
                    phone,
                    name: providerDefaultNames[role],
                    ...(role === 'nurse' ? { nurseAccountType } : {}),
                });
            }
            navigate(providerPath(role, 'dashboard'), { replace: true });
        } catch (err) {
            showProviderError(err instanceof Error ? err.message : 'خطا در تأیید کد');
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        if (cooldown > 0) return;
        setLoading(true);
        try {
            if (role === 'lab') {
                await labAuthService.sendOtp(phone);
            } else if (role === 'nurse') {
                await medicalCenterAuthService.sendOtp(phone);
            } else if (role === 'pharmacy') {
                await pharmacyAuthService.sendOtp(phone);
            } else {
                await new Promise((r) => setTimeout(r, 400));
                setPendingOtp(mockOtpForLength(otpLength));
            }
            setOtp('');
            setCooldown(resendCooldownSec);
        } catch (err) {
            showProviderError(err instanceof Error ? err.message : 'خطا در ارسال مجدد کد');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white font-[YekanBakhFaNum]" dir="rtl">
            {/* سمت راست — تصویر با overlay */}
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
                        <span className="text-xl font-semibold">مدیرا AI — {providerRoleLabels[role]}</span>
                    </div>

                    <div className="space-y-5">
                        <h1 className="text-4xl font-bold leading-snug">{theme.headline}</h1>
                        <p className="block max-w-xl text-base leading-relaxed text-white/85">{theme.description}</p>
                    </div>

                    <p className="text-xs text-white/50">© {new Date().getFullYear()} مدیرا AI</p>
                </div>
            </div>

            {/* سمت چپ — فرم با پس‌زمینه سفید */}
            <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-right">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {step === 'phone' ? theme.loginTitle : 'تأیید شماره موبایل'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {step === 'phone'
                                ? theme.loginSubtitle
                                : `کد ${otpLength.toLocaleString('fa-IR')} رقمی ارسال‌شده به ${phone} را وارد کنید`}
                        </p>
                    </div>

                    {step === 'otp' ? (
                        <form onSubmit={verifyOtp} className="space-y-5">
                            <div className="flex justify-center" dir="ltr">
                                <InputOTP
                                    maxLength={otpLength}
                                    value={otp}
                                    onChange={setOtp}
                                    disabled={loading}
                                >
                                    <InputOTPGroup>
                                        {Array.from({ length: otpLength }, (_, i) => (
                                            <InputOTPSlot
                                                key={i}
                                                index={i}
                                                className={`h-14 w-12 border-slate-200 bg-white text-xl text-slate-900 ${theme.focusBorder}`}
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <button
                                type="submit"
                                disabled={otp.length !== otpLength || loading}
                                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l ${theme.buttonGradient} text-base font-medium text-white shadow-lg ${theme.buttonShadow} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'تأیید و ورود'
                                )}
                            </button>

                            <div className="flex items-center justify-between text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('phone');
                                        setOtp('');
                                    }}
                                    className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
                                >
                                    <ArrowRight className="h-3.5 w-3.5" />
                                    تغییر شماره
                                </button>
                                <button
                                    type="button"
                                    onClick={resendOtp}
                                    disabled={loading || cooldown > 0}
                                    className="text-slate-500 hover:text-slate-800 disabled:opacity-50"
                                >
                                    {cooldown > 0
                                        ? `ارسال مجدد (${cooldown.toLocaleString('fa-IR')} ثانیه)`
                                        : 'ارسال مجدد کد'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={sendOtp} className="space-y-5">
                            {role === 'nurse' && (
                                <div className="grid grid-cols-2 gap-2.5 rounded-2xl bg-slate-100/80 p-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setNurseAccountType('individual')}
                                        className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3.5 text-sm font-medium transition-all ${
                                            nurseAccountType === 'individual'
                                                ? 'bg-white text-rose-700 shadow-sm ring-1 ring-rose-200/80'
                                                : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                                        }`}
                                    >
                                        <UserRound
                                            className={`h-5 w-5 ${
                                                nurseAccountType === 'individual' ? 'text-rose-500' : 'text-slate-400'
                                            }`}
                                        />
                                        پرستار مستقل
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNurseAccountType('company')}
                                        className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3.5 text-sm font-medium transition-all ${
                                            nurseAccountType === 'company'
                                                ? 'bg-white text-rose-700 shadow-sm ring-1 ring-rose-200/80'
                                                : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
                                        }`}
                                    >
                                        <Building2
                                            className={`h-5 w-5 ${
                                                nurseAccountType === 'company' ? 'text-rose-500' : 'text-slate-400'
                                            }`}
                                        />
                                        شرکت خدمات پرستاری
                                    </button>
                                </div>
                            )}
                            <div>
                                <label className="mb-2 block text-sm text-slate-700">شماره موبایل</label>
                                <div className="relative">
                                    <Smartphone className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(normalizePhone(e.target.value))}
                                        placeholder="09123456789"
                                        dir="ltr"
                                        disabled={loading}
                                        className={`h-12 w-full rounded-xl border border-slate-200 bg-white pr-11 pl-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${theme.focusBorder} ${theme.focusRing}`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={normalizePhone(phone).length < 10 || loading}
                                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l ${theme.buttonGradient} text-base font-medium text-white shadow-lg ${theme.buttonShadow} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    'دریافت کد تأیید'
                                )}
                            </button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-xs text-slate-400">{theme.footerNote}</p>
                </div>
            </div>
        </div>
    );
}

interface ProviderPublicRouteProps {
    role: ProviderRole;
    children: ReactNode;
}

export function ProviderPublicRoute({ role, children }: ProviderPublicRouteProps) {
    const session = useProviderAuthStore((s) => s.sessions[role]);
    if (session?.token) {
        return <Navigate to={providerPath(role, 'dashboard')} replace />;
    }
    return children;
}

interface ProviderAuthGateProps {
    role: ProviderRole;
    children: ReactNode;
}

export function ProviderAuthGate({ role, children }: ProviderAuthGateProps) {
    const session = useProviderAuthStore((s) => s.sessions[role]);

    if (!session?.token) {
        return <Navigate to={`${providerBasePath(role)}/login`} replace />;
    }

    return children;
}
