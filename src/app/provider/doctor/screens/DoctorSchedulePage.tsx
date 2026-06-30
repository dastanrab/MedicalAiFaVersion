import { useMemo, useState } from 'react';
import { PageHeader } from '../../components';
import { JalaliCalendar } from '../../components/JalaliCalendar';
import {
    mockDoctorAppointments,
    mockDoctorWorkingHours,
} from '../data/mockDoctorData';
import {
    formatJalali,
    todayJalali,
    type JalaliDate,
} from '../../utils/jalali';

export function DoctorSchedulePage() {
    const today = todayJalali();
    const [selectedDate, setSelectedDate] = useState<JalaliDate>(today);
    const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
    const [dayOff, setDayOff] = useState(false);

    const selectedKey = formatJalali(selectedDate);

    const markedDates = useMemo(() => {
        const map: Record<string, number> = {};
        for (const a of mockDoctorAppointments) {
            if (a.status !== 'canceled') {
                map[a.date] = (map[a.date] ?? 0) + 1;
            }
        }
        return map;
    }, []);

    const dayAppointments = useMemo(
        () => mockDoctorAppointments.filter((a) => a.date === selectedKey),
        [selectedKey]
    );

    const toggleSlot = (hour: string) => {
        const key = `${selectedKey} — ${hour}`;
        setBlockedSlots((prev) =>
            prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
        );
    };

    const isSlotBlocked = (hour: string) => blockedSlots.includes(`${selectedKey} — ${hour}`);

    return (
        <div className="space-y-6">
            <PageHeader
                title="برنامه زمانی"
                description="تقویم شمسی، ساعات کاری و زمان‌های آزاد"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <JalaliCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    markedDates={markedDates}
                    accentClass="bg-blue-600 text-white"
                />

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-700">
                                ساعات کاری — {selectedKey}
                            </p>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={dayOff}
                                    onChange={(e) => setDayOff(e.target.checked)}
                                    className="h-4 w-4 rounded"
                                />
                                تعطیلی روز
                            </label>
                        </div>

                        {dayOff ? (
                            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-500">
                                این روز تعطیل است
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {mockDoctorWorkingHours.map((h) => {
                                    const blocked = isSlotBlocked(h);
                                    const booked = dayAppointments.some((a) => a.time === h);
                                    return (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => !booked && toggleSlot(h)}
                                            disabled={booked}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                                booked
                                                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'
                                                    : blocked
                                                      ? 'bg-slate-200 text-slate-500 line-through'
                                                      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100'
                                            }`}
                                        >
                                            {h}
                                            {booked && ' (رزرو)'}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        {/* TODO: ذخیره برنامه زمانی از طریق API */}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="mb-4 text-sm font-semibold text-slate-700">نوبت‌های این روز</p>
                        {dayAppointments.length === 0 ? (
                            <p className="text-sm text-slate-500">نوبتی ثبت نشده</p>
                        ) : (
                            <ul className="space-y-2">
                                {dayAppointments.map((a) => (
                                    <li
                                        key={a.id}
                                        className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-sm"
                                    >
                                        <span className="font-medium">{a.patientName}</span>
                                        <span className="text-slate-500">{a.time}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
