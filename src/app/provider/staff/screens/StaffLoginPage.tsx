import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Loader2, Smartphone, UserCog } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp';
import { useSettingsStore } from '../../../admin/store/settingsStore';
import type { ProviderRole } from '../../config/providerNav';
import { providerBasePath } from '../../config/providerNav';
import { providerLoginThemes, providerRoleLabels } from '../../config/providerTheme';
import { showProviderError } from '../../utils/toast';
import { isValidIranPhone, normalizePhone } from '../../utils/validation';
import { staffApiEndpoints, staffPath, staffRoleConfig } from '../config/staffPermissions';
import { useStaffStore } from '../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

function mockOtpForLength(length: number): string {
    return Array.from({ length }, (_, i) => String((i % 9) + 1)).join('');
}

export function StaffLoginPage({ role }: { role: ProviderRole }) {
    const navigate = useNavigate();
    const theme = providerLoginThemes[role];
    const Icon = theme.icon;
    const staffTitle = staffRoleConfig[role].title;

    const otpLength = useSettingsStore((s) => s.auth.otpLength);
    const resendCooldownSec = useSettingsStore((s) => s.auth.resendCooldownSeconds);
    const findMemberByPhone = useStaffStore((s) => s.findMemberByPhone);
    const login = useStaffStore((s) => s.login);
    const loginWithToken = useStaffStore((s) => s.loginWithToken);

    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [pendingOtp, setPendingOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const apiEndpoints = staffApiEndpoints[role];

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    // ─── Send OTP ─────────────────────────────────────────────────────────────

    const sendOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const normalized = normalizePhone(phone);
        if (!isValidIranPhone(normalized)) {
            showProviderError('شماره موبایل معتبر وارد کنید');
            return;
        }

        setLoading(true);

        if (apiEndpoints) {
            try {
                const res = await fetch(`${API_BASE}${apiEndpoints.login}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ phone: normalized }),
                });
                const result = await res.json();
                if (!result.success) {
                    showProviderError(result.message);
                    return;
                }
                setPendingOtp(result.otp ? String(result.otp) : '');
                setPhone(normalized);
                setStep('otp');
                setOtp('');
                setCooldown(result.next_allowed_in_seconds ?? resendCooldownSec);
            } catch {
                showProviderError('خطا در ارتباط با سرور، دوباره تلاش کنید');
            } finally {
                setLoading(false);
            }
        } else {
            // mock
            const member = findMemberByPhone(normalized);
            if (!member || member.role !== role) {
                showProviderError(
                    `این شماره به‌عنوان ${staffTitle} در پنل ${providerRoleLabels[role]} ثبت نشده است`,
                );
                setLoading(false);
                return;
            }
            if (!member.active) {
                showProviderError('حساب کارمندی شما توسط صاحب حساب غیرفعال شده است');
                setLoading(false);
                return;
            }
            await new Promise((r) => setTimeout(r, 600));
            setPendingOtp(mockOtpForLength(otpLength));
            setPhone(normalized);
            setStep('otp');
            setOtp('');
            setCooldown(resendCooldownSec);
            setLoading(false);
        }
    };

    // ─── Verify OTP ───────────────────────────────────────────────────────────

    const verifyOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (otp.length !== otpLength) return;
        setLoading(true);

        if (apiEndpoints) {
            try {
                const res = await fetch(`${API_BASE}${apiEndpoints.verify}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ phone, code: otp }),
                });
                const result = await res.json();
                if (!result.success || !result.data?.access_token) {
                    showProviderError(result.message || 'خطا در احراز هویت');
                    setOtp('');
                    return;
                }

                // ارسال آبجکت کامل user برگشتی از لاراول به استور
                loginWithToken(role, phone, result.data.access_token, result.data.user);

                navigate(staffPath(role, 'dashboard'), { replace: true });
            } catch {
                showProviderError('خطا در ارتباط با سرور، دوباره تلاش کنید');
            } finally {
                setLoading(false);
            }
        } else {
            // حالت Mock برای مواردی که API ست نشده است
            await new Promise((r) => setTimeout(r, 500));
            setLoading(false);
            if (otp !== pendingOtp) {
                showProviderError('کد تأیید نادرست است');
                return;
            }
            const member = findMemberByPhone(phone);
            if (!member || member.role !== role || !member.active) {
                showProviderError('دسترسی شما به این پنل وجود ندارد');
                setStep('phone');
                return;
            }
            login(role, member);
            navigate(staffPath(role, 'dashboard'), { replace: true });
        }
    };

    // ─── Resend OTP ───────────────────────────────────────────────────────────

    const resendOtp = async () => {
        if (cooldown > 0) return;
        setLoading(true);

        if (apiEndpoints) {
            try {
                const res = await fetch(`${API_BASE}${apiEndpoints.login}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify({ phone }),
                });
                const result = await res.json();
                if (!result.success) {
                    showProviderError(result.message);
                    return;
                }
                setPendingOtp(result.otp ? String(result.otp) : '');
                setOtp('');
                setCooldown(result.next_allowed_in_seconds ?? resendCooldownSec);
            } catch {
                showProviderError('خطا در ارسال مجدد کد');
            } finally {
                setLoading(false);
            }
        } else {
            await new Promise((r) => setTimeout(r, 400));
            setPendingOtp(mockOtpForLength(otpLength));
            setOtp('');
            setCooldown(resendCooldownSec);
            setLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex min-h-screen w-full bg-white font-[YekanBakhFaNum]" dir="rtl">
            <div className="relative hidden w-1/2 overflow-hidden lg:block">
                <img src={theme.loginImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className={`absolute inset-0 ${theme.imageOverlay}`} />
                <div className="relative z-10 flex h-full flex-col justify-between p-14 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                            <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-xl font-semibold">مدیرا AI — {providerRoleLabels[role]}</span>
                    </div>
                    <div className="space-y-5">
                        <h1 className="text-4xl font-bold leading-snug">ورود {staffTitle}</h1>
                        <p className="block max-w-xl text-base leading-relaxed text-white/85">
                            دسترسی به کارهای روزانه مرکز با سطح دسترسی تعیین‌شده توسط سیستم.
                        </p>
                    </div>
                    <p className="text-xs text-white/50">© {new Date().getFullYear()} مدیرا AI</p>
                </div>
            </div>

            <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-right">
                        <div className="mb-4 flex justify-center lg:justify-start">
                            <div
                                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme.iconBg} ring-1 ${theme.iconRing}`}
                            >
                                <UserCog className={`h-7 w-7 ${theme.iconColor}`} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {step === 'phone' ? `ورود ${staffTitle}` : 'تأیید شماره موبایل'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {step === 'phone'
                                ? 'شماره موبایلی را که صاحب حساب برای شما ثبت کرده وارد کنید'
                                : `کد ${otpLength.toLocaleString('fa-IR')} رقمی ارسال‌شده به ${phone} را وارد کنید`}
                        </p>
                        {step === 'otp' && pendingOtp && (
                            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700 ring-1 ring-amber-200">
                                کد تست: <span className="font-mono font-bold tracking-widest">{pendingOtp}</span>
                            </p>
                        )}
                    </div>

                    {step === 'otp' ? (
                        <form onSubmit={verifyOtp} className="space-y-5">
                            <div className="flex justify-center" dir="ltr">
                                <InputOTP
                                    maxLength={otpLength}
                                    value={otp}
                                    onChange={setOtp}
                                    disabled={loading}
                                    autoFocus
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
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تأیید و ورود'}
                            </button>

                            <div className="flex items-center justify-between text-xs">
                                <button
                                    type="button"
                                    onClick={() => { setStep('phone'); setOtp(''); }}
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
                                        autoFocus
                                        className={`h-12 w-full rounded-xl border border-slate-200 bg-white pr-11 pl-4 text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${theme.focusBorder} ${theme.focusRing}`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={normalizePhone(phone).length < 11 || loading}
                                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l ${theme.buttonGradient} text-base font-medium text-white shadow-lg ${theme.buttonShadow} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'دریافت کد تأیید'}
                            </button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-xs text-slate-400">
                        صاحب حساب هستید؟{' '}
                        <Link
                            to={`${providerBasePath(role)}/login`}
                            className={`font-medium ${theme.iconColor} hover:underline`}
                        >
                            ورود صاحب حساب
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
