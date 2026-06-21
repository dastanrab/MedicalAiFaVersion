import { useState } from 'react';
import { PageHeader } from '../../components';
import { mockTimeSlots } from '../../data/mockData';

const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'];

export function LabSchedulePage() {
    const [slots, setSlots] = useState(mockTimeSlots);
    const [activeDays, setActiveDays] = useState<string[]>(weekDays);

    const toggleDay = (day: string) => {
        setActiveDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader title="زمان‌بندی نمونه‌گیری" description="بازه‌های زمانی، ظرفیت و روزهای کاری" />

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-3 text-sm font-semibold text-slate-700">روزهای کاری</p>
                <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                activeDays.includes(day)
                                    ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
                                    : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {slots.map((slot) => {
                    const full = slot.booked >= slot.capacity;
                    return (
                        <div
                            key={slot.id}
                            className={`rounded-2xl border p-4 ${
                                full ? 'border-red-100 bg-red-50/30' : 'border-slate-200 bg-white'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-slate-800">{slot.label}</p>
                                <span
                                    className={`text-xs font-medium ${
                                        slot.active ? 'text-emerald-600' : 'text-slate-400'
                                    }`}
                                >
                                    {slot.active ? 'فعال' : 'غیرفعال'}
                                </span>
                            </div>
                            <div className="mt-3">
                                <div className="mb-1 flex justify-between text-xs text-slate-500">
                                    <span>رزرو شده</span>
                                    <span>
                                        {slot.booked} / {slot.capacity}
                                    </span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-full rounded-full ${full ? 'bg-red-400' : 'bg-amber-500'}`}
                                        style={{ width: `${(slot.booked / slot.capacity) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setSlots((prev) =>
                                        prev.map((s) =>
                                            s.id === slot.id ? { ...s, active: !s.active } : s
                                        )
                                    )
                                }
                                className="mt-3 text-xs text-amber-600 hover:underline"
                            >
                                {slot.active ? 'مسدود کردن بازه' : 'فعال‌سازی'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <button type="button" className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-amber-300 hover:text-amber-700">
                + افزودن بازه زمانی جدید
            </button>
        </div>
    );
}
