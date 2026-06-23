import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import { JalaliCalendar } from '../../components/JalaliCalendar';
import { EmptyState, PageHeader, StatusBadge } from '../../components';
import { useLabStore } from '../../store/labStore';
import { labStatusLabels, labStatusStyles } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import { formatJalali, todayJalali, toFaDigits, type JalaliDate } from '../../utils/jalali';

export function LabSchedulePage() {
    const requests = useLabStore((s) => s.requests);
    const today = todayJalali();
    const [selectedDate, setSelectedDate] = useState<JalaliDate>(today);

    const selectedKey = formatJalali(selectedDate);

    const dayRequests = useMemo(
        () => requests.filter((r) => r.scheduledDate === selectedKey),
        [requests, selectedKey]
    );

    const markedDates = useMemo(() => {
        const map: Record<string, number> = {};
        for (const r of requests) {
            if (r.status !== 'canceled') {
                map[r.scheduledDate] = (map[r.scheduledDate] ?? 0) + 1;
            }
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

    return (
        <div className="space-y-6">
            <PageHeader
                title="زمان‌بندی آزمایشگاه"
                description="نمایش درخواست‌های آزمایش بر اساس روز — بدون زمان‌بندی ساعتی"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <JalaliCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    markedDates={markedDates}
                    workingDays={workingDays}
                    accentClass="bg-amber-600 text-white"
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div className="mb-4 border-b border-slate-100 pb-4">
                        <p className="text-sm text-slate-500">درخواست‌های روز انتخاب‌شده</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-800">
                            {toFaDigits(selectedKey.replace(/\//g, '/'))}
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            {dayRequests.length} درخواست
                        </p>
                    </div>

                    {dayRequests.length === 0 ? (
                        <EmptyState message="در این روز درخواستی ثبت نشده است." />
                    ) : (
                        <ul className="space-y-3">
                            {dayRequests.map((r) => (
                                <li
                                    key={r.id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-800">{r.patientName}</p>
                                        <p className="text-xs text-slate-500">{r.code}</p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {r.tests.map((t) => t.name).join('، ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge
                                            label={labStatusLabels[r.status]}
                                            className={labStatusStyles[r.status]}
                                        />
                                        <Link
                                            to={providerPath('lab', `requests/${r.id}`)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50"
                                        >
                                            <Eye className="h-4 w-4" />
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
