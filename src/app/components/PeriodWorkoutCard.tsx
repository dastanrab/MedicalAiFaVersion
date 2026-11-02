import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { Button } from './ui/button';
import { WorkoutModal } from './WorkoutModal';

export const PeriodWorkoutCard: React.FC = () => {
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);

    return (
        <>
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
                <Button
                    type="button"
                    onClick={() => setIsWorkoutModalOpen(true)}
                    className="w-full h-11 rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-white text-sm font-bold hover:from-pink-600 hover:to-rose-600"
                >
                    مشاهده تمرین‌ها
                </Button>
            </section>

            <WorkoutModal
                open={isWorkoutModalOpen}
                onClose={() => setIsWorkoutModalOpen(false)}
            />
        </>
    );
};