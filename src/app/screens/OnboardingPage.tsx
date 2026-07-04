import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, Dumbbell, User, Ruler, Target, Activity, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useUserStore, calcMetrics, Goal, ActivityLevel } from '../store/userStore';

const STEPS = ['اطلاعات شخصی', 'اندازه‌گیری', 'هدف', 'سطح فعالیت'];

const GOALS: { value: Goal; label: string; desc: string; emoji: string }[] = [
    { value: 'lose',     label: 'کاهش وزن',   desc: 'کالری کمتر از نیاز روزانه', emoji: '🔥' },
    { value: 'maintain', label: 'حفظ وزن',    desc: 'تعادل کالری',emoji: '⚖️' },
    { value: 'gain',     label: 'افزایش وزن', desc: 'کالری بیشتر از نیاز روزانه', emoji: '💪' },
];

const ACTIVITIES: { value: ActivityLevel; label: string; desc: string }[] = [
    { value: 'sedentary',  label: 'کم‌تحرک',       desc: 'بیشتر نشسته، بدون ورزش' },
    { value: 'light',      label: 'کم فعال',        desc: '۱-۲ روز ورزش در هفته' },
    { value: 'moderate',   label: 'نسبتاً فعال',    desc: '۳-۵ روز ورزش در هفته' },
    { value: 'active',     label: 'فعال',           desc: '۶-۷ روز ورزش در هفته' },
    { value: 'very_active',label: 'خیلی فعال',      desc: 'ورزش سنگین روزانه' },
];

type FormData = {
    name: string;
    age: string;
    gender: 'male' | 'female';
    height: string;
    weight: string;
    targetWeight: string;
    goal: Goal;
    activityLevel: ActivityLevel;
    // فیلدهای اختیاری
    neck: string;
    waist: string;
    arm: string;
    thigh: string;
    chest: string;
    hip:string;
};

