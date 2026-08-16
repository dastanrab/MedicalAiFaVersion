import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye, Loader2, List, Calendar as CalendarIcon } from 'lucide-react';
import { toGregorian, toJalaali } from 'jalaali-js';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
} from '../../components';
import { JalaliCalendar } from '../../components';
import {
    formatJalali,
    todayJalali,
    type JalaliDate,
} from '../../utils/jalali';
import {
    doctorAppointmentStatusLabels,
    doctorAppointmentStatusStyles,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import { useDoctorAuthStore } from "../store/doctorAuthStore";

const API_BASE_URL = 'http://185.222.163.113:7000/api';

const filterOptions = [
    { value: 'all', label: 'همه' },
    { value: 'booked', label: 'رزرو شده' },
    { value: 'done', label: 'انجام شده' },
];

interface ApiAppointment {
    id: number;
    name: string;
    phone: string;
    status: 'available' | 'booked' | 'blocked' | 'done';
    slot_date: string;
    start_time: string;
}

interface Appointment {
    id: number;
    patientName: string;
    patientPhone: string;
    status: 'available' | 'booked' | 'blocked' | 'done';
    date: string;
    time: string;
}

interface CalendarSummaryItem {
    slot_date: string;
    total_slots: number;
    available_slots: number;
    booked_slots: number;
    blocked_slots: number;
    done_slots: number;
}

function gregorianToJalaliKey(date: string): string {
    const [gy, gm, gd] = date.split('-').map(Number);
    const j = toJalaali(gy, gm, gd);
    return `${j.jy}/${String(j.jm).padStart(2, '0')}/${String(j.jd).padStart(2, '0')}`;
}

function jalaliToGregorianString(d: JalaliDate): string {
    const g = toGregorian(d.jy, d.jm, d.jd);
    return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`;
}

export function DoctorAppointmentsPage() {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'booked' | 'done'>('all');

    // Appointment states
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Calendar states
    const today = todayJalali();
    const [selectedDate, setSelectedDate] = useState<JalaliDate>(today);
    const [calendarSummary, setCalendarSummary] = useState<CalendarSummaryItem[]>([]);

    const { token } = useDoctorAuthStore();

    const selectedGregorianDate = useMemo(
        () => jalaliToGregorianString(selectedDate),
        [selectedDate]
    );

    useEffect(() => {
        fetchAppointments();
        fetchCalendarSummary();
    }, [token]);

    const fetchAppointments = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/doctor/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error('خطا در دریافت نوبت‌ها');
            const result = await response.json();

            if (result.status && result.data) {
                const mapped: Appointment[] = result.data.map((a: ApiAppointment) => ({
                    id: a.id,
                    patientName: a.name,
                    patientPhone: a.phone,
                    status: a.status,
                    date: a.slot_date,
                    time: a.start_time,
                }));
                setAppointments(mapped);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCalendarSummary = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/doctor/schedule/calendar-summary`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            const result = await res.json();
            if (result.status) {
                setCalendarSummary(result.data ?? []);
            }
        } catch (err) {
            console.error('خطا در دریافت خلاصه تقویم', err);
        }
    };

    // آماده‌سازی داده‌های تقویم با لیبل‌های متنی چندخطی
    const markedDates = useMemo(() => {
        const map: Record<string, string> = {}; // تایپ به Record<string, string> تغییر کرد
        for (const item of calendarSummary) {
            const key = gregorianToJalaliKey(item.slot_date);
            // ساختن متن سه خطی برای نمایش روی تقویم
            map[key] = `رزرو: ${item.booked_slots}\nانجام: ${item.done_slots}\nآزاد: ${item.available_slots}`;
        }
        return map;
    }, [calendarSummary]);

    const filteredList = useMemo(() => {
        return appointments.filter((a) => {
            // اگر در حالت تقویم هستیم، فقط نوبت‌های همان روز انتخاب شده را نشان بده
            if (viewMode === 'calendar' && a.date !== selectedGregorianDate) return false;

            if (filter !== 'all' && a.status !== filter) return false;
            const q = search.trim();
            if (!q) return true;
            return a.patientName.includes(q) || a.patientPhone.includes(q);
        });
    }, [appointments, search, filter, viewMode, selectedGregorianDate]);

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader title="نوبت‌ها" description="مدیریت نوبت‌های ویزیت بیماران" />
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PageHeader title="نوبت‌ها" description="مدیریت نوبت‌های ویزیت بیماران" />

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                            viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <List className="h-4 w-4" />
                        لیست
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                            viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        تقویم
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
                    <JalaliCalendar
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        markedDates={markedDates} // داده‌های جدید و متنی به کامپوننت تقویم پاس داده می‌شود
                        accentClass="bg-blue-600 text-white"
                    />
                </div>
            )}

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجوی بیمار..." />
                <FilterSelect
                    label="فیلتر"
                    value={filter}
                    onChange={(v) => setFilter(v as typeof filter)}
                    options={filterOptions}
                />
            </div>

            {filteredList.length === 0 ? (
                <EmptyState message={viewMode === 'calendar' ? "نوبتی در این تاریخ یافت نشد." : "نوبتی یافت نشد."} />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">ساعت</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                            <th className="px-4 py-3" />
                        </tr>
                        </thead>
                        <tbody>
                        {filteredList.map((a) => (
                            <tr key={a.id} className="border-t border-slate-100">
                                <td className="px-4 py-3">
                                    <p>{a.patientName}</p>
                                    <p className="text-xs text-slate-400" dir="ltr">{a.patientPhone}</p>
                                </td>
                                <td className="px-4 py-3">{a.date}</td>
                                <td className="px-4 py-3">{a.time}</td>
                                <td className="px-4 py-3">
                                    <StatusBadge
                                        label={doctorAppointmentStatusLabels[a.status]}
                                        className={doctorAppointmentStatusStyles[a.status]}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <Link
                                        to={providerPath('doctor', `appointments/${a.id}`)}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                                    >
                                        <Eye className="h-4 w-4" />
                                        جزئیات
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
