import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Calendar as CalendarIcon,
    Droplets,
    Heart,
    Plus,
    Settings,
    User,
    ChevronLeft,
    Info,
    X,
    MessageCircle
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

// دیتا برای ایموجی‌ها
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

interface HealthInsight {
    id: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

export default function PeriodTracker() {
    const navigate = useNavigate();
    const [daysUntil, setDaysUntil] = useState<number>(5);

    // استیت‌های مدال
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
    const [isSymptomsModalOpen, setIsSymptomsModalOpen] = useState(false);

    // استیت‌های فرم ثبت علائم
    const [symptomText, setSymptomText] = useState('');
    const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
    const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

    const insights: HealthInsight[] = [
        {
            id: 1,
            title: "وضعیت پوست",
            description: "امروز احتمال بروز جوش کمتر است.",
            icon: <Heart className="w-5 h-5" />,
            color: "bg-rose-100 text-rose-500"
        },
        {
            id: 2,
            title: "سطح انرژی",
            description: "زمان خوبی برای ورزش‌های سبک مثل یوگا است.",
            icon: <Droplets className="w-5 h-5" />,
            color: "bg-blue-100 text-blue-500"
        },
    ];

    // تابع مدیریت انتخاب چندگانه ایموجی‌ها
    const toggleSelection = (id: string, type: 'mood' | 'food') => {
        if (type === 'mood') {
            setSelectedMoods(prev =>
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        } else {
            setSelectedFoods(prev =>
                prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
            );
        }
    };

    return (
        <div className="h-full bg-[#FFF9FA] overflow-y-auto pb-24" dir="rtl">

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 flex justify-center">
                <div className="w-full max-w-lg h-16 bg-white/80 backdrop-blur-md border-b border-pink-50 flex items-center justify-between px-6 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-pink-500" />
                        </div>
                        <span className="font-bold text-gray-800">تقویم من</span>
                    </div>
                    <Settings className="w-6 h-6 text-gray-400 cursor-pointer" />
                </div>
            </div>

            <main className="px-6 pt-24 max-w-md mx-auto">

                {/* Cycle Section */}
                <section className="flex justify-center mb-10">
                    <div className="relative group">
                        <div className="w-60 h-60 rounded-full border-4 border-white shadow-sm flex flex-col items-center justify-center bg-white relative z-10">
                            <span className="text-sm text-gray-400 font-medium">پریود در</span>
                            <div className="text-7xl font-light text-pink-500 my-1">{daysUntil}</div>
                            <span className="text-sm text-gray-400 font-medium">روز دیگر</span>
                        </div>
                        <div className="absolute inset-[-8px] rounded-full bg-gradient-to-tr from-pink-100 to-rose-200 -z-0 opacity-50"></div>
                    </div>
                </section>

                {/* Quick Actions */}
                <div className="flex gap-3 mb-10">
                    <Button
                        onClick={() => setIsSymptomsModalOpen(true)}
                        className="flex-1 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-md shadow-pink-100 transition-all active:scale-95 flex items-center justify-center"
                    >
                        <Plus className="ml-2 w-5 h-5" />
                        ثبت علائم
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 h-14 border-pink-200 text-pink-600 bg-white rounded-2xl hover:bg-pink-50 flex items-center justify-center"
                    >
                        شروع پریود
                    </Button>
                </div>

                {/* Horizontal Calendar */}
                <section className="mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">امروز</h2>
                        <button
                            onClick={() => setIsCalendarModalOpen(true)}
                            className="text-sm text-pink-500 font-medium hover:text-pink-600 cursor-pointer"
                        >
                            مشاهده تقویم
                        </button>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                        {[14, 15, 16, 17, 18, 19, 20].map((day, index) => (
                            <div
                                key={day}
                                onClick={() => setIsCalendarModalOpen(true)}
                                className={`min-w-[60px] flex flex-col items-center py-3 px-2 rounded-2xl transition-all cursor-pointer snap-center ${
    index === 3
        ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 scale-105'
        : 'bg-white text-gray-400 border border-gray-50 hover:bg-pink-50'
}`}
                            >
                                <span className="text-[10px] uppercase mb-1">{index === 3 ? 'امروز' : 'ش'}</span>
                                <span className="text-base font-bold">{day}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Insights Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-pink-400" />
                        <h2 className="text-lg font-bold text-gray-800">توصیه‌های هوشمند</h2>
                    </div>

                    {insights.map((item) => (
                        <Card
                            key={item.id}
                            className="p-4 border-0 shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer rounded-2xl"
                        >
                            <div className="flex items-center">
                                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center ml-4`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                                </div>
                                <ChevronLeft className="w-5 h-5 text-gray-300" />
                            </div>
                        </Card>
                    ))}
                </section>
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <nav className="w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-gray-100 px-8 py-4 flex justify-between items-center pointer-events-auto rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                    <NavItem icon={<Heart className="w-6 h-6" />} label="امروز" active />
                    <NavItem icon={<CalendarIcon className="w-6 h-6" />} label="تقویم" onClick={() => setIsCalendarModalOpen(true)} />
                    <NavItem icon={<Droplets className="w-6 h-6" />} label="علائم" onClick={() => setIsSymptomsModalOpen(true)} />
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                        <div className="w-6 h-6 rounded-full bg-gray-200 group-hover:bg-pink-200 transition-colors"></div>
                        <span className="text-[10px] text-gray-400">بیشتر</span>
                    </div>
                </nav>
            </div>

            {/* Calendar Modal */}
            {isCalendarModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 rtl">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setIsCalendarModalOpen(false)} className="absolute top-5 left-5 text-gray-400 bg-gray-50 p-2 rounded-full"><X className="w-5 h-5" /></button>
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-6 font-sans">تقویم ماهانه</h3>
                        <div className="grid grid-cols-7 gap-2 text-center mb-4">
                            {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map(day => (
                                <div key={day} className="text-xs text-gray-400 font-bold">{day}</div>
                            ))}
                            <div className="p-2"></div><div className="p-2"></div>
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={i} className={`p-2 text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto ${i+1 === 17 ? 'bg-pink-500 text-white' : 'text-gray-700'}`}>{i + 1}</div>
                            ))}
                        </div>
                        <Button className="w-full bg-pink-100 text-pink-600 rounded-xl h-12" onClick={() => setIsCalendarModalOpen(false)}>بستن</Button>
                    </div>
                </div>
            )}

            {/* SYMPTOMS MODAL - بخش جدید طبق درخواست شما */}
            {isSymptomsModalOpen && (
                <div className="fixed inset-0 z-50 pb-20 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 rtl">
                    <div className="bg-white w-full max-w-md  p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] overflow-y-auto">

                        <button
                            onClick={() => setIsSymptomsModalOpen(false)}
                            className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-xl font-bold text-gray-800 mb-8 mt-2 text-right">ثبت علائم روزانه</h3>

                        <div className="space-y-8">
                            {/* نوشتاری */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-pink-500">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-sm font-bold">یادداشت من</span>
                                </div>
                                <textarea
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                    placeholder="علائم یا اتفاقات امروز را اینجا بنویس..."
                                    rows={3}
                                    value={symptomText}
                                    onChange={(e) => setSymptomText(e.target.value)}
                                />
                            </div>

                            {/* حالت روحی - چند انتخابی */}
                            <div className="space-y-4">
                                <span className="text-sm font-bold text-gray-700 block">حالت روحی چطوره؟</span>
                                <div className="flex flex-wrap gap-3">
                                    {MOODS.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleSelection(item.id, 'mood')}
                                            className={`flex flex-col items-center justify-center gap-1 w-[68px] h-[75px] rounded-2xl transition-all border-2
${selectedMoods.includes(item.id)
    ? 'bg-pink-50 border-pink-400 scale-105 shadow-sm'
    : 'bg-white border-transparent hover:bg-gray-50'}`}
                                        >
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className="text-[10px] text-gray-500">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* طبع غذایی - چند انتخابی */}
                            <div className="space-y-4">
                                <span className="text-sm font-bold text-gray-700 block">هوس چه طعمی کردی؟</span>
                                <div className="flex flex-wrap gap-3">
                                    {FOODS.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleSelection(item.id, 'food')}
                                            className={`flex flex-col items-center justify-center gap-1 w-[68px] h-[75px] rounded-2xl transition-all border-2
${selectedFoods.includes(item.id)
    ? 'bg-blue-50 border-blue-300 scale-105 shadow-sm'
    : 'bg-white border-transparent hover:bg-gray-50'}`}
                                        >
                                            <span className="text-2xl">{item.emoji}</span>
                                            <span className="text-[10px] text-gray-500">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* دکمه ثبت (فعلاً فقط مدال را می‌بندد) */}
                        <Button
                            className="w-full bg-pink-500 hover:bg-pink-600 text-white h-14 rounded-2xl mt-10 text-lg font-bold shadow-lg shadow-pink-100"
                            onClick={() => setIsSymptomsModalOpen(false)}
                        >
                            ثبت و ذخیره
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div
            onClick={onClick}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${active ? 'text-pink-500' : 'text-gray-300 hover:text-pink-400'}`}
        >
            {icon}
            <span className="text-[10px] font-bold">{label}</span>
        </div>
    );
}

