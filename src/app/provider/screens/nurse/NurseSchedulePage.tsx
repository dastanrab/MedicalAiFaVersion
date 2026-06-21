import { useState } from 'react';
import { PageHeader } from '../../components';
import { mockNurseRequests, nurseBlockedSlots, nurseMaxVisitsPerDay } from '../../data/mockData';

const hours = ['۸:۰۰', '۱۰:۰۰', '۱۲:۰۰', '۱۴:۰۰', '۱۶:۰۰', '۱۸:۰۰'];

export function NurseSchedulePage() {
    const [blocked, setBlocked] = useState<string[]>(nurseBlockedSlots);
    const [maxVisits] = useState(nurseMaxVisitsPerDay);
    const todayCount = mockNurseRequests.filter((r) =>
        ['accepted', 'on_way', 'in_progress'].includes(r.status)
    ).length;

    const toggleBlock = (slot: string) => {
        setBlocked((prev) =>
            prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="برنامه زمانی من"
                description={`حداکثر ${maxVisits} ویزیت در روز — امروز: ${todayCount} ویزیت`}
            />

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">ساعات کاری امروز</p>
                <div className="flex flex-wrap gap-2">
                    {hours.map((h) => {
                        const key = `امروز — ${h}`;
                        const isBlocked = blocked.includes(key);
                        return (
                            <button
                                key={h}
                                type="button"
                                onClick={() => toggleBlock(key)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium ${
                                    isBlocked
                                        ? 'bg-slate-200 text-slate-500 line-through'
                                        : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                }`}
                            >
                                {h}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">ویزیت‌های رزرو شده</p>
                <ul className="space-y-3">
                    {mockNurseRequests.map((r) => (
                        <li
                            key={r.id}
                            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3 text-sm"
                        >
                            <span className="font-medium">{r.patientName}</span>
                            <span className="text-slate-500">{r.scheduledAt}</span>
                            <span className="text-xs text-rose-600">{r.serviceType}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-2 text-sm font-semibold text-slate-700">روزهای مسدود</p>
                <ul className="text-sm text-slate-500">
                    {blocked.map((s) => (
                        <li key={s}>• {s}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
