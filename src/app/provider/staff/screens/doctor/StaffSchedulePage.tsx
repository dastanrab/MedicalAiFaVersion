import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, Lock, RefreshCw } from 'lucide-react';
import { EmptyState, PageHeader, formatFaNumber } from '../../../components';
import { showProviderError } from '../../../utils/toast';
import { useStaffSession, useStaffStore } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

interface Shift {
    start: string;
    end: string;
}

interface ScheduleDay {
    dayIndex: number;
    weekday: string;
    slotMinutes: number;
    shifts: Shift[];
    isClosed: boolean;
}

/** برنامه زمانی مطب — فقط خواندنی؛ تغییر ساعت‌ها با پزشک است */
export function StaffSchedulePage() {
    const session = useStaffSession('doctor');
    const logout = useStaffStore((s) => s.logout);

    const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedule = useCallback(async () => {
        if (!session?.token) {
            logout('doctor');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`${API_BASE}/staff/doctor/schedule`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
            });

            if (res.status === 401) {
                logout('doctor');
                return;
            }

            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setSchedule(result.data);
            } else {
                const msg = result.message || 'خطا در دریافت برنامه زمانی مطب';
                setError(msg);
                showProviderError(msg);
            }
        } catch (err) {
            console.error('Error fetching schedule:', err);
            const msg = 'خطایی در ارتباط با سرور رخ داد.';
            setError(msg);
            showProviderError(msg);
        } finally {
            setLoading(false);
        }
    }, [session?.token, logout]);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    return (
        <div className="space-y-6">
            <PageHeader title="برنامه زمانی" description="ساعات کاری هفتگی مطب" />

            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                <span>این بخش فقط خواندنی است. برای تغییر ساعات کاری با پزشک هماهنگ کنید.</span>
            </div>

            {loading ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/70 p-6 text-center text-rose-700">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={fetchSchedule}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-500"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        تلاش مجدد
                    </button>
                </div>
            ) : schedule.length === 0 ? (
                <EmptyState message="هیچ برنامه کاری برای این مطب تنظیم نشده است." />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {schedule.map((day) => (
                        <div key={day.dayIndex} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="font-semibold text-slate-800">{day.weekday}</p>
                                {day.shifts.length > 0 && (
                                    <span className="text-xs text-slate-400">
                                        هر نوبت {formatFaNumber(day.slotMinutes)} دقیقه
                                    </span>
                                )}
                            </div>
                            {day.shifts.length === 0 ? (
                                <p className="text-sm font-medium text-slate-400">تعطیل</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {day.shifts.map((s, idx) => (
                                        <span
                                            key={`${s.start}-${idx}`}
                                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                                            dir="ltr"
                                        >
                                            {s.start} – {s.end}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
