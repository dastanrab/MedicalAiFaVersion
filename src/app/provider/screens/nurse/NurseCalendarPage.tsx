import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye, Loader2 } from 'lucide-react';
import { JalaliCalendar } from '../../components/JalaliCalendar';
import { EmptyState, PageHeader, StatusBadge } from '../../components';
import { fetchNurseRequestsByDate } from '../../services/nurseApi';
import { useNurseStore } from '../../store/nurseStore';
import {
    nurseStatusLabels,
    nurseStatusStyles,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import {
    formatJalali,
    todayJalali,
    type JalaliDate,
} from '../../utils/jalali';
import type { NurseRequest } from '../../data/mockData';

export function NurseCalendarPage() {
    const requests = useNurseStore((s) => s.requests);
    const today = todayJalali();
    const [selectedDate, setSelectedDate] = useState<JalaliDate>(today);
    const [dayRequests, setDayRequests] = useState<NurseRequest[]>([]);
    const [loading, setLoading] = useState(false);

    const selectedKey = formatJalali(selectedDate);

    const markedDates = useMemo(() => {
        const map: Record<string, number> = {};
        for (const r of requests) {
            map[r.scheduledDate] = (map[r.scheduledDate] ?? 0) + 1;
        }
        return map;
    }, [requests]);

    const workingDays = useMemo(() => {
        const days = new Set<string>();
        for (const r of requests) {
            if (!['canceled'].includes(r.status)) {
                days.add(r.scheduledDate);
            }
        }
        return days;
    }, [requests]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchNurseRequestsByDate(selectedKey)
            .then((items) => {
                if (!cancelled) setDayRequests(items);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [selectedKey]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="تقویم درخواست‌ها"
                description="نمایش روزهای کاری و درخواست‌های پرستاری بر اساس تاریخ شمسی"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <JalaliCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    markedDates={markedDates}
                    workingDays={workingDays}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div className="mb-4 border-b border-slate-100 pb-4">
                        <p className="text-sm text-slate-500">درخواست‌های روز انتخاب‌شده</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-800">
                            {selectedKey}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {dayRequests.length > 0
                                ? `${dayRequests.length.toLocaleString('fa-IR')} درخواست`
                                : 'بدون درخواست'}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : dayRequests.length === 0 ? (
                        <EmptyState message="در این روز درخواستی ثبت نشده است." />
                    ) : (
                        <ul className="space-y-3">
                            {dayRequests.map((r) => (
                                <li
                                    key={r.id}
                                    className="rounded-xl border border-slate-100 p-4 transition hover:border-rose-200 hover:bg-rose-50/30"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium text-slate-800">{r.patientName}</p>
                                            <p className="mt-1 text-xs text-slate-500">{r.serviceType}</p>
                                        </div>
                                        <StatusBadge
                                            label={nurseStatusLabels[r.status]}
                                            className={nurseStatusStyles[r.status]}
                                        />
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                        <span>ساعت: {r.scheduledTime}</span>
                                        <Link
                                            to={providerPath('nurse', `requests/${r.id}`)}
                                            className="inline-flex items-center gap-1 text-rose-600 hover:underline"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            جزئیات
                                        </Link>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
