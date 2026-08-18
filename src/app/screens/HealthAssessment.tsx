import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronLeft,
    ChevronRight,
    Activity,
    Heart,
    Droplet,
    Cigarette,
    Utensils,
    Users,
    AlertTriangle,
    CheckCircle2,
    Stethoscope,
    ArrowRight,
    Ruler,
    Scale,
    Moon,
    Brain,
    Wine,
    Apple,
    Dumbbell,
    Pill
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { AppBar } from '../components/AppBar';
import { toFaDigits } from '../provider/utils/jalali';

// نوع داده‌های فرم
interface FormData {
    weight: number | '';
    height: number | '';
    waist: number | ''; // دور شکم
    systolic: number | '';
    diastolic: number | '';
    fbs: number | '';
    medicalConditions: string[];
    medication: boolean;
    smoking: boolean;
    alcohol: boolean;
    physicalActivity: '' | 'none' | 'low' | 'moderate' | 'high';
    fastFood: number | '';
    fruitVeg: number | '';
    sleepHours: number | '';
    sleepQuality: '' | 'good' | 'fair' | 'poor';
    stressLevel: '' | 'low' | 'moderate' | 'high';
    redFlags: string[];
    familyHistory: string[];
}

const initialFormData: FormData = {
    weight: '',
    height: '',
    waist: '',
    systolic: '',
    diastolic: '',
    fbs: '',
    medicalConditions: [],
    medication: false,
    smoking: false,
    alcohol: false,
    physicalActivity: '',
    fastFood: '',
    fruitVeg: '',
    sleepHours: '',
    sleepQuality: '',
    stressLevel: '',
    redFlags: [],
    familyHistory: [],
};

const TOTAL_STEPS = 6;

