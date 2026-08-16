import React, { useState } from 'react';
import { Dumbbell, Play, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { WORKOUTS } from '../constants/periodTracker';

export default function WorkoutSection() {
    const [activeWorkout, setActiveWorkout] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const startWorkout = (workout: any) => {
        setActiveWorkout(workout);
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (activeWorkout && currentStep < activeWorkout.steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <section className="space-y-3 pb-4">
            <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100">
                    <Dumbbell className="h-3.5 w-3.5 text-pink-500" />
                </div>
                <h2 className="text-base font-bold text-gray-800">تمرین‌های مناسب پریود</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {WORKOUTS.map((workout) => (
                    <Card
                        key={workout.id}
                        className="cursor-pointer rounded-2xl border-0 bg-white p-4 shadow-sm ring-1 ring-pink-50 transition-all hover:shadow-md"
                        onClick={() => startWorkout(workout)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{workout.emoji}</span>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900">{workout.title}</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    {workout.duration} • شدت {workout.intensity}
                                </p>
                            </div>
                            <Play className="h-4 w-4 text-pink-500" />
                        </div>
                    </Card>
                ))}
            </div>

            {activeWorkout && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
                    <div className="w-full max-w-sm rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">{activeWorkout.title}</h3>
                            <button type="button" onClick={() => setActiveWorkout(null)} className="rounded-full bg-gray-50 p-2 text-gray-400">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-l from-pink-500 to-rose-500 transition-all duration-500"
                                style={{ width: `${((currentStep + 1) / activeWorkout.steps.length) * 100}%` }}
                            />
                        </div>

                        <div className="rounded-2xl bg-[#FFF9FA] p-6 text-center ring-1 ring-pink-100">
                            <span className="text-4xl">{activeWorkout.emoji}</span>
                            <h4 className="mt-3 text-lg font-bold text-gray-900">{activeWorkout.steps[currentStep].title}</h4>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">{activeWorkout.steps[currentStep].description}</p>
                            <p className="mt-3 text-xs text-gray-400">
                                مدت: {activeWorkout.steps[currentStep].duration} ثانیه
                            </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3">
                            <Button
                                variant="outline"
                                className="h-11 flex-1 rounded-xl border-pink-200 text-pink-600 hover:bg-pink-50"
                                onClick={prevStep}
                                disabled={currentStep === 0}
                            >
                                <ChevronRight className="ml-1 h-4 w-4" />
                                قبلی
                            </Button>
                            {currentStep < activeWorkout.steps.length - 1 ? (
                                <Button
                                    className="h-11 flex-1 rounded-xl bg-gradient-to-l from-pink-500 to-rose-500 text-white shadow-md"
                                    onClick={nextStep}
                                >
                                    بعدی
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    className="h-11 flex-1 rounded-xl bg-gradient-to-l from-green-500 to-emerald-500 text-white shadow-md"
                                    onClick={() => setActiveWorkout(null)}
                                >
                                    پایان تمرین
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}