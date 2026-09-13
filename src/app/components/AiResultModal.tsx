import React, { useState, useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { Sparkles, Activity, Users, X, ArrowLeft, Target } from 'lucide-react';

const ACTIVITY_LABELS: Record<number, string> = {
    1.2: 'کم تحرک',
    1.375: 'سبک',
    1.55: 'متوسط',
    1.725: 'زیاد',
    1.9: 'بسیار زیاد'
};

export default function AiResultModal() {
    const profile = useUserStore((state) => state.profile);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenModal = sessionStorage.getItem('hasSeenAiModal');
        if (profile && profile.isAiGenerated && !hasSeenModal) {
            setIsOpen(true);
        }
    }, [profile]);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('hasSeenAiModal', 'true');
    };

    if (!isOpen || !profile) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300 font-[YekanBakhFaNum] dir-rtl">

            {/* باکس اصلی مدال */}
            <div className="bg-white w-full max-w-[400px] rounded-[36px] p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

                {/* هاله‌های رنگی آرام‌بخش (مشابه کارت شما) */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-[50px] opacity-40 pointer-events-none" />
                <div className="absolute -bottom-10 left-0 w-40 h-40 bg-teal-200 rounded-full mix-blend-multiply filter blur-[50px] opacity-30 pointer-events-none" />

                {/* دکمه بستن */}
                <button
                    onClick={handleClose}
                    className="absolute top-5 right-5 z-20 p-2 bg-white/60 backdrop-blur-sm hover:bg-stone-100 rounded-full text-stone-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative z-10 mt-4">

                    {/* هدر مدال */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-inner relative">
                            <Sparkles className="w-8 h-8" strokeWidth={2} />
                            <div className="absolute top-0 right-0 w-3 h-3 bg-teal-400 rounded-full animate-pulse border-2 border-white" />
                        </div>
                        <h3 className="text-2xl font-black text-stone-800 tracking-tight">برنامه شما آماده شد!</h3>
                        <p className="text-xs text-stone-500 font-bold mt-2 leading-relaxed px-4">
                            هوش مصنوعی با تحلیل داده‌های شما و کاربران مشابه، بهترین مسیر را پیشنهاد داده است.
                        </p>
                    </div>

                    {/* مقایسه کالری پایه و هوش مصنوعی */}
                    <div className="flex justify-between items-center bg-stone-50/80 rounded-[24px] p-4 mb-5 border border-stone-100/80">
                        <div className="text-center w-full">
                            <div className="text-[10px] text-stone-500 font-bold mb-1">کالری پایه (فرمول)</div>
                            <div className="text-lg font-black text-stone-400">
                                {profile.dailyCalories} <span className="text-[10px] font-medium">kcal</span>
                            </div>
                        </div>
                        <div className="h-10 w-[1px] bg-stone-200 mx-2"></div>
                        <div className="text-center w-full">
                            <div className="text-[10px] text-emerald-600 flex items-center justify-center gap-1 font-bold mb-1">
                                <Sparkles className="w-3 h-3" strokeWidth={2}/> کالری هدف AI
                            </div>
                            <div className="text-2xl font-black text-emerald-600">
                                {profile.recommended_calorie}
                                <span className="text-[10px] font-medium text-emerald-600/70 ml-1">kcal</span>
                            </div>
                        </div>
                    </div>

                    {/* نمایش شبکه‌ای کاربران مشابه */}
                    {profile.aiSimilarUsers && profile.aiSimilarUsers.length > 0 && (
                        <div className="mb-6">
                            <div className="text-[11px] font-bold text-stone-600 mb-3 flex items-center gap-1.5 justify-center">
                                <Target className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                                مسیر موفقیت {profile.aiSimilarUsers.length} کاربر کاملاً مشابه شما:
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {profile.aiSimilarUsers.slice(0, 3).map((u: any, i: number) => (
                                    <div key={i} className="bg-emerald-50/50 rounded-[20px] p-3 border border-emerald-100/60 text-center flex flex-col justify-center shadow-sm">
                                        <div className="text-[10px] text-stone-400 mb-1.5 font-bold">کاربر #{u.user_id}</div>
                                        <div className="text-[11px] font-extrabold text-stone-700">{u.matched_features.weight_kg}kg</div>
                                        <div className="text-[11px] font-extrabold text-stone-700">{u.matched_features.body_fat_percent}% چربی</div>
                                        <div className="text-[9px] text-stone-500 mt-1 truncate">
                                            {ACTIVITY_LABELS[u.matched_features.activity_level] || u.matched_features.activity_level}
                                        </div>
                                        <div className="text-[12px] font-black text-emerald-700 mt-2 bg-emerald-100/50 py-1 rounded-lg">
                                            {u.successful_calorie} <span className="text-[8px] font-medium">kcal</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* دکمه شروع */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-stone-800 hover:bg-stone-900 text-white rounded-[20px] py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-xl shadow-stone-900/20 active:scale-[0.98]"
                    >
                        بزن بریم!
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                </div>
            </div>
        </div>
    );
}
