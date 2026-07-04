import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import { JalaliCalendar } from '../../components/JalaliCalendar';
import { EmptyState, PageHeader, StatusBadge } from '../../components';
import { useProviderSession } from '../../store/providerAuthStore';
import {
    NurseRequestStatus,
    nurseStatusLabels,
    nurseStatusStyles,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import {
    formatJalali,
    todayJalali,
    toFaDigits,
    type JalaliDate,
} from '../../utils/jalali';

import { useNurseStore } from '../../store/nurseStore';

export function NurseCalendarPage() {
    const medicalCenterSession = useProviderSession('nurse');
    const setRequests = useNurseStore((state) => state.setRequests);
    const requests = useNurseStore((s) => s.requests);

    const [loading, setLoading] = useState(false);
    const today = todayJalali();
    const [selectedDate, setSelectedDate] = useState<JalaliDate>(today);

    const selectedKey = formatJalali(selectedDate);

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!medicalCenterSession?.token) return;

            try {
                setLoading(true);
                const response = await fetch('http://185.222.163.113:7000/api/owner/medical-center/schedule', {
                    headers: {
                        'Authorization': `Bearer ${medicalCenterSession.token}`,
                        'Accept': 'application/json',
                    },
                });

                const result = await response.json();

                if (result.status) {
                    const statusMap: Record<number, NurseRequestStatus> = {
                        0: 'new',
                        1: 'accepted',
                        2: 'in_progress',
                        3: 'completed',
                        4: 'canceled',
                    };
                    const mappedData = result.data.map((item: any) => {
                        const dateObj = new Date(item.scheduledDate);
                        const jalaliStr = new Intl.DateTimeFormat('fa-IR-u-nu-latn', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        }).format(dateObj).replace(/\//g, '/'); // خروجی مثل 1405/04/13

                        return {
                            ...item,
                            scheduledDate: jalaliStr,
                            status: statusMap[item.status] ?? 'new',
                            services: Array.isArray(item.services) ? item.services : [],
                        };
                    });



                    setRequests(mappedData);
                }
            } catch (error) {
                console.error('خطا در دریافت برنامه‌های زمان‌بندی:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [medicalCenterSession?.token, setRequests]);

    const dayRequests = useMemo(
        () => requests.filter((r) => r.scheduledDate === selectedKey),
        [requests, selectedKey],
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
                title="زمان‌بندی مرکز درمانی"
                description="نمایش درخواست‌های خدمات بر اساس روز — بدون زمان‌بندی ساعتی"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">
                            <p className="text-sm font-medium text-slate-600">در حال دریافت تقویم...</p>
                        </div>
                    )}
                    <JalaliCalendar
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        markedDates={markedDates}
                        workingDays={workingDays}
                        accentClass="bg-emerald-600 text-white"
                    />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                    <div className="mb-4 border-b border-slate-100 pb-4">
                        <p className="text-sm text-slate-500">درخواست‌های روز انتخاب‌شده</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-800">
                            {toFaDigits(selectedKey)}
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
                                            {r.services.map((s: any) => s.name).join('، ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge
                                            label={nurseStatusLabels[r.status] || r.status}
                                            className={nurseStatusStyles[r.status] || 'bg-slate-100 text-slate-700'}
                                        />
                                        <Link
                                            to={providerPath('nurse', `requests/${r.id}`)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50"
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