const init: FormData = {
    name: '', age: '', gender: 'male',
    height: '', weight: '', targetWeight: '',
    goal: 'lose', activityLevel: 'moderate',
    neck: '', waist: '', arm: '', thigh: '', chest: '',hip: ''
};

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<FormData>(init);
    const [showAdvancedMsr, setShowAdvancedMsr] = useState(false); // کنترل نمایش فیلدهای اختیاری
    const setProfile = useUserStore(s => s.setProfile);
    const navigate = useNavigate();

    const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

    const canNext = () => {
        if (step === 0) return form.name.trim() && form.age && form.gender;
        if (step === 1) return form.height && form.weight && form.targetWeight;
        return true;
    };

    const finish = () => {
        const profile = calcMetrics({
            name: form.name,
            age: +form.age,
            gender: form.gender,
            height: +form.height,
            weight: +form.weight,
            targetWeight: +form.targetWeight,
            goal: form.goal,
            activityLevel: form.activityLevel,
            // ارسال اطلاعات اضافه به صورت عددی (اگر وارد شده باشند)
            neck: form.neck ? +form.neck : undefined,
            waist: form.waist ? +form.waist : undefined,
            hip: form.hip ? +form.hip : undefined,
            arm: form.arm ? +form.arm : undefined,
            thigh: form.thigh ? +form.thigh : undefined,
            chest: form.chest ? +form.chest : undefined,
        });
        setProfile(profile);
        navigate('/fit', { replace: true });
    };


    return (
        <div className="min-h-screen bg-[#F8F9FA] font-[YekanBakhFaNum] flex flex-col pb-24" dir="rtl">
            {/* Header */}
            <header className="bg-white sticky top-0 z-50 px-5 py-4 flex items-center gap-3 shadow-sm max-w-md mx-auto w-full">
                <div className="bg-[#FF6B35] p-2 rounded-xl">
                    <Dumbbell className="text-white w-5 h-5" />
                </div>
                <div>
                    <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">SmartGym <span className="text-[#FF6B35]">AI</span></h1>
                    <p className="text-[10px] text-gray-500 font-medium">تنظیم پروفایل</p>
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full flex flex-col">
                {/* Progress */}
                <div className="px-5 pt-6 mb-2">
                    <div className="flex items-center justify-between">
                        {STEPS.map((s, i) => (
                            <React.Fragment key={i}>
                                <div className="flex flex-col items-center gap-1 z-10">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm
                    ${i < step ? 'bg-[#FF6B35] text-white' : i === step ? 'bg-[#FF6B35] text-white ring-4 ring-orange-100' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                                        {i < step ? <Check className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-[10px] font-bold mt-1 ${i === step ? 'text-[#FF6B35]' : 'text-gray-400'}`}>{s}</span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-1 mx-2 -mt-5 rounded-full transition-colors ${i < step ? 'bg-[#FF6B35]' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-5 pt-6 pb-6">

                    {/* Step 0: اطلاعات شخصی */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <StepTitle icon={<User className="w-5 h-5 text-[#FF6B35]" />} title="اطلاعات شخصی" />
                            <Field label="نام شما">
                                <input className={inputCls} placeholder="مثلاً: علی" value={form.name} onChange={e => set('name', e.target.value)} />
                            </Field>
                            <Field label="سن">
                                <input className={inputCls} type="number" placeholder="مثلاً: ۲۵" value={form.age} onChange={e => set('age', e.target.value)} />
                            </Field>
                            <Field label="جنسیت">
                                <div className="grid grid-cols-2 gap-3">
                                    {(['male', 'female'] as const).map(g => (
                                        <button key={g} onClick={() => set('gender', g)}
                                                className={`py-3.5 rounded-2xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-2
                          ${form.gender === g ? 'border-[#FF6B35] bg-orange-50 text-[#FF6B35] shadow-sm' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                                            <span className="text-xl">{g === 'male' ? '👨' : '👩'}</span>
                                            {g === 'male' ? 'مرد' : 'زن'}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </div>
                    )}

                    {/* Step 1: اندازه‌گیری */}
                    {/* Step 1: اندازه‌گیری */}
                    {step === 1 && (() => {
                        const w = +form.weight;
                        const h = +form.height;
                        const waist = +form.waist;
                        const neck = +form.neck;
                        const hip = +form.hip;

                        // محاسبات پایه
                        const bmi = (w > 0 && h > 0) ? w / Math.pow(h / 100, 2) : 0;

                        // درصد چربی (US Navy Method)
                        let bodyFat = 0;
                        if (waist > 0 && neck > 0 && h > 0) {
                            if (form.gender === 'male') {
                                bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
                            } else if (hip > 0) { // برای زنان به دور باسن هم نیاز است
                                bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h)) - 450;
                            }
                        }

                        // توده بدون چربی (LBM)
                        const lbm = bodyFat > 0 ? w * (1 - bodyFat / 100) : 0;

                        // شاخص عضلانی (FFMI)
                        const ffmi = (lbm > 0 && h > 0) ? lbm / Math.pow(h / 100, 2) : 0;

                        // نسبت کمر به باسن (WHR)
                        const whr = (waist > 0 && hip > 0) ? waist / hip : 0;

                        // سطح بدن (BSA - Mosteller formula)
                        const bsa = (w > 0 && h > 0) ? Math.sqrt((h * w) / 3600) : 0;

                        // وزن ایده‌آل (Devine formula)
                        let idealWeight = 0;
                        if (h > 0) {
                            const heightInInches = h / 2.54;
                            idealWeight = form.gender === 'male'
                                ? 50 + 2.3 * (heightInInches - 60)
                                : 45.5 + 2.3 * (heightInInches - 60);
                        }

                        return (
                            <div className="space-y-5">
                                <StepTitle icon={<Ruler className="w-5 h-5 text-[#FF6B35]" />} title="اندازه‌گیری بدن" />

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="قد (سانتی‌متر)">
                                        <input className={inputCls} type="number" placeholder="مثلاً: ۱۷۵" value={form.height} onChange={e => set('height', e.target.value)} />
                                    </Field>
                                    <Field label="وزن فعلی (کیلوگرم)">
                                        <input className={inputCls} type="number" placeholder="مثلاً: ۸۰" value={form.weight} onChange={e => set('weight', e.target.value)} />
                                    </Field>
                                </div>

                                <Field label="وزن هدف (کیلوگرم)">
                                    <input className={inputCls} type="number" placeholder="مثلاً: ۷۰" value={form.targetWeight} onChange={e => set('targetWeight', e.target.value)} />
                                </Field>

                                {/* بخش اندازه‌گیری‌های دقیق (اختیاری) */}
                                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                    <button
                                        onClick={() => setShowAdvancedMsr(!showAdvancedMsr)}
                                        className="w-full px-4 py-3 flex items-center justify-between text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <span>اندازه‌گیری‌های دقیق (اختیاری)</span>
                                        {showAdvancedMsr ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </button>

                                    {showAdvancedMsr && (
                                        <div className="p-4 grid grid-cols-2 gap-4 border-t border-gray-100 bg-white">
                                            <Field label="دور گردن (cm)">
                                                <input className={inputCls} type="number" value={form.neck} onChange={e => set('neck', e.target.value)} />
                                            </Field>
                                            <Field label="دور کمر (cm)">
                                                <input className={inputCls} type="number" value={form.waist} onChange={e => set('waist', e.target.value)} />
                                            </Field>
                                            <Field label="دور باسن (cm)">
                                                <input className={inputCls} type="number" value={form.hip} onChange={e => set('hip', e.target.value)} />
                                            </Field>
                                            <Field label="دور سینه (cm)">
                                                <input className={inputCls} type="number" value={form.chest} onChange={e => set('chest', e.target.value)} />
                                            </Field>
                                            <Field label="دور بازو (cm)">
                                                <input className={inputCls} type="number" value={form.arm} onChange={e => set('arm', e.target.value)} />
                                            </Field>
                                            <Field label="دور ران (cm)">
                                                <input className={inputCls} type="number" value={form.thigh} onChange={e => set('thigh', e.target.value)} />
                                            </Field>
                                        </div>
                                    )}
                                </div>

                                {bmi > 0 && (
                                    <div className="bg-gradient-to-tr from-green-50 to-emerald-50 border border-green-100 rounded-3xl p-5 shadow-sm">
                                        <div className="text-center mb-4">
                                            <p className="text-xs text-green-700/70 font-bold mb-1">شاخص توده بدنی ($BMI$)</p>
                                            <p className="text-4xl font-extrabold text-green-700 drop-shadow-sm">{bmi.toFixed(1)}</p>
                                            <p className="text-sm font-bold text-green-800/80 mt-2 bg-white/50 inline-block px-3 py-1 rounded-full">{bmiLabel(bmi)}</p>
                                        </div>

                                        {/* نمایش نتایج پیشرفته */}
                                        {(waist > 0 && neck > 0 && (form.gender === 'male' || hip > 0)) && (
                                            <div className="mt-4 pt-4 border-t border-green-200/50 grid grid-cols-2 gap-y-3 gap-x-2 text-[11px] text-green-900 font-medium">
                                                <div className="flex justify-between bg-white/40 p-2 rounded-lg">
                                                    <span>درصد چربی:</span>
                                                    <b className="text-green-700 dir-ltr">{bodyFat.toFixed(1)} %</b>
                                                </div>
                                                <div className="flex justify-between bg-white/40 p-2 rounded-lg">
                                                    <span>توده بدون چربی (LBM):</span>
                                                    <b className="text-green-700 dir-ltr">{lbm.toFixed(1)} kg</b>
                                                </div>
                                                <div className="flex justify-between bg-white/40 p-2 rounded-lg">
                                                    <span>شاخص عضلانی (FFMI):</span>
                                                    <b className="text-green-700 dir-ltr">{ffmi.toFixed(1)}</b>
                                                </div>
                                                <div className="flex justify-between bg-white/40 p-2 rounded-lg">
                                                    <span>کمر به باسن (WHR):</span>
                                                    <b className="text-green-700 dir-ltr">{whr > 0 ? whr.toFixed(2) : '-'}</b>
                                                </div>
                                                <div className="flex justify-between bg-white/40 p-2 rounded-lg">
                                                    <span>سطح بدن (BSA):</span>
                                                    <b className="text-green-700 dir-ltr">{bsa.toFixed(2)} m²</b>
                                                </div>
                                                <div className="flex justify-between bg-white/40 p-2 rounded-lg">
                                                    <span>وزن ایده‌آل:</span>
                                                    <b className="text-green-700 dir-ltr">{idealWeight.toFixed(1)} kg</b>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })()}


                    {/* Step 2: هدف */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <StepTitle icon={<Target className="w-5 h-5 text-[#FF6B35]" />} title="هدف شما چیست؟" />
                            {GOALS.map(g => (
                                <button key={g.value} onClick={() => set('goal', g.value)}
                                        className={`w-full p-4 rounded-3xl border-2 flex items-center gap-4 transition-all text-right
                      ${form.goal === g.value ? 'border-[#FF6B35] bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl shrink-0">{g.emoji}</div>
                                    <div>
                                        <p className={`font-extrabold text-base mb-0.5 ${form.goal === g.value ? 'text-[#FF6B35]' : 'text-gray-800'}`}>{g.label}</p>
                                        <p className="text-xs text-gray-500 font-medium">{g.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 3: سطح فعالیت */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <StepTitle icon={<Activity className="w-5 h-5 text-[#FF6B35]" />} title="سطح فعالیت روزانه" />
                            {ACTIVITIES.map(a => (
                                <button key={a.value} onClick={() => set('activityLevel', a.value)}
                                        className={`w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all
                      ${form.activityLevel === a.value ? 'border-[#FF6B35] bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                                    <div className="text-right">
                                        <p className={`font-extrabold text-base mb-0.5 ${form.activityLevel === a.value ? 'text-[#FF6B35]' : 'text-gray-800'}`}>{a.label}</p>
                                        <p className="text-xs text-gray-500 font-medium">{a.desc}</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${form.activityLevel === a.value ? 'border-[#FF6B35] bg-[#FF6B35]' : 'border-gray-300'}`}>
                                        {form.activityLevel === a.value && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="fixed bottom-0 w-full bg-white border-t border-gray-100 py-4 px-4 z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.04)] left-0 right-0">
                <div className="max-w-md mx-auto flex gap-3">
                    {step > 0 && (
                        <button onClick={() => setStep(s => s - 1)}
                                className="flex-[0.4] py-3.5 rounded-2xl bg-gray-50 text-gray-600 font-extrabold flex items-center justify-center gap-2 hover:bg-gray-100 transition active:scale-95">
                            <ChevronRight className="w-5 h-5" /> قبلی
                        </button>
                    )}
                    {step < STEPS.length - 1 ? (
                        <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
                                className="flex-1 py-3.5 rounded-2xl bg-[#FF6B35] text-white font-extrabold flex items-center justify-center gap-2 disabled:opacity-40 transition shadow-lg shadow-orange-200 active:scale-95 disabled:active:scale-100">
                            مرحله بعدی <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button onClick={finish} disabled={!canNext()}
                                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA07A] text-white font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition active:scale-95 disabled:opacity-40 disabled:active:scale-100">
                            <Check className="w-5 h-5" /> شروع برنامه
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}

// helpers
const inputCls = "w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 text-gray-900 font-bold text-sm focus:outline-none focus:border-[#FF6B35] focus:ring-4 focus:ring-orange-50 transition placeholder:text-gray-300 placeholder:font-medium shadow-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-extrabold text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function StepTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm inline-flex">
            <div className="bg-orange-50 p-1.5 rounded-xl">
                {icon}
            </div>
            <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
        </div>
    );
}

function bmiLabel(bmi: number) {
    if (bmi < 18.5) return 'کمبود وزن ⚠️';
    if (bmi < 25)   return 'وزن طبیعی ✅';
    if (bmi < 30)   return 'اضافه وزن 🔸';
    return 'چاقی 🔴';
}
