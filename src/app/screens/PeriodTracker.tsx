import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    Droplets,
    Heart,
    Plus,
    ChevronLeft,
    X,
    MessageCircle,
    Sparkles,
    Share2,
    Copy,
    CheckCircle2,
    Flame,
    Dumbbell,
    ChevronRight,
    Star,
    Settings,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AppBar } from '../components/AppBar';
import { useAuthStore } from "../store/authStore";
import {JalaliCalendarModal, gregorianToJalali, jalaliToGregorian, formatJalaliDate } from "../components/JalaliCalendarModal";
import { WorkoutModal } from '../components/WorkoutModal';

const API_BASE_URL = "http://185.222.163.113:7000/api/user";

// ---------- Jalali Helpers ----------
export interface JalaliDate {
    jy: number;
    jm: number;
    jd: number;
}



function parseGregorianString(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function dateToJalaliKey(date: Date): string {
    const j = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return formatJalaliDate(j);
}

// ---------- Constants ----------
const MOODS = [
    { id: 'happy', emoji: '😊', label: 'شاد' },
    { id: 'calm', emoji: '😌', label: 'آرام' },
    { id: 'sad', emoji: '😔', label: 'غمگین' },
    { id: 'angry', emoji: '😠', label: 'عصبی' },
    { id: 'tired', emoji: '😴', label: 'خسته' },
];

const FOODS = [
    { id: 'sweet', emoji: '🍫', label: 'شیرینی' },
    { id: 'salty', emoji: '🍟', label: 'شوری' },
    { id: 'sour', emoji: '🍋', label: 'ترشی' },
    { id: 'spicy', emoji: '🌶️', label: 'تندی' },
];

const PHYSICAL_SYMPTOMS = [
    { id: 'cramps', emoji: '🤕', label: 'درد شکم' },
    { id: 'headache', emoji: '🤯', label: 'سردرد' },
    { id: 'fatigue', emoji: '🥱', label: 'خستگی' },
    { id: 'bloating', emoji: '🎈', label: 'نفخ' },
    { id: 'acne', emoji: '🔴', label: 'جوش' },
    { id: 'back_pain', emoji: '🦴', label: 'کمر درد' },
];



// ---------- Workout Modal Component ----------
interface WorkoutModalProps {
    open: boolean;
    onClose: () => void;
}


// ---------- Insight Dialog Themes ----------
interface InsightDialogTheme {
    tipsIcon: string;
    tipsItemBg: string;
    tipsItemRing: string;
    tipsDot: string;
    button: string;
}

interface HealthInsight {
    id: number;
    title: string;
    description: string;
    details: string;
    tips: string[];
    icon: React.ReactNode;
    accent: string;
    iconBg: string;
    headerGradient: string;
    dialogTheme: InsightDialogTheme;
}

const PINK_DIALOG_THEME: InsightDialogTheme = {
    tipsIcon: 'text-pink-500',
    tipsItemBg: 'bg-[#FFF9FA]',
    tipsItemRing: 'ring-pink-50',
    tipsDot: 'bg-pink-400',
    button: 'h-11 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200/60 hover:from-pink-600 hover:to-rose-600',
};

const BLUE_DIALOG_THEME: InsightDialogTheme = {
    tipsIcon: 'text-sky-500',
    tipsItemBg: 'bg-sky-50',
    tipsItemRing: 'ring-sky-100',
    tipsDot: 'bg-sky-500',
    button: 'h-11 w-full rounded-2xl bg-gradient-to-l from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200/60 hover:from-sky-600 hover:to-blue-700',
};

// ---------- Main Component ----------
export default function PeriodTracker() {
    const { accessToken } = useAuthStore();

    // States
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [trackerSettings, setTrackerSettings] = useState<any>(null);
    const [dailyLog, setDailyLog] = useState<any>(null);

    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [isSymptomsModalOpen, setIsSymptomsModalOpen] = useState(false);
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
    const [isEditSettingsModalOpen, setIsEditSettingsModalOpen] = useState(false); // NEW
    const [isStartPeriodModalOpen, setIsStartPeriodModalOpen] = useState(false);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [activeInsight, setActiveInsight] = useState<HealthInsight | null>(null);

    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const [activeDateField, setActiveDateField] = useState<string | null>(null);

    const [setupData, setSetupData] = useState({
        last_period_start_date: getLocalDateString(new Date()),
        cycle_length: 28,
        period_length: 5
    });

    const [startPeriodData, setStartPeriodData] = useState({
        start_date: getLocalDateString(new Date()),
        end_date: ''
    });

    // Daily log states
    const [symptomText, setSymptomText] = useState('');
    const [selectedMood, setSelectedMood] = useState<string>('');
    const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
    const [selectedWater, setSelectedWater] = useState<number>(0);
    const [selectedCalorie, setSelectedCalorie] = useState<number>(0);
    const [selectedPhysicalSymptoms, setSelectedPhysicalSymptoms] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const selectedDateString = useMemo(() => getLocalDateString(selectedDate), [selectedDate]);
    const selectedJalali = useMemo(() => gregorianToJalali(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()), [selectedDate]);
    const selectedJalaliString = formatJalaliDate(selectedJalali);

    useEffect(() => {
        setStartPeriodData(prev => ({ ...prev, start_date: selectedDateString }));
    }, [selectedDateString]);

    // API calls
    const fetchTrackerSettings = useCallback(async () => {
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE_URL}/period-tracker`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const result = await res.json();
                setTrackerSettings(result.data);
                setIsSetupModalOpen(false);
                setIsEditSettingsModalOpen(false); // NEW
            } else if (res.status === 404) {
                setIsSetupModalOpen(true);
            }
        } catch (err) {
            console.error("خطا در دریافت اطلاعات ردیاب:", err);
        }
    }, [accessToken]);

    const fetchDailyLog = useCallback(async () => {
        if (!accessToken) return;
        try {
            const res = await fetch(`${API_BASE_URL}/period-tracker/daily-log/${selectedDateString}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
                const result = await res.json();
                const data = result.data;
                setDailyLog(data);
                if (data) {
                    setSymptomText(data.notes || '');
                    setSelectedMood(data.mood || '');
                    const symptomsArr: string[] = data.symptoms || [];
                    setSelectedFoods(symptomsArr.filter(f => FOODS.some(food => food.id === f)));
                    setSelectedWater(data.water || 0);
                    setSelectedCalorie(data.calorie || 0);
                    setSelectedPhysicalSymptoms(data.physical_symptoms || []);
                } else {
                    resetForm();
                }
            } else if (res.status === 404) {
                setDailyLog(null);
                resetForm();
            }
        } catch (err) {
            console.error("خطا در دریافت اطلاعات روزانه:", err);
        }
    }, [accessToken, selectedDateString]);

    useEffect(() => {
        fetchTrackerSettings();
    }, [fetchTrackerSettings]);

    useEffect(() => {
        fetchDailyLog();
    }, [fetchDailyLog]);

    const resetForm = () => {
        setSymptomText('');
        setSelectedMood('');
        setSelectedFoods([]);
        setSelectedWater(0);
        setSelectedCalorie(0);
        setSelectedPhysicalSymptoms([]);
    };

    const handleSaveSetup = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/period-tracker/init`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(setupData)
            });
            if (res.ok) {
                setIsSetupModalOpen(false);
                setIsEditSettingsModalOpen(false); // NEW
                fetchTrackerSettings();
            }
        } catch (err) {
            console.error("خطا در ذخیره تنظیمات اولیه:", err);
        } finally {
            setLoading(false);
        }
    };

    // NEW: open edit settings modal
    const openEditSettings = () => {
        if (trackerSettings) {
            setSetupData({
                last_period_start_date: trackerSettings.last_period_start_date,
                cycle_length: trackerSettings.cycle_length,
                period_length: trackerSettings.period_length,
            });
        }
        setIsEditSettingsModalOpen(true);
    };

    const handleSaveDailyLog = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const payload = {
                log_date: selectedDateString,
                mood: selectedMood || null,
                symptoms: selectedFoods,
                notes: symptomText || null,
                water: selectedWater || 0,
                calorie: selectedCalorie || 0,
                physical_symptoms: selectedPhysicalSymptoms,
            };
            const res = await fetch(`${API_BASE_URL}/period-tracker/daily-log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsSymptomsModalOpen(false);
                fetchDailyLog();
            }
        } catch (err) {
            console.error("خطا در ثبت علائم:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStartPeriod = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
            const payload: any = {
                start_date: startPeriodData.start_date,
            };
            if (startPeriodData.end_date) {
                payload.end_date = startPeriodData.end_date;
            }
            const res = await fetch(`${API_BASE_URL}/period-tracker/log`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (res.ok) {
                setIsStartPeriodModalOpen(false);
                setStartPeriodData(prev => ({ ...prev, end_date: '' }));
                fetchTrackerSettings();
                fetchDailyLog();
                alert(result.message || "شروع پریود با موفقیت ثبت شد.");
            } else {
                alert(result.message || "خطا در ثبت شروع پریود.");
            }
        } catch (err) {
            console.error("خطا در ثبت شروع پریود:", err);
            alert("خطا در ارتباط با سرور رخ داده است.");
        } finally {
            setLoading(false);
        }
    };

    const inviteLink = useMemo(() => {
        if (!trackerSettings?.partner_code) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/invite/${trackerSettings.partner_code}`;
    }, [trackerSettings]);

    const copyToClipboard = async (text: string) => {
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(textarea);
            return ok;
        } catch (error) {
            console.error('Clipboard copy failed:', error);
            return false;
        }
    };

    const handleCopyCode = async () => {
        if (!trackerSettings?.partner_code) return;
        const ok = await copyToClipboard(trackerSettings.partner_code);
        if (ok) {
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const handleCopyLink = async () => {
        if (!inviteLink) return;
        const ok = await copyToClipboard(inviteLink);
        if (ok) {
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const cycleLength = trackerSettings?.cycle_length || 28;
    const periodLength = trackerSettings?.period_length || 5;

    const daysUntil = useMemo(() => {
        if (trackerSettings?.last_period_start_date) {
            const lastStart = new Date(trackerSettings.last_period_start_date);
            const nextStart = new Date(lastStart.getTime() + cycleLength * 24 * 60 * 60 * 1000);
            const diffTime = nextStart.getTime() - new Date().getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
        }
        return 0;
    }, [trackerSettings, cycleLength]);

    const cycleProgress = (cycleLength - daysUntil) / cycleLength;
    const ringRadius = 108;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference * (1 - (isNaN(cycleProgress) ? 0.7 : cycleProgress));

    // Compute marked dates for calendar
    const markedDates = useMemo(() => {
        const result: Record<string, string> = {};
        if (trackerSettings?.last_period_start_date) {
            const lastStart = parseGregorianString(trackerSettings.last_period_start_date);
            const end = trackerSettings.last_period_end_date
                ? parseGregorianString(trackerSettings.last_period_end_date)
                : new Date(lastStart.getTime() + (periodLength - 1) * 24 * 60 * 60 * 1000);
            for (let d = new Date(lastStart); d <= end; d.setDate(d.getDate() + 1)) {
                result[dateToJalaliKey(d)] = 'period';
            }
            const nextStart = new Date(lastStart.getTime() + cycleLength * 24 * 60 * 60 * 1000);
            result[dateToJalaliKey(nextStart)] = 'next_period';
        }
        return result;
    }, [trackerSettings, cycleLength, periodLength]);

    // NEW: convert last period dates for display
    const lastPeriodStartJalali = trackerSettings?.last_period_start_date
        ? formatJalaliDate(gregorianToJalali(
            parseGregorianString(trackerSettings.last_period_start_date).getFullYear(),
            parseGregorianString(trackerSettings.last_period_start_date).getMonth() + 1,
            parseGregorianString(trackerSettings.last_period_start_date).getDate()
        ))
        : null;

    const lastPeriodEndJalali = trackerSettings?.last_period_end_date
        ? formatJalaliDate(gregorianToJalali(
            parseGregorianString(trackerSettings.last_period_end_date).getFullYear(),
            parseGregorianString(trackerSettings.last_period_end_date).getMonth() + 1,
            parseGregorianString(trackerSettings.last_period_end_date).getDate()
        ))
        : null;

    const insights: HealthInsight[] = [
        {
            id: 1,
            title: 'وضعیت پوست',
            description: 'امروز احتمال بروز جوش کمتر است. مرطوب‌کننده سبک کافی است.',
            details: 'در فاز لوتئال سطح پروژسترون بالا می‌رود و معمولاً پوست پایدارتر می‌شود. اگر پوستت خشک است، مرطوب‌کننده بدون چربی انتخاب کن و از محصولات سنگین که منافذ را می‌بندند پرهیز کن.',
            tips: [
                'پاک‌سازی ملایم صبح و شب',
                'استفاده از ضدآفتاب حتی در روزهای ابری',
                'نوشیدن آب کافی در طول روز',
                'پرهیز از لمس مکرر صورت',
            ],
            icon: <Heart className="w-5 h-5" />,
            accent: 'from-rose-400 to-pink-500',
            iconBg: 'bg-rose-50 text-rose-500',
            headerGradient: 'from-rose-500 via-pink-500 to-pink-600',
            dialogTheme: PINK_DIALOG_THEME,
        },
        {
            id: 2,
            title: 'سطح انرژی',
            description: 'زمان خوبی برای ورزش‌های سبک مثل یوگا یا پیاده‌روی است.',
            details: 'بدن در این روزها برای فعالیت متوسط آماده‌تر است. ورزش سبک می‌تواند خلق‌وخو را بهتر کند و احساس سنگینی قبل از پریود را کمتر کند؛ فقط به سیگنال‌های بدنت گوش بده.',
            tips: [
                '۳۰ دقیقه پیاده‌روی یا یوگای ملایم',
                'خواب منظم حدود ۷ تا ۸ ساعت',
                'میان‌وعده سبک با پروتئین و میوه',
                'استراحت کوتاه در صورت خستگی',
            ],
            icon: <Droplets className="w-5 h-5" />,
            accent: 'from-sky-400 to-blue-500',
            iconBg: 'bg-sky-50 text-sky-500',
            headerGradient: 'from-sky-500 via-blue-500 to-indigo-500',
            dialogTheme: BLUE_DIALOG_THEME,
        },
    ];

    const toggleSelection = (id: string, type: 'mood' | 'food' | 'physical') => {
        if (type === 'mood') {
            setSelectedMood(prev => prev === id ? '' : id);
        } else if (type === 'food') {
            setSelectedFoods(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        } else if (type === 'physical') {
            setSelectedPhysicalSymptoms(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        }
    };

    const getCalendarSelectedDate = (): JalaliDate | null => {
        switch (activeDateField) {
            case 'setup_start':
                return gregorianToJalali(...parseGregorianString(setupData.last_period_start_date).toISOString().slice(0, 10).split('-').map(Number) as [number, number, number]);
            case 'period_start':
                return gregorianToJalali(...parseGregorianString(startPeriodData.start_date).toISOString().slice(0, 10).split('-').map(Number) as [number, number, number]);
            case 'period_end':
                return startPeriodData.end_date
                    ? gregorianToJalali(...parseGregorianString(startPeriodData.end_date).toISOString().slice(0, 10).split('-').map(Number) as [number, number, number])
                    : null;
            default:
                return selectedJalali;
        }
    };

    const handleCalendarDateSelect = (date: JalaliDate) => {
        const greg = jalaliToGregorian(date.jy, date.jm, date.jd);
        const gregDate = new Date(greg.gy, greg.gm - 1, greg.gd);
        const gregStr = getLocalDateString(gregDate);

        if (activeDateField === 'setup_start') {
            setSetupData(prev => ({ ...prev, last_period_start_date: gregStr }));
        } else if (activeDateField === 'period_start') {
            setStartPeriodData(prev => ({ ...prev, start_date: gregStr }));
        } else if (activeDateField === 'period_end') {
            setStartPeriodData(prev => ({ ...prev, end_date: gregStr }));
        } else {
            setSelectedDate(gregDate);
        }
        setIsCalendarModalOpen(false);
    };

    const openCalendarForField = (field: string | null) => {
        setActiveDateField(field);
        setIsCalendarModalOpen(true);
    };

    // Water cups row component
    const waterCups = () => {
        return (
            <div className="flex flex-wrap gap-2">
                {[...Array(8)].map((_, i) => {
                    const cupNumber = i + 1;
                    const filled = selectedWater >= cupNumber;
                    return (
                        <button
                            key={cupNumber}
                            type="button"
                            onClick={() => setSelectedWater(prev => prev === cupNumber ? cupNumber - 1 : cupNumber)}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                                filled ? 'bg-sky-100 ring-2 ring-sky-300 scale-105' : 'bg-gray-50 opacity-50 hover:opacity-80'
                            }`}
                        >
                            💧
                        </button>
                    );
                })}
                <div className="flex items-center gap-2 w-full mt-1">
                    <input
                        type="number"
                        min="0"
                        max="20"
                        value={selectedWater}
                        onChange={(e) => setSelectedWater(parseInt(e.target.value) || 0)}
                        className="w-20 rounded-xl bg-white border border-pink-100 p-2 text-center text-sm text-gray-700 focus:ring-2 focus:ring-pink-200"
                    />
                    <span className="text-xs text-gray-500">لیوان</span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-pink-50 to-[#FFF9FA] pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/home" />

            <div className="px-6 pt-24">
                {/* Header */}
                <div className="relative mb-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-600 via-pink-500 to-rose-500 px-5 pt-5 pb-5 shadow-[0_8px_32px_rgba(236,72,153,0.28)]">
                        <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
                        <div className="relative z-10 flex items-center gap-4" dir="rtl">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                                <CalendarIcon className="h-7 w-7 text-white" />
                            </div>
                            <div className="min-w-0 flex-1 text-right">
                                <h1 className="text-xl font-bold leading-tight text-white">تقویم قاعدگی</h1>
                                <p className="mt-0.5 text-sm leading-snug text-pink-100">
                                    روز انتخابی شما: {selectedJalaliString}
                                </p>
                                {/* NEW: display period start/end */}
                                {lastPeriodStartJalali && (
                                    <p className="mt-1 text-xs leading-snug text-pink-200">
                                        آخرین پریود: {lastPeriodStartJalali}
                                        {lastPeriodEndJalali && ` تا ${lastPeriodEndJalali}`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {!trackerSettings && !isSetupModalOpen ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="animate-pulse bg-pink-100 h-20 w-20 rounded-full mb-4 flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-pink-500" />
                        </div>
                        <p className="text-gray-400">در حال دریافت تنظیمات شما...</p>
                    </div>
                ) : !trackerSettings && isSetupModalOpen ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl p-6 shadow-sm ring-1 ring-pink-50">
                        <div className="mb-4 rounded-full bg-pink-50 p-6">
                            <CalendarIcon className="h-12 w-12 text-pink-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">سیکل شما هنوز ثبت نشده است</h2>
                        <p className="mt-2 text-sm text-gray-400 px-6 leading-relaxed">
                            برای شروع پیگیری وضعیت، پیش‌بینی روزهای آینده و دریافت توصیه‌های مربوطه، لطفاً اطلاعات سیکل خود را وارد کنید.
                        </p>
                        <Button onClick={() => setIsSetupModalOpen(true)} className="mt-6 rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-white px-8 py-3 font-bold shadow-md shadow-pink-200">
                            ثبت اطلاعات اولیه
                        </Button>
                    </div>
                ) : (
                    <main className="space-y-6">
                        {/* Cycle Ring */}
                        <section className="flex flex-col items-center">
                            <div className="relative">
                                <svg className="-rotate-90" width="248" height="248" viewBox="0 0 248 248" aria-hidden>
                                    <circle cx="124" cy="124" r={ringRadius} fill="none" stroke="#fce7f3" strokeWidth="10" />
                                    <circle
                                        cx="124" cy="124" r={ringRadius} fill="none"
                                        stroke="url(#cycleGradient)" strokeWidth="10" strokeLinecap="round"
                                        strokeDasharray={ringCircumference}
                                        strokeDashoffset={ringOffset}
                                        className="transition-all duration-700 ease-out"
                                    />
                                    <defs>
                                        <linearGradient id="cycleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f472b6" />
                                            <stop offset="100%" stopColor="#fb7185" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="mb-1 rounded-full bg-pink-50 px-3 py-1 text-[11px] font-medium text-pink-500">فاز لوتئال</span>
                                    <span className="text-xs text-gray-400">پریود در</span>
                                    <span className="bg-gradient-to-b from-pink-500 to-rose-500 bg-clip-text text-6xl font-light leading-none text-transparent">{daysUntil}</span>
                                    <span className="text-sm text-gray-500">روز دیگر</span>
                                </div>
                            </div>
                        </section>

                        {/* Stats */}
                        <section className="grid grid-cols-4 gap-2 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-pink-50">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400">طول سیکل</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">{cycleLength} <span className="text-[8px] font-normal text-gray-400">روز</span></p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400">مدت پریود</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">{periodLength} <span className="text-[8px] font-normal text-gray-400">روز</span></p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400">💧 آب امروز</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">{dailyLog?.water || 0} <span className="text-[8px] font-normal text-gray-400">لیوان</span></p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400">🔥 کالری امروز</p>
                                <p className="mt-1 text-sm font-semibold text-gray-800">{dailyLog?.calorie || 0} <span className="text-[8px] font-normal text-gray-400">kcal</span></p>
                            </div>
                        </section>

                        {/* Edit Settings Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={openEditSettings}
                                className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-pink-600 shadow-sm ring-1 ring-pink-100 hover:bg-pink-50 transition-colors"
                            >
                                <Settings className="h-4 w-4" />
                                ویرایش تنظیمات
                            </button>
                        </div>

                        {/* Actions */}
                        <section className="flex gap-3">
                            <Button onClick={() => setIsSymptomsModalOpen(true)} className="h-12 flex-1 rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200/60 transition-all active:scale-[0.98] hover:from-pink-600 hover:to-rose-600">
                                <Plus className="ml-2 h-4 w-4" />
                                {dailyLog ? 'ویرایش علائم' : 'ثبت علائم روزانه'}
                            </Button>
                            <Button onClick={() => setIsStartPeriodModalOpen(true)} variant="outline" className="h-12 flex-1 rounded-2xl border-pink-200 bg-white text-pink-600 hover:bg-pink-50">
                                شروع پریود
                            </Button>
                        </section>

                        {/* Workout */}
                        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-50">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100">
                                    <Dumbbell className="h-3.5 w-3.5 text-pink-500" />
                                </div>
                                <h2 className="text-base font-bold text-gray-800">تمرین‌های مناسب پریود</h2>
                            </div>
                            <p className="mb-4 text-xs text-gray-500 leading-relaxed">
                                ورزش‌های سبک می‌توانند درد و خستگی را کاهش دهند. یک برنامه مناسب انتخاب کنید و قدم به قدم پیش بروید.
                            </p>
                            <Button onClick={() => setIsWorkoutModalOpen(true)} className="w-full h-11 rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-white text-sm font-bold hover:from-pink-600 hover:to-rose-600">
                                مشاهده تمرین‌ها
                            </Button>
                        </section>

                        {/* Partner Sync */}
                        {trackerSettings?.partner_code && (
                            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-50">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100">
                                        <Share2 className="h-3.5 w-3.5 text-pink-500" />
                                    </div>
                                    <h2 className="text-base font-bold text-gray-800">همگام‌سازی با پارتنر</h2>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                    با اشتراک‌گذاری این کد یا لینک، پارتنر شما می‌تواند بدون دیدن جزئیات حساس، از وضعیت کلی سیکل و حالات روحی شما برای حمایت بهتر مطلع شود.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between rounded-2xl bg-pink-50/50 p-3 ring-1 ring-pink-100">
                                        <span className="text-xs font-bold text-gray-500">کد اختصاصی:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-extrabold text-pink-600 tracking-wider">{trackerSettings.partner_code}</span>
                                            <button onClick={handleCopyCode} className="p-1.5 rounded-lg hover:bg-pink-100 transition-colors text-pink-600">
                                                {copiedCode ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button onClick={handleCopyLink} variant="outline" className="w-full h-11 rounded-2xl border-pink-200 bg-white text-xs text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2">
                                        {copiedLink ? (
                                            <>
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                لینک دعوت کپی شد!
                                            </>
                                        ) : (
                                            <>
                                                <Share2 className="h-4 w-4" />
                                                کپی لینک دعوت مستقیم پارتنر
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </section>
                        )}

                        {/* Date Selection */}
                        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-50">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-800">تغییر روز بررسی</h2>
                                <button
                                    type="button"
                                    onClick={() => openCalendarForField(null)}
                                    className="flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-600 transition-colors hover:bg-pink-100"
                                >
                                    <CalendarIcon className="h-3.5 w-3.5" />
                                    تقویم شمسی
                                </button>
                            </div>
                            <div className="rounded-2xl bg-[#FFF9FA] p-4 text-center ring-1 ring-pink-100">
                                <span className="text-sm font-bold text-gray-700">{selectedJalaliString}</span>
                            </div>
                        </section>

                        {/* Smart Insights */}
                        <section className="space-y-3 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100">
                                    <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                                </div>
                                <h2 className="text-base font-bold text-gray-800">توصیه‌های هوشمند</h2>
                            </div>
                            {insights.map((item) => (
                                <Card
                                    key={item.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setActiveInsight(item)}
                                    className="cursor-pointer overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-sm ring-1 ring-pink-50 transition-all hover:shadow-md hover:ring-pink-100 active:scale-[0.99]"
                                >
                                    <div className="flex">
                                        <div className={`w-1 shrink-0 bg-gradient-to-b ${item.accent}`} />
                                        <div className="flex flex-1 items-center gap-3 p-4">
                                            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                                                {item.icon}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                                                <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.description}</p>
                                            </div>
                                            <ChevronLeft className="h-4 w-4 shrink-0 text-gray-300" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </section>
                    </main>
                )}
            </div>

            {/* Setup Modal (initial + edit) */}
            {(isSetupModalOpen || isEditSettingsModalOpen) && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
                    <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                {isEditSettingsModalOpen ? 'ویرایش اطلاعات' : 'خوش آمدید!'}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {isEditSettingsModalOpen ? 'اطلاعات سیکل خود را به‌روزرسانی کنید' : 'برای شروع، اطلاعات سیکل خود را وارد کنید'}
                            </p>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-bold text-gray-400 mr-2">تاریخ شروع آخرین پریود</label>
                                <button
                                    type="button"
                                    onClick={() => openCalendarForField('setup_start')}
                                    className="w-full rounded-2xl bg-gray-50 p-4 text-center text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                >
                                    {formatJalaliDate(gregorianToJalali(
                                        parseGregorianString(setupData.last_period_start_date).getFullYear(),
                                        parseGregorianString(setupData.last_period_start_date).getMonth() + 1,
                                        parseGregorianString(setupData.last_period_start_date).getDate()
                                    ))}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-bold text-gray-400 mr-2">میانگین سیکل (روز)</label>
                                    <input
                                        type="number"
                                        placeholder="مثلاً ۲۸"
                                        className="w-full rounded-2xl bg-gray-50 p-4 text-center text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                        value={setupData.cycle_length}
                                        onChange={(e) => setSetupData({ ...setupData, cycle_length: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="text-xs font-bold text-gray-400 mr-2">مدت پریود (روز)</label>
                                    <input
                                        type="number"
                                        placeholder="مثلاً ۵"
                                        className="w-full rounded-2xl bg-gray-50 p-4 text-center text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                        value={setupData.period_length}
                                        onChange={(e) => setSetupData({ ...setupData, period_length: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            disabled={loading}
                            className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-lg font-bold text-white shadow-lg shadow-pink-200/50"
                            onClick={handleSaveSetup}
                        >
                            {loading ? 'در حال ثبت...' : isEditSettingsModalOpen ? 'ذخیره تغییرات' : 'شروع استفاده'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Start Period Modal */}
            {isStartPeriodModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
                    <div className="w-full max-w-sm rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] animate-in zoom-in-95 duration-200">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">ثبت شروع دوره جدید</h3>
                            <button onClick={() => setIsStartPeriodModalOpen(false)} className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-gray-100 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-bold text-gray-400 mr-2">تاریخ شروع پریود</label>
                                <button
                                    type="button"
                                    onClick={() => openCalendarForField('period_start')}
                                    className="w-full rounded-2xl bg-[#FFF9FA] p-4 text-center text-sm outline-none ring-1 ring-pink-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                >
                                    {formatJalaliDate(gregorianToJalali(
                                        parseGregorianString(startPeriodData.start_date).getFullYear(),
                                        parseGregorianString(startPeriodData.start_date).getMonth() + 1,
                                        parseGregorianString(startPeriodData.start_date).getDate()
                                    ))}
                                </button>
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-xs font-bold text-gray-400 mr-2">تاریخ پایان پریود (اختیاری)</label>
                                <button
                                    type="button"
                                    onClick={() => openCalendarForField('period_end')}
                                    className="w-full rounded-2xl bg-[#FFF9FA] p-4 text-center text-sm outline-none ring-1 ring-pink-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                >
                                    {startPeriodData.end_date
                                        ? formatJalaliDate(gregorianToJalali(
                                            parseGregorianString(startPeriodData.end_date).getFullYear(),
                                            parseGregorianString(startPeriodData.end_date).getMonth() + 1,
                                            parseGregorianString(startPeriodData.end_date).getDate()
                                        ))
                                        : 'انتخاب کنید'}
                                </button>
                                <span className="block text-[10px] text-gray-400 mr-2 leading-relaxed">
                                    در صورتی که دوره به اتمام نرسیده است، این بخش را خالی بگذارید.
                                </span>
                            </div>
                        </div>

                        <Button
                            disabled={loading}
                            className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-base font-bold text-white shadow-lg hover:from-pink-600 hover:to-rose-600"
                            onClick={handleSaveStartPeriod}
                        >
                            {loading ? 'در حال ثبت...' : 'ثبت شروع دوره جدید'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Insight Detail Modal */}
            {activeInsight && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center" onClick={() => setActiveInsight(null)}>
                    <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className={`relative overflow-hidden bg-gradient-to-br px-6 pb-8 pt-6 ${activeInsight.headerGradient}`}>
                            <button onClick={() => setActiveInsight(null)} className="relative z-10 mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm">
                                <X className="h-5 w-5" />
                            </button>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                                    {React.cloneElement(activeInsight.icon as React.ReactElement, { className: 'h-8 w-8 text-white' })}
                                </div>
                                <h3 className="text-xl font-bold text-white">{activeInsight.title}</h3>
                            </div>
                        </div>
                        <div className="space-y-5 px-6 py-6">
                            <p className="text-sm leading-relaxed text-gray-600">{activeInsight.details}</p>
                            <ul className="space-y-2.5">
                                {activeInsight.tips.map((tip) => (
                                    <li key={tip} className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-600 ring-1 ${activeInsight.dialogTheme.tipsItemBg} ${activeInsight.dialogTheme.tipsItemRing}`}>
                                        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${activeInsight.dialogTheme.tipsDot}`} />
                                        <span className="leading-relaxed">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                            <Button className={activeInsight.dialogTheme.button} onClick={() => setActiveInsight(null)}>
                                متوجه شدم
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Symptoms Modal */}
            {isSymptomsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">ثبت وضعیت برای {selectedJalaliString}</h3>
                            <button onClick={() => setIsSymptomsModalOpen(false)} className="rounded-full bg-gray-50 p-2 text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-7">
                            {/* Water & Calorie */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                        <span>💧</span> آب مصرفی
                                    </label>
                                    {waterCups()}
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                        <span>🔥</span> کالری دریافتی (kcal)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full rounded-2xl bg-[#FFF9FA] p-3 text-center text-sm outline-none ring-1 ring-pink-100 focus:ring-2 focus:ring-orange-200 text-gray-700"
                                        value={selectedCalorie}
                                        onChange={(e) => setSelectedCalorie(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Mood */}
                            <div className="space-y-3">
                                <span className="block text-sm font-bold text-gray-700">حالت روحی چطوره؟</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {MOODS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleSelection(item.id, 'mood')}
                                            className={`flex w-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 transition-all ${
                                                selectedMood === item.id
                                                    ? 'scale-105 border-pink-400 bg-pink-50 shadow-sm'
                                                    : 'border-transparent bg-[#FFF9FA] ring-1 ring-pink-50 hover:bg-pink-50/50'
                                            }`}
                                        >
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className="text-[10px] text-gray-500">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Food Cravings */}
                            <div className="space-y-3">
                                <span className="block text-sm font-bold text-gray-700">هوس چه طعمی کردی؟</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {FOODS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleSelection(item.id, 'food')}
                                            className={`flex w-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 transition-all ${
                                                selectedFoods.includes(item.id)
                                                    ? 'scale-105 border-sky-300 bg-sky-50 shadow-sm'
                                                    : 'border-transparent bg-[#FFF9FA] ring-1 ring-pink-50 hover:bg-sky-50/50'
                                            }`}
                                        >
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className="text-[10px] text-gray-500">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Physical Symptoms */}
                            <div className="space-y-3">
                                <span className="block text-sm font-bold text-gray-700">علائم فیزیکی (در صورت وجود)</span>
                                <div className="flex flex-wrap gap-2.5">
                                    {PHYSICAL_SYMPTOMS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleSelection(item.id, 'physical')}
                                            className={`flex w-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 transition-all ${
                                                selectedPhysicalSymptoms.includes(item.id)
                                                    ? 'scale-105 border-amber-300 bg-amber-50 shadow-sm'
                                                    : 'border-transparent bg-[#FFF9FA] ring-1 ring-pink-50 hover:bg-amber-50/50'
                                            }`}
                                        >
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className="text-[10px] text-gray-500">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-pink-500">
                                    <MessageCircle className="h-4 w-4" />
                                    <span className="text-sm font-bold">یادداشت من</span>
                                </div>
                                <textarea
                                    className="w-full resize-none rounded-2xl border-0 bg-[#FFF9FA] p-4 text-sm outline-none ring-1 ring-pink-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                    placeholder="علائم یا اتفاقات امروز را بنویس..."
                                    rows={3}
                                    value={symptomText}
                                    onChange={(e) => setSymptomText(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            disabled={loading}
                            className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-base font-bold text-white shadow-lg hover:from-pink-600 hover:to-rose-600"
                            onClick={handleSaveDailyLog}
                        >
                            {loading ? 'در حال ذخیره...' : 'ثبت نهایی علائم روزانه'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Jalali Calendar Modal */}
            <JalaliCalendarModal
                open={isCalendarModalOpen}
                onClose={() => setIsCalendarModalOpen(false)}
                selectedDate={getCalendarSelectedDate()}
                onSelectDate={handleCalendarDateSelect}
                markedDates={markedDates}
            />
            {/* Workout Modal */}
            <WorkoutModal
                open={isWorkoutModalOpen}
                onClose={() => setIsWorkoutModalOpen(false)}
            />
        </div>
    );
}