export function HealthAssessment() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [score, setScore] = useState<number | null>(null);
    const [warnings, setWarnings] = useState<string[]>([]);

    useEffect(() => {
        const savedData = localStorage.getItem('userHealthData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // مهاجرت از نسخه قدیمی به جدید
                const migrated: FormData = { ...initialFormData };

                // کپی فیلدهای موجود در داده ذخیره‌شده با کنترل نوع مناسب
                Object.keys(migrated).forEach((key) => {
                    const k = key as keyof FormData;
                    if (parsed[k] !== undefined) {
                        if (k === 'familyHistory' || k === 'medicalConditions' || k === 'redFlags') {
                            // این فیلدها باید آرایه باشند؛ اگر بولین یا مقدار غیر آرایه‌ای بود، آرایه خالی در نظر بگیر
                            migrated[k] = Array.isArray(parsed[k]) ? parsed[k] : [];
                        } else {
                            migrated[k] = parsed[k];
                        }
                    }
                });

                // انتقال علائم هشدار قدیمی (که به صورت بولین بودند) به آرایه redFlags
                const oldRedFlags: string[] = [];
                if (parsed.chestPain === true) oldRedFlags.push('chestPain');
                if (parsed.shortnessOfBreath === true) oldRedFlags.push('shortnessOfBreath');
                if (parsed.fatigue === true) oldRedFlags.push('fatigue');
                if (oldRedFlags.length > 0) {
                    migrated.redFlags = [...new Set([...migrated.redFlags, ...oldRedFlags])];
                }

                setFormData(migrated);
            } catch (error) {
                console.error('خطا در خواندن اطلاعات:', error);
            }
        }

        const savedScore = localStorage.getItem('userHealthScore');
        const savedWarnings = localStorage.getItem('userHealthWarnings');

        if (savedScore) setScore(Number(savedScore));
        if (savedWarnings) {
            try { setWarnings(JSON.parse(savedWarnings)); } catch (e) {}
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const toggleArrayItem = (field: 'medicalConditions' | 'redFlags' | 'familyHistory', value: string) => {
        setFormData(prev => {
            const arr = prev[field] as string[];
            return {
                ...prev,
                [field]: arr.includes(value)
                    ? arr.filter(v => v !== value)
                    : [...arr, value]
            };
        });
    };

    const nextStep = () => setStep(p => Math.min(p + 1, TOTAL_STEPS));
    const prevStep = () => setStep(p => Math.max(p - 1, 1));

    const calculateScore = () => {
        let finalScore = 100;
        const newWarnings: string[] = [];
        const d = formData;

        // ۱. شاخص توده بدنی (BMI)
        if (d.weight && d.height) {
            const h = Number(d.height) / 100;
            const bmi = Number(d.weight) / (h * h);
            if (bmi > 25 && bmi < 30) {
                finalScore -= 5;
                newWarnings.push("شما اضافه‌وزن دارید. بهتر است با تغذیه سالم و ورزش به وزن مناسب برسید.");
            } else if (bmi >= 30) {
                finalScore -= 15;
                newWarnings.push("وزن شما در محدوده چاقی است. مراجعه به پزشک یا مشاور تغذیه توصیه می‌شود.");
            } else if (bmi < 18.5) {
                finalScore -= 5;
                newWarnings.push("وزن شما کمتر از حد طبیعی است. بررسی علت آن لازم است.");
            }
        }

        // ۲. دور شکم
        if (d.waist) {
            if (Number(d.waist) > 100) {
                finalScore -= 5;
                newWarnings.push("دور شکم بالای ۱۰۰ سانتی‌متر می‌تواند نشانه چربی احشایی زیاد باشد.");
            }
        }

        // ۳. فشار خون
        if (d.systolic && d.diastolic) {
            const sys = Number(d.systolic);
            const dia = Number(d.diastolic);
            if (sys > 130 || dia > 85) {
                finalScore -= 10;
                newWarnings.push("فشار خون شما بالاتر از حد طبیعی است. بهتر است آن را مرتب کنترل کنید.");
            }
            if (sys > 140 || dia > 90) {
                finalScore -= 10;
                newWarnings.push("فشار خون شما در محدوده خطرناک است. لطفاً به پزشک مراجعه کنید.");
            }
        }

        // ۴. قند خون ناشتا
        if (d.fbs) {
            const fbs = Number(d.fbs);
            if (fbs >= 100 && fbs < 126) {
                finalScore -= 10;
                newWarnings.push("قند خون ناشتای شما در مرز دیابت است. آزمایش مجدد و تغییر سبک زندگی توصیه می‌شود.");
            } else if (fbs >= 126) {
                finalScore -= 20;
                newWarnings.push("قند خون شما بالا است و احتمال دیابت وجود دارد. لطفاً به پزشک مراجعه کنید.");
            }
        }

        // ۵. سوابق پزشکی
        const conditionLabels: Record<string, string> = {
            hypertension: "فشار خون بالا",
            diabetes: "دیابت یا قند خون بالا",
            cholesterol: "چربی خون بالا",
            heart: "بیماری قلبی یا سابقه سکته قلبی",
            stroke: "سکته مغزی",
            kidney: "بیماری کلیوی",
            liver: "بیماری کبدی (مثل کبد چرب)",
            thyroid: "مشکلات تیروئید",
            asthma: "آسم یا مشکلات تنفسی",
            cancer: "سابقه سرطان یا تومور",
            other: "سایر بیماری‌های مزمن"
        };

        d.medicalConditions.forEach(cond => {
            if (cond === 'hypertension' || cond === 'diabetes' || cond === 'heart' || cond === 'stroke' || cond === 'kidney' || cond === 'cancer') {
                finalScore -= 10;
                newWarnings.push(`سابقه «${conditionLabels[cond]}» دارید. لطفاً تحت نظر پزشک باشید.`);
            } else {
                finalScore -= 5;
                newWarnings.push(`سابقه «${conditionLabels[cond]}» دارید. پیگیری منظم توصیه می‌شود.`);
            }
        });

        if (d.medication) {
            finalScore -= 5;
            newWarnings.push("دارو مصرف می‌کنید. حتماً تداخل دارویی و عوارض را با پزشک بررسی کنید.");
        }

        // ۶. سبک زندگی
        if (d.smoking) {
            finalScore -= 15;
            newWarnings.push("استعمال دخانیات خطر بیماری‌های قلبی، ریوی و سرطان را به شدت بالا می‌برد.");
        }
        if (d.alcohol) {
            finalScore -= 5;
            newWarnings.push("مصرف الکل می‌تواند به کبد و قلب آسیب بزند. بهتر است قطع یا محدود شود.");
        }
        if (d.physicalActivity === 'none') {
            finalScore -= 10;
            newWarnings.push("فعالیت بدنی ندارید. حداقل ۱۵۰ دقیقه پیاده‌روی در هفته می‌تواند سلامت شما را بهبود دهد.");
        } else if (d.physicalActivity === 'low') {
            finalScore -= 5;
            newWarnings.push("فعالیت بدنی شما کم است. سعی کنید بیشتر ورزش کنید.");
        }
        if (Number(d.fastFood) > 2) {
            finalScore -= 5;
            newWarnings.push("مصرف زیاد فست‌فود می‌تواند باعث کبد چرب و مشکلات قلبی شود.");
        }
        if (d.fruitVeg !== '' && Number(d.fruitVeg) < 2) {
            finalScore -= 5;
            newWarnings.push("مصرف میوه و سبزیجات شما کم است. روزانه حداقل ۲ واحد سبزی و ۲ واحد میوه بخورید.");
        }
        if (d.sleepHours) {
            const sleep = Number(d.sleepHours);
            if (sleep < 6 || sleep > 9) {
                finalScore -= 5;
                newWarnings.push("خواب شما در محدوده نامناسبی است. ۷ تا ۸ ساعت خواب شبانه توصیه می‌شود.");
            }
        }
        if (d.sleepQuality === 'poor') {
            finalScore -= 5;
            newWarnings.push("کیفیت خواب شما پایین است. اگر خروپف یا بی‌خوابی دارید، بررسی شود.");
        }
        if (d.stressLevel === 'high') {
            finalScore -= 10;
            newWarnings.push("استرس شدید دارید. مدیریت استرس و در صورت نیاز مشاوره روانشناسی کمک‌کننده است.");
        } else if (d.stressLevel === 'moderate') {
            finalScore -= 5;
            newWarnings.push("استرس متوسطی دارید. تکنیک‌های آرام‌سازی و ورزش منظم را امتحان کنید.");
        }

        // ۷. علائم هشدار
        const redFlagLabels: Record<string, string> = {
            chestPain: "درد قفسه سینه",
            shortnessOfBreath: "تنگی نفس",
            fatigue: "خستگی مزمن",
            palpitations: "تپش قلب",
            dizziness: "سرگیجه یا سبکی سر",
            swelling: "ورم پا یا مچ پا",
            headaches: "سردردهای مکرر",
            visionChanges: "تغییرات ناگهانی بینایی",
            numbness: "بی‌حسی یا گزگز اندام‌ها",
            mentalHealth: "احساس ناراحتی یا اضطراب شدید",
            weightChange: "کاهش یا افزایش وزن غیرعادی"
        };

        d.redFlags.forEach(flag => {
            if (flag === 'chestPain' || flag === 'shortnessOfBreath' || flag === 'palpitations' || flag === 'visionChanges' || flag === 'numbness') {
                finalScore -= 20;
                newWarnings.push(`علامت «${redFlagLabels[flag]}» جدی است. لطفاً فوراً با اورژانس یا پزشک تماس بگیرید.`);
            } else if (flag === 'dizziness' || flag === 'swelling') {
                finalScore -= 15;
                newWarnings.push(`علامت «${redFlagLabels[flag]}» نیاز به بررسی فوری پزشکی دارد.`);
            } else {
                finalScore -= 5;
                newWarnings.push(`«${redFlagLabels[flag]}» می‌تواند نشانه مشکلی باشد که باید بررسی شود.`);
            }
        });

        // ۸. سابقه خانوادگی
        const familyLabels: Record<string, string> = {
            heart: "بیماری قلبی",
            diabetes: "دیابت",
            highBP: "فشار خون بالا",
            cancer: "سرطان"
        };
        d.familyHistory.forEach(item => {
            finalScore -= 5;
            newWarnings.push(`سابقه «${familyLabels[item]}» در خانواده شما وجود دارد. چکاپ‌های منظم فراموش نشود.`);
        });

        finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));
        setScore(finalScore);
        setWarnings(newWarnings);

        localStorage.setItem('userHealthScore', finalScore.toString());
        localStorage.setItem('userHealthData', JSON.stringify(d));
        localStorage.setItem('userHealthWarnings', JSON.stringify(newWarnings));
    };

    const resetAssessment = () => {
        setScore(null);
        setWarnings([]);
        setStep(1);
        // برای شروع کاملاً تازه، فرم را پاک کنید:
        // setFormData(initialFormData);
        // localStorage.removeItem('userHealthData');
    };

    const getScoreInfo = (s: number) => {
        if (s >= 80) return { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'وضعیت مطلوب' };
        if (s >= 60) return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'نیاز به توجه' };
        return { color: 'text-rose-500', bg: 'bg-rose-500', label: 'وضعیت پرخطر' };
    };

    // رندر آیتم‌های چک‌لیست
    const renderChecklist = (
        items: { value: string; label: string; desc?: string }[],
        field: 'medicalConditions' | 'redFlags' | 'familyHistory',
        activeClass: string
    ) => (
        <div className="space-y-3">
            {items.map(item => {
                const selected = (formData[field] as string[]).includes(item.value);
                return (
                    <label
                        key={item.value}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 shadow-sm transition-all ${
                            selected ? activeClass : 'border-gray-100 bg-white hover:bg-gray-50'
                        }`}
                    >
                        <div>
                            <p className={`font-bold ${selected ? 'text-rose-700' : 'text-gray-900'}`}>{item.label}</p>
                            {item.desc && <p className={`mt-0.5 text-xs ${selected ? 'text-rose-500' : 'text-gray-500'}`}>{item.desc}</p>}
                        </div>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleArrayItem(field, item.value)}
                            className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                    </label>
                );
            })}
        </div>
    );

    return (
        <div className="relative h-full overflow-x-hidden overflow-y-auto bg-[#F6F8FC] pb-16 font-[YekanBakhFaNum]" dir="rtl">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] overflow-hidden">
                <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
                <div className="absolute -top-10 left-0 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
            </div>

            <AppBar showChat={false} />

            <div className="relative z-10 px-5 pt-24 pb-4 sm:px-6">
                {score === null ? (
                    <>
                        <div className="mb-8">
                            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
                                <ArrowRight className="h-4 w-4" />
                                بازگشت
                            </button>
                            <h1 className="text-2xl font-extrabold text-gray-900">پایش سلامت عمومی</h1>
                            <p className="mt-1 text-sm text-gray-500">به سوالات ساده پاسخ دهید تا تحلیل کاملی از وضعیت شما انجام شود.</p>

                            <div className="mt-6 flex items-center justify-between gap-2">
                                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                                    <div key={i} className="relative flex h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                                        <motion.div
                                            className="absolute inset-y-0 right-0 rounded-full bg-blue-600"
                                            initial={{ width: 0 }}
                                            animate={{ width: step >= i + 1 ? '100%' : '0%' }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-left text-xs font-bold text-blue-600">
                                مرحله {toFaDigits(step)} از {toFaDigits(TOTAL_STEPS)}
                            </p>
                        </div>

                        <Card className="overflow-visible rounded-[1.75rem] border-0 bg-white/70 p-5 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.08)] ring-1 ring-gray-100 backdrop-blur-xl sm:p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* مرحله ۱: اندازه‌های بدن */}
                                    {step === 1 && (
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <Ruler className="h-5 w-5 text-blue-600" />
                                                <h2 className="text-lg font-bold text-gray-900">اندازه‌های بدن</h2>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600">وزن (کیلوگرم)</label>
                                                    <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200" placeholder="مثلا ۷۵" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600">قد (سانتی‌متر)</label>
                                                    <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200" placeholder="مثلا ۱۷۵" />
                                                </div>
                                                <div className="col-span-2 space-y-1.5">
                                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                        <Scale className="h-3.5 w-3.5 text-blue-500" />
                                                        دور شکم (سانتی‌متر) — اختیاری
                                                    </label>
                                                    <input type="number" name="waist" value={formData.waist} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200" placeholder="دور ناف را اندازه بگیرید" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* مرحله ۲: اعداد آزمایشگاهی اختیاری */}
                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <Heart className="h-5 w-5 text-rose-500" />
                                                <h2 className="text-lg font-bold text-gray-900">اگر اخیراً آزمایش داده‌اید</h2>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">این بخش اختیاری است اما به دقت تحلیل کمک می‌کند.</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600">فشار خون بالا (سیستولیک)</label>
                                                    <input type="number" name="systolic" value={formData.systolic} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200" placeholder="مثلا ۱۲۰" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600">فشار خون پایین (دیاستولیک)</label>
                                                    <input type="number" name="diastolic" value={formData.diastolic} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-200" placeholder="مثلا ۸۰" />
                                                </div>
                                                <div className="col-span-2 space-y-1.5">
                                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                        <Droplet className="h-3.5 w-3.5 text-blue-500" />
                                                        قند خون ناشتا (عدد آزمایش)
                                                    </label>
                                                    <input type="number" name="fbs" value={formData.fbs} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200" placeholder="مثلا ۹۵" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* مرحله ۳: سوابق پزشکی */}
                                    {step === 3 && (
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <Stethoscope className="h-5 w-5 text-indigo-500" />
                                                <h2 className="text-lg font-bold text-gray-900">سوابق پزشکی شما</h2>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">اگر هر یک از موارد زیر را دارید علامت بزنید.</p>
                                            {renderChecklist(
                                                [
                                                    { value: 'hypertension', label: 'فشار خون بالا' },
                                                    { value: 'diabetes', label: 'دیابت یا قند خون بالا' },
                                                    { value: 'cholesterol', label: 'چربی خون بالا' },
                                                    { value: 'heart', label: 'بیماری قلبی یا سابقه سکته قلبی' },
                                                    { value: 'stroke', label: 'سکته مغزی' },
                                                    { value: 'kidney', label: 'بیماری کلیوی' },
                                                    { value: 'liver', label: 'بیماری کبدی (مثل کبد چرب)' },
                                                    { value: 'thyroid', label: 'مشکلات تیروئید' },
                                                    { value: 'asthma', label: 'آسم یا مشکلات تنفسی' },
                                                    { value: 'cancer', label: 'سابقه سرطان یا تومور' },
                                                    { value: 'other', label: 'سایر بیماری‌های مزمن' },
                                                ],
                                                'medicalConditions',
                                                'border-rose-200 bg-rose-50'
                                            )}

                                            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600"><Pill className="h-5 w-5" /></div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">داروی خاصی مصرف می‌کنید؟</p>
                                                        <p className="text-xs text-gray-500">داروهای فشار، قند، قلب و ...</p>
                                                    </div>
                                                </div>
                                                <input type="checkbox" name="medication" checked={formData.medication} onChange={handleInputChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            </label>
                                        </div>
                                    )}

                                    {/* مرحله ۴: سبک زندگی */}
                                    {step === 4 && (
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <Activity className="h-5 w-5 text-emerald-500" />
                                                <h2 className="text-lg font-bold text-gray-900">سبک زندگی</h2>
                                            </div>

                                            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600"><Cigarette className="h-5 w-5" /></div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">استعمال دخانیات</p>
                                                        <p className="text-xs text-gray-500">سیگار، قلیان، ویپ و...</p>
                                                    </div>
                                                </div>
                                                <input type="checkbox" name="smoking" checked={formData.smoking} onChange={handleInputChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            </label>

                                            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600"><Wine className="h-5 w-5" /></div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">مصرف نوشیدنی‌های الکلی</p>
                                                        <p className="text-xs text-gray-500">حتی به مقدار کم</p>
                                                    </div>
                                                </div>
                                                <input type="checkbox" name="alcohol" checked={formData.alcohol} onChange={handleInputChange} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            </label>

                                            <div className="space-y-1.5">
                                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                    <Dumbbell className="h-3.5 w-3.5 text-emerald-500" />
                                                    میزان فعالیت بدنی در هفته
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: 'none', label: 'ندارم' },
                                                        { value: 'low', label: 'کم (۱-۲ روز)' },
                                                        { value: 'moderate', label: 'متوسط (۳-۴ روز)' },
                                                        { value: 'high', label: 'زیاد (۵ روز به بالا)' },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, physicalActivity: opt.value as any }))}
                                                            className={`rounded-2xl border py-3 text-sm font-bold transition-all ${
                                                                formData.physicalActivity === opt.value
                                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600">وعده فست‌فود در هفته</label>
                                                    <input type="number" name="fastFood" value={formData.fastFood} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-200" placeholder="تعداد" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600">واحد میوه و سبزی در روز</label>
                                                    <input type="number" name="fruitVeg" value={formData.fruitVeg} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200" placeholder="مثلا ۳" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                        <Moon className="h-3.5 w-3.5 text-indigo-500" />
                                                        ساعت خواب شبانه
                                                    </label>
                                                    <input type="number" name="sleepHours" value={formData.sleepHours} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200" placeholder="مثلا ۷" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-semibold text-gray-600">کیفیت خواب</label>
                                                    <select name="sleepQuality" value={formData.sleepQuality} onChange={handleInputChange} className="w-full rounded-2xl border-gray-200 bg-gray-50 p-3.5 text-center font-bold text-gray-900 shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200">
                                                        <option value="">انتخاب کنید</option>
                                                        <option value="good">خوب</option>
                                                        <option value="fair">معمولی</option>
                                                        <option value="poor">بد</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                                    <Brain className="h-3.5 w-3.5 text-violet-500" />
                                                    سطح استرس
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { value: 'low', label: 'کم' },
                                                        { value: 'moderate', label: 'متوسط' },
                                                        { value: 'high', label: 'زیاد' },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, stressLevel: opt.value as any }))}
                                                            className={`rounded-2xl border py-3 text-sm font-bold transition-all ${
                                                                formData.stressLevel === opt.value
                                                                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                                                                    : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* مرحله ۵: علائم هشدار */}
                                    {step === 5 && (
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <AlertTriangle className="h-5 w-5 text-rose-500" />
                                                <h2 className="text-lg font-bold text-gray-900">علائم هشدار (Red Flags)</h2>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">اگر هر یک از این علائم را دارید یا اخیراً تجربه کرده‌اید، علامت بزنید.</p>
                                            {renderChecklist(
                                                [
                                                    { value: 'chestPain', label: 'درد قفسه سینه', desc: 'درد فشارنده یا تیرکشنده به دست چپ' },
                                                    { value: 'shortnessOfBreath', label: 'تنگی نفس', desc: 'در حالت استراحت یا فعالیت کم' },
                                                    { value: 'fatigue', label: 'خستگی مزمن', desc: 'احساس خستگی غیرمعمول و ممتد' },
                                                    { value: 'palpitations', label: 'تپش قلب', desc: 'ضربان نامنظم یا تند قلب' },
                                                    { value: 'dizziness', label: 'سرگیجه یا سبکی سر', desc: 'احساس عدم تعادل یا غش' },
                                                    { value: 'swelling', label: 'ورم پا یا مچ پا', desc: 'جمع شدن مایع در اندام‌ها' },
                                                    { value: 'headaches', label: 'سردردهای مکرر', desc: 'سردردهای شدید یا ناگهانی' },
                                                    { value: 'visionChanges', label: 'تغییرات ناگهانی بینایی', desc: 'تاری دید، دوبینی یا کم‌بینایی' },
                                                    { value: 'numbness', label: 'بی‌حسی یا گزگز اندام‌ها', desc: 'مخصوصاً در یک طرف بدن' },
                                                    { value: 'mentalHealth', label: 'احساس ناراحتی یا اضطراب شدید', desc: 'افسردگی، ناامیدی یا حملات اضطرابی' },
                                                    { value: 'weightChange', label: 'کاهش یا افزایش وزن غیرعادی', desc: 'بدون تغییر در رژیم غذایی یا فعالیت' },
                                                ],
                                                'redFlags',
                                                'border-rose-200 bg-rose-50'
                                            )}
                                        </div>
                                    )}

                                    {/* مرحله ۶: سابقه خانوادگی */}
                                    {step === 6 && (
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                                <Users className="h-5 w-5 text-sky-500" />
                                                <h2 className="text-lg font-bold text-gray-900">سابقه بیماری در خانواده</h2>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">در میان والدین یا خواهر و برادر، کدام بیماری وجود دارد؟</p>
                                            {renderChecklist(
                                                [
                                                    { value: 'heart', label: 'بیماری قلبی' },
                                                    { value: 'diabetes', label: 'دیابت' },
                                                    { value: 'highBP', label: 'فشار خون بالا' },
                                                    { value: 'cancer', label: 'سرطان' },
                                                ],
                                                'familyHistory',
                                                'border-sky-200 bg-sky-50'
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* دکمه‌های ناوبری */}
                            <div className="mt-8 flex gap-3">
                                {step > 1 && (
                                    <button onClick={prevStep} className="flex flex-1 items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white py-3.5 font-bold text-gray-700 transition-colors hover:bg-gray-50 active:scale-[0.98]">
                                        <ChevronRight className="h-4.5 w-4.5" /> قبلی
                                    </button>
                                )}

                                {step < TOTAL_STEPS ? (
                                    <button onClick={nextStep} className="flex flex-[2] items-center justify-center gap-1 rounded-2xl bg-gradient-to-l from-blue-700 to-blue-500 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/40 active:scale-[0.98]">
                                        مرحله بعد <ChevronLeft className="h-4.5 w-4.5" />
                                    </button>
                                ) : (
                                    <button onClick={calculateScore} className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-indigo-600 to-blue-500 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/40 active:scale-[0.98]">
                                        <Activity className="h-5 w-5" /> مشاهده نتیجه
                                    </button>
                                )}
                            </div>
                        </Card>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className={`relative overflow-hidden rounded-[2rem] p-6 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ${getScoreInfo(score).bg}`}>
                            <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur-md">
                                    <span className="text-4xl font-black text-white">{toFaDigits(score)}٪</span>
                                </div>
                                <h2 className="text-xl font-extrabold text-white">امتیاز سلامت شما</h2>
                                <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                                    {score >= 80 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                    {getScoreInfo(score).label}
                                </p>
                            </div>
                        </div>

                        {warnings.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <Stethoscope className="h-5 w-5 text-blue-600" /> تحلیل سیستم
                                </h3>
                                {warnings.map((warning, idx) => (
                                    <Card key={idx} className="flex gap-3 overflow-hidden rounded-2xl border-l-4 border-l-rose-500 p-4 shadow-sm">
                                        <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
                                        <p className="text-sm font-medium leading-relaxed text-gray-700">{warning}</p>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {warnings.length === 0 && (
                            <Card className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                <p className="font-semibold text-emerald-800">هیچ فاکتور خطر جدی یافت نشد. به همین سبک زندگی سالم ادامه دهید!</p>
                            </Card>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button onClick={() => navigate('/')} className="flex flex-1 items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white py-3.5 font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.98]">
                                بازگشت به خانه
                            </button>
                            <button onClick={resetAssessment} className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 py-3.5 font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 active:scale-[0.98]">
                                ارزیابی مجدد
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}