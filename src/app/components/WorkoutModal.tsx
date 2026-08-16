// src/components/WorkoutModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

const WORKOUTS = [
    {
        id: 'yoga_light',
        title: 'یوگا و کشش سبک',
        description: 'تمرین ملایم برای کاهش گرفتگی و آرامش بدن',
        icon: '🧘‍♀️',
        duration: '۱۵ دقیقه',
        steps: [
            { title: 'تنفس عمیق', description: 'چشمان خود را ببندید و ۵ نفس عمیق بکشید.', duration: '۱ دقیقه' },
            { title: 'کشش گردن', description: 'سر را به آرامی به چپ و راست خم کنید.', duration: '۲ دقیقه' },
            { title: 'حرکت گربه-گاو', description: 'روی چهار دست و پا قرار بگیرید و کمر را خم و راست کنید.', duration: '۳ دقیقه' },
            { title: 'کشش پروانه', description: 'کف پاها را به هم بچسبانید و زانوها را به سمت زمین فشار دهید.', duration: '۳ دقیقه' },
            { title: 'مدیتیشن پایانی', description: 'دراز بکشید و بدن را رها کنید.', duration: '۴ دقیقه' },
        ],
    },
    {
        id: 'strength_light',
        title: 'قدرتی ملایم',
        description: 'تقویت عضلات بدون فشار زیاد',
        icon: '💪',
        duration: '۲۰ دقیقه',
        steps: [
            { title: 'گرم کردن', description: 'درجا قدم بزنید و بازوها را بچرخانید.', duration: '۳ دقیقه' },
            { title: 'اسکات با وزن بدن', description: '۱۰ اسکات آرام انجام دهید.', duration: '۳ دقیقه' },
            { title: 'پل باسن', description: 'به پشت بخوابید و باسن را بالا ببرید، ۱۰ تکرار.', duration: '۴ دقیقه' },
            { title: 'پلانک کوتاه', description: '۲۰ ثانیه پلانک روی زانو.', duration: '۳ دقیقه' },
            { title: 'کشش پایانی', description: 'عضلات اصلی را بکشید.', duration: '۳ دقیقه' },
        ],
    },
    {
        id: 'walking',
        title: 'پیاده‌روی و حرکات سبک',
        description: 'فعالیت هوازی ملایم برای بهبود خلق و خو',
        icon: '🚶‍♀️',
        duration: '۲۵ دقیقه',
        steps: [
            { title: 'پیاده‌روی آرام', description: '۵ دقیقه با سرعت کم راه بروید.', duration: '۵ دقیقه' },
            { title: 'پیاده‌روی سریع‌تر', description: '۱۰ دقیقه با سرعت متوسط.', duration: '۱۰ دقیقه' },
            { title: 'حرکات کششی در حالت ایستاده', description: 'کشش ساق پا و ران.', duration: '۵ دقیقه' },
            { title: 'پیاده‌روی آرام و سرد کردن', description: '۵ دقیقه پیاده‌روی سبک.', duration: '۵ دقیقه' },
        ],
    },
];

interface WorkoutModalProps {
    open: boolean;
    onClose: () => void;
}

export function WorkoutModal({ open, onClose }: WorkoutModalProps) {
    const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    useEffect(() => {
        if (open) {
            setSelectedWorkoutId(null);
            setCurrentStepIndex(0);
        }
    }, [open]);

    const selectedWorkout = WORKOUTS.find(w => w.id === selectedWorkoutId);

    const handleNext = () => {
        if (selectedWorkout && currentStepIndex < selectedWorkout.steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            setSelectedWorkoutId(null);
            setCurrentStepIndex(0);
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
    };

    const handleReset = () => setCurrentStepIndex(0);

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center">
                    <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                        {/* هدر مودال */}
                        <div className="relative flex items-center justify-between bg-gradient-to-l from-pink-500 to-rose-500 px-6 py-4">
                            <h3 className="text-lg font-bold text-white">تمرین‌های مناسب پریود</h3>
                            <button
                                onClick={onClose}
                                className="rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                                aria-label="بستن"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* بدنه مودال */}
                        <div className="p-6">
                            {!selectedWorkout ? (
                                <div className="space-y-4">

                                    {/* لیست تمرین‌ها */}
                                    {WORKOUTS.map(workout => (
                                        <div
                                            key={workout.id}
                                            className="group flex items-center gap-3 rounded-2xl bg-pink-50/50 p-4 ring-1 ring-pink-100 transition-all hover:bg-pink-50 hover:ring-pink-200 hover:shadow-sm"
                                        >
                                            <span className="text-3xl">{workout.icon}</span>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800">{workout.title}</h4>
                                                <p className="mt-1 text-xs text-gray-500">{workout.description}</p>
                                                <p className="mt-1 text-[10px] font-medium text-pink-500">مدت: {workout.duration}</p>
                                            </div>
                                            <Button
                                                onClick={() => setSelectedWorkoutId(workout.id)}
                                                className="rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                                            >
                                                شروع
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    {/* نمایش مراحل تمرین */}
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-700">{selectedWorkout.title}</span>
                                        <span className="text-xs text-gray-400">
                      {currentStepIndex + 1} از {selectedWorkout.steps.length}
                    </span>
                                    </div>

                                    {/* تصویر yoga.gif بالای نوار پیشرفت */}
                                    <div className="mb-4 overflow-hidden rounded-2xl shadow-md ring-1 ring-pink-100">
                                        <img
                                            src="/yoga.gif"
                                            alt="تمرین یوگا"
                                            className="w-full h-32 object-cover object-center"
                                        />
                                    </div>

                                    <div className="mb-6 h-2 w-full rounded-full bg-pink-100">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-l from-pink-500 to-rose-500 transition-all duration-300"
                                            style={{ width: `${((currentStepIndex + 1) / selectedWorkout.steps.length) * 100}%` }}
                                        />
                                    </div>

                                    <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-5 ring-1 ring-pink-100">
                                        <h4 className="text-base font-bold text-gray-800">
                                            {selectedWorkout.steps[currentStepIndex].title}
                                        </h4>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                            {selectedWorkout.steps[currentStepIndex].description}
                                        </p>
                                        <p className="mt-3 text-xs font-medium text-pink-500">
                                            زمان: {selectedWorkout.steps[currentStepIndex].duration}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <Button
                                            onClick={handlePrev}
                                            disabled={currentStepIndex === 0}
                                            variant="outline"
                                            className="h-11 rounded-xl border-pink-200 bg-white px-4 text-pink-600 disabled:opacity-50"
                                        >
                                            قبلی
                                        </Button>
                                        <Button
                                            onClick={handleNext}
                                            className="h-11 rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 px-6 text-white shadow-sm hover:from-pink-600 hover:to-rose-600"
                                        >
                                            {currentStepIndex === selectedWorkout.steps.length - 1 ? 'پایان' : 'بعدی'}
                                        </Button>
                                    </div>

                                    <button
                                        onClick={handleReset}
                                        className="mt-3 w-full text-center text-xs text-gray-400 transition-colors hover:text-pink-500"
                                    >
                                        شروع مجدد از ابتدا
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}