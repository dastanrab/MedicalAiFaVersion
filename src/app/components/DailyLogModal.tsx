import React, { useState, useEffect } from 'react';
import { X, MessageCircle, GlassWater, Flame, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { MOODS, FOODS, PHYSICAL_SYMPTOMS } from '../constants/periodTracker';

interface DailyLogModalProps {
    open: boolean;
    dateString: string;
    existingLog: any | null;
    loading: boolean;
    onClose: () => void;
    onSave: (payload: any) => void;
}

export default function DailyLogModal({ open, dateString, existingLog, loading, onClose, onSave }: DailyLogModalProps) {
    const [note, setNote] = useState('');
    const [mood, setMood] = useState('');
    const [foods, setFoods] = useState<string[]>([]);
    const [physicalSymptoms, setPhysicalSymptoms] = useState<string[]>([]);
    const [waterGlasses, setWaterGlasses] = useState(0);
    const [calories, setCalories] = useState(0);

    useEffect(() => {
        if (open) {
            setNote(existingLog?.notes || '');
            setMood(existingLog?.mood || '');
            const cravings = existingLog?.cravings ||
                (existingLog?.symptoms || []).filter((s: string) => FOODS.some(f => f.id === s));
            const physical = existingLog?.physical_symptoms || [];
            setFoods(cravings);
            setPhysicalSymptoms(physical);
            setWaterGlasses(existingLog?.water_glasses || 0);
            setCalories(existingLog?.calories || 0);
        }
    }, [open, existingLog]);

    if (!open) return null;

    const toggleFood = (id: string) => {
        setFoods(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const togglePhysical = (id: string) => {
        setPhysicalSymptoms(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSave = () => {
        onSave({
            note,
            mood,
            cravings: foods,
            physical_symptoms: physicalSymptoms,
            water_glasses: waterGlasses,
            calories,
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
            <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">ثبت وضعیت برای {dateString}</h3>
                    <button type="button" onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-7">
                    {/* یادداشت */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-pink-500">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-sm font-bold">یادداشت من</span>
                        </div>
                        <textarea
                            className="w-full resize-none rounded-2xl border-0 bg-[#FFF9FA] p-4 text-sm outline-none ring-1 ring-pink-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                            placeholder="علائم یا اتفاقات امروز را بنویس..."
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>

                    {/* آب شمار */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sky-500">
                            <GlassWater className="h-4 w-4" />
                            <span className="text-sm font-bold">آب مصرفی</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-sky-50/50 p-3 ring-1 ring-sky-100">
                            <span className="text-sm text-gray-600">لیوان آب</span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setWaterGlasses(w => Math.max(0, w - 1))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-100"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center text-lg font-bold text-sky-600">{waterGlasses}</span>
                                <button
                                    type="button"
                                    onClick={() => setWaterGlasses(w => w + 1)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-100"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* کالری شمار */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-orange-500">
                            <Flame className="h-4 w-4" />
                            <span className="text-sm font-bold">کالری مصرفی</span>
                        </div>
                        <input
                            type="number"
                            min={0}
                            step={10}
                            value={calories}
                            onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                            className="w-full rounded-2xl border-0 bg-[#FFF9FA] p-4 text-center text-sm outline-none ring-1 ring-orange-100 focus:ring-2 focus:ring-orange-200 text-gray-700"
                            placeholder="مقدار کالری را وارد کنید"
                        />
                    </div>

                    {/* حالت روحی */}
                    <div className="space-y-3">
                        <span className="block text-sm font-bold text-gray-700">حالت روحی چطوره؟</span>
                        <div className="flex flex-wrap gap-2.5">
                            {MOODS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setMood(prev => prev === item.id ? '' : item.id)}
                                    className={`flex w-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 transition-all ${
                                        mood === item.id
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

                    {/* هوس غذایی */}
                    <div className="space-y-3">
                        <span className="block text-sm font-bold text-gray-700">هوس چه طعمی کردی؟</span>
                        <div className="flex flex-wrap gap-2.5">
                            {FOODS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleFood(item.id)}
                                    className={`flex w-[68px] flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 transition-all ${
                                        foods.includes(item.id)
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

                    {/* علائم فیزیکی */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-rose-500">
                            <Activity className="h-4 w-4" />
                            <span className="text-sm font-bold">علائم فیزیکی</span>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {PHYSICAL_SYMPTOMS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => togglePhysical(item.id)}
                                    className={`flex w-[78px] flex-col items-center justify-center gap-1 rounded-2xl border-2 py-3 transition-all ${
                                        physicalSymptoms.includes(item.id)
                                            ? 'scale-105 border-rose-400 bg-rose-50 shadow-sm'
                                            : 'border-transparent bg-[#FFF9FA] ring-1 ring-pink-50 hover:bg-rose-50/50'
                                    }`}
                                >
                                    <span className="text-xl">{item.emoji}</span>
                                    <span className="text-[10px] text-gray-500">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button
                    disabled={loading}
                    className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-base font-bold text-white shadow-lg hover:from-pink-600 hover:to-rose-600"
                    onClick={handleSave}
                >
                    {loading ? 'در حال ذخیره...' : 'ثبت نهایی علائم روزانه'}
                </Button>
            </div>
        </div>
    );
}