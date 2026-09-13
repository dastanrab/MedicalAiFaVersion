import React from 'react';
import { Sparkles, Users } from 'lucide-react';
import { useUserStore } from '../store/userStore';

const ACTIVITY_LABELS: Record<number, string> = {
    1.2: 'کم تحرک',
    1.375: 'سبک',
    1.55: 'متوسط',
    1.725: 'زیاد',
    1.9: 'بسیار زیاد'
};

export default function AiOverviewCard() {
    // گرفتن اطلاعات ذخیره شده از استور (که در مرحله ثبت نام پر شده است)
    const profile = useUserStore((state) => state.profile);

    if (!profile) return null; // اگر پروفایلی نبود چیزی رندر نشود

    return (
        <div className="w-full dir-rtl font-[YekanBakhFaNum]">

            {/* ردیف اول: خلاصه وضعیت بدنی */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-4 rounded-[24px] flex flex-col items-center border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">شاخص توده بدنی</span>
                    <span className="text-2xl font-black text-stone-700">{profile.bmi}</span>
                </div>
                <div className="bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-4 rounded-[24px] flex flex-col items-center border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">درصد چربی</span>
                    <span className="text-2xl font-black text-stone-700">{profile.bodyFat}%</span>
                </div>
            </div>

            {/* کارت پیشنهاد هوش مصنوعی (تم سبز ملایم و پاستیلی) */}
            <div className="bg-emerald-50/60 rounded-[28px] p-6 relative overflow-hidden border border-emerald-100 shadow-sm">
                {/* هاله‌های رنگی آرام‌بخش برای حس خمیری */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-[40px] opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-[40px] opacity-40"></div>

                <div className="flex justify-between items-center border-b border-emerald-100 pb-5 mb-5 relative z-10">
                    <div>
                        <div className="text-[10px] text-stone-500 font-bold mb-1">کالری پایه (Mifflin)</div>
                        <div className="text-lg font-black text-stone-700">
                            {profile.dailyCalories} <span className="text-[10px] font-medium text-stone-400">kcal</span>
                        </div>
                    </div>

                    <div className="h-10 w-[1px] bg-emerald-200/60"></div>

                    <div className="text-left">
                        <div className="text-[10px] text-emerald-600 flex items-center gap-1 justify-end font-bold mb-1">
                            <Sparkles className="w-3 h-3" strokeWidth={2}/> هوش مصنوعی
                        </div>
                        <div className="text-2xl font-black text-emerald-900">
                            {profile.isAiGenerated ? profile.recommended_calorie : '---'}
                            <span className="text-[10px] font-medium text-emerald-600/70 ml-1">kcal</span>
                        </div>
                    </div>
                </div>

                {/* کاربران مشابه (در صورت وجود) */}
                {profile.isAiGenerated && profile.aiSimilarUsers && profile.aiSimilarUsers.length > 0 && (
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold text-stone-500 mb-3 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} /> ۳ کاربر مشابه شما که به هدف رسیده‌اند:
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {profile.aiSimilarUsers.slice(0, 3).map((u: any, i: number) => (
                                <div key={i} className="bg-white/90 rounded-[20px] p-3 border border-emerald-50 text-center flex flex-col justify-center shadow-sm">
                                    <div className="text-[9px] text-stone-400 mb-1.5 font-bold">کاربر #{u.user_id}</div>
                                    <div className="text-[11px] font-extrabold text-stone-700">{u.matched_features.weight_kg}kg</div>
                                    <div className="text-[11px] font-extrabold text-stone-700">{u.matched_features.body_fat_percent}% چربی</div>
                                    <div className="text-[9px] text-stone-500 mt-1">
                                        فعالیت: {ACTIVITY_LABELS[u.matched_features.activity_level] || u.matched_features.activity_level}
                                    </div>
                                    <div className="text-[11px] font-black text-emerald-600 mt-2 bg-emerald-50/80 py-1 rounded-lg">
                                        {u.successful_calorie} <span className="text-[8px] font-medium text-emerald-500">kcal</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
