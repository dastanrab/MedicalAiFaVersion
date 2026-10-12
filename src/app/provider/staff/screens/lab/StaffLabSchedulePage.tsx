import { useMemo } from 'react';
import { Home, MapPin } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge, formatFaNumber } from '../../../components';
import { labVisitTypeLabels, staffLabStatusLabels, staffLabStatusStyles } from '../../config/staffStatusOptions';
import { todayKey } from '../../data/mockStaffData';
import { useStaffDataStore } from '../../store/staffDataStore';

/** نمونه‌گیری‌های امروز و آینده به تفکیک روز */
export function StaffLabSchedulePage() {
    const requests = useStaffDataStore((s) => s.labRequests);
    const today = todayKey();

    const days = useMemo(() => {
        const upcoming = requests
            .filter((r) => r.date >= today && (r.status === 'new' || r.status === 'confirmed'))
            .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
        const grouped = new Map<string, typeof upcoming>();
        for (const r of upcoming) grouped.set(r.date, [...(grouped.get(r.date) ?? []), r]);
        return [...grouped.entries()];
    }, [requests, today]);

    return (
        <div className="space-y-6">
            <PageHeader title="زمان‌بندی نمونه‌گیری" description="نمونه‌گیری‌های پیش‌رو در آزمایشگاه و منزل" />

            {days.length === 0 ? (
                <EmptyState message="نمونه‌گیری برنامه‌ریزی‌شده‌ای وجود ندارد." />
            ) : (
                days.map(([date, items]) => (
                    <section key={date} className="rounded-2xl border border-slate-200 bg-white">
                        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                            <h3 className="font-semibold text-slate-800">
                                {date}
                                {date === today && <span className="mr-2 text-xs font-normal text-amber-600">امروز</span>}
                            </h3>
                            <span className="text-xs text-slate-500">{formatFaNumber(items.length)} نمونه‌گیری</span>
                        </header>
                        <ul className="divide-y divide-slate-100">
                            {items.map((r) => (
                                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-medium text-amber-700" dir="ltr">
                                            {r.time}
                                        </span>
                                        <div>
                                            <p className="font-medium text-slate-800">{r.patientName}</p>
                                            <p className="flex items-center gap-1 text-xs text-slate-400">
                                                {r.type === 'home' ? <MapPin className="h-3 w-3" /> : <Home className="h-3 w-3" />}
                                                {r.type === 'home' ? r.address : labVisitTypeLabels[r.type]}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge label={staffLabStatusLabels[r.status]} className={staffLabStatusStyles[r.status]} />
                                </li>
                            ))}
                        </ul>
                    </section>
                ))
            )}
        </div>
    );
}
