import { useState, useMemo, useEffect } from 'react';
import {
    CalendarCheck,
    Search,
    Filter,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    RefreshCw,
    Ban,
    CheckCircle2,
    UserX,
    CalendarClock,
    FileSpreadsheet,
} from 'lucide-react';
import { iranProvinces, iranCitiesByProvince } from '../../data/iranLocations';
import {
    appointmentStatusLabels,
    appointmentStatusStyles,
    type AdminAppointmentRow,
    type AppointmentStatus,
} from '../config/appointmentOptions';
import {
    fetchAppointments,
    fetchDoctors,
    updateAppointmentStatus,
    cancelAppointmentApi,
    type ApiAppointment,
    type ApiDoctor, setTokenGetter,
} from '../../services/api';
import { AppointmentDetailsModal } from '../components/AppointmentDetailsModal';
import { CancelAppointmentModal } from '../components/CancelAppointmentModal';
import {useAdminAuthStore} from "../store/adminAuthStore";

// تبدیل وضعیت از API به وضعیت داخلی
const mapApiStatusToInternal = (statusText: string): AppointmentStatus => {
    const statusMap: Record<string, AppointmentStatus> = {
        'رزرو شده': 'booked',
        'انجام شده': 'done',
        'لغو شده': 'canceled',
        'عدم حضور': 'no-show',
        'آزاد': 'available',
    };
    return statusMap[statusText] || 'booked';
};

// تبدیل وضعیت داخلی به وضعیت API
const mapInternalStatusToApi = (status: AppointmentStatus): string => {
    const statusMap: Record<AppointmentStatus, string> = {
        'booked': 'booked',
        'done': 'completed',
        'canceled': 'canceled',
        'no-show': 'no_show',
        'available': 'available',
    };
    return statusMap[status];
};

// تبدیل داده‌های API به AdminAppointmentRow
const mapApiToAppointmentRow = (apiAppointment: ApiAppointment): AdminAppointmentRow => {
    // استخراج استان و شهر از location
    const locationParts = apiAppointment.patient.location.split(' — ');
    const province = locationParts[0] || 'تهران';
    const city = locationParts[1] || 'تهران';

    // ساخت scheduledAt از date و time
    const scheduledAt = `${apiAppointment.datetime.date}T${apiAppointment.datetime.time}:00`;

    return {
        id: apiAppointment.id,
        patientName: apiAppointment.patient.name,
        patientPhone: apiAppointment.mobile || 'نامشخص',
        doctorId: 0, // از API پزشکان دریافت می‌شود
        doctorName: apiAppointment.doctor.name,
        doctorSpecialty: apiAppointment.doctor.specialty,
        province,
        city,
        scheduledAt,
        status: mapApiStatusToInternal(apiAppointment.status.text),
        roomId: null,
        cancelReason: apiAppointment.status.text === 'لغو شده' ? 'لغو توسط سیستم' : undefined,
    };
};

function formatDateTime(iso: string) {
    if (!iso) return '—';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function downloadAppointmentsExcel(rows: AdminAppointmentRow[]) {
    const header = [
        'ردیف',
        'بیمار',
        'موبایل',
        'پزشک',
        'تخصص',
        'استان',
        'شهر',
        'تاریخ و زمان',
        'وضعیت',
        'شناسه اتاق',
        'دلیل لغو',
    ];

    const body = rows
        .map(
            (r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r.patientName}</td>
            <td>${r.patientPhone}</td>
            <td>${r.doctorName}</td>
            <td>${r.doctorSpecialty ?? ''}</td>
            <td>${r.province}</td>
            <td>${r.city}</td>
            <td>${formatDateTime(r.scheduledAt)}</td>
            <td>${appointmentStatusLabels[r.status]}</td>
            <td>${r.roomId ?? ''}</td>
            <td>${r.cancelReason ?? ''}</td>
        </tr>`
        )
        .join('');

    const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
            <head><meta charset="UTF-8"></head>
            <body>
                <table border="1">
                    <thead><tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody>${body}</tbody>
                </table>
            </body>
        </html>`;

    const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointments-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
}

export function AdminAppointments() {
    const accessToken = useAdminAuthStore((state) => state.token);

    // تنظیم توکن در سرویس API
    useEffect(() => {
        setTokenGetter(() => accessToken);
    }, [accessToken]);

    const [appointments, setAppointments] = useState<AdminAppointmentRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState<ApiDoctor[]>([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
    });

    const [patientSearch, setPatientSearch] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [doctorId, setDoctorId] = useState<string>('all');
    const [status, setStatus] = useState<AppointmentStatus | 'all'>('all');
    const [province, setProvince] = useState('all');
    const [city, setCity] = useState('all');

    const [page, setPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [detailsRow, setDetailsRow] = useState<AdminAppointmentRow | null>(null);
    const [cancelRow, setCancelRow] = useState<AdminAppointmentRow | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const cities = province === 'all' ? [] : iranCitiesByProvince[province] ?? [];

    // بارگذاری اولیه داده‌ها
    useEffect(() => {
        fetchAppointmentsData();
        fetchDoctorsData();
    }, []);

    // بارگذاری نوبت‌ها از API
    const fetchAppointmentsData = async (pageNum: number = 1) => {
        setLoading(true);
        try {
            const filters = {
                patientName: patientSearch,
                patientPhone,
                doctorId,
                status: status === 'all' ? undefined : status,
                province: province === 'all' ? undefined : province,
                city: city === 'all' ? undefined : city,
            };

            const response = await fetchAppointments(pageNum, 15, filters);

            // تبدیل داده‌های API به فرمت داخلی
            const mappedAppointments = response.data.map(mapApiToAppointmentRow);

            setAppointments(mappedAppointments);
            setPagination(response.meta);
            setPage(response.meta.current_page);
        } catch (error) {
            console.error('خطا در دریافت نوبت‌ها:', error);
            // می‌توانید یک toast یا notification اضافه کنید
        } finally {
            setLoading(false);
        }
    };

    // بارگذاری لیست پزشکان
    const fetchDoctorsData = async () => {
        try {
            const doctorsData = await fetchDoctors();
            setDoctors(doctorsData);
        } catch (error) {
            console.error('خطا در دریافت لیست پزشکان:', error);
            // استفاده از لیست پیش‌فرض در صورت خطا
            setDoctors([
                { id: 1, name: 'دکتر مریم نوری' },
                { id: 2, name: 'دکتر حسین کریمی' },
                { id: 3, name: 'دکتر رضا کریمی' },
                { id: 4, name: 'دکتر سارا موسوی' },
                { id: 5, name: 'دکتر لیلی اوتادی' },
            ]);
        }
    };

    // وقتی فیلترها تغییر می‌کنند، داده‌ها را مجدداً بارگذاری کن
    useEffect(() => {
        fetchAppointmentsData(1);
    }, [patientSearch, patientPhone, doctorId, status, province, city]);

    // وقتی صفحه تغییر می‌کند
    useEffect(() => {
        fetchAppointmentsData(page);
    }, [page]);

    const resetPage = () => setPage(1);

    const resetFilters = () => {
        setPatientSearch('');
        setPatientPhone('');
        setDoctorId('all');
        setStatus('all');
        setProvince('all');
        setCity('all');
        resetPage();
    };

    const handleRefresh = () => {
        fetchAppointmentsData(page);
    };

    const updateStatus = async (id: number, newStatus: AppointmentStatus) => {
        setActionLoadingId(id);
        try {
            await updateAppointmentStatus(id, mapInternalStatusToApi(newStatus));

            // به‌روزرسانی لیست محلی
            setAppointments((prev) =>
                prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
            );
            setOpenMenuId(null);
        } catch (error) {
            console.error('خطا در به‌روزرسانی وضعیت:', error);
            // نمایش پیام خطا به کاربر
        } finally {
            setActionLoadingId(null);
        }
    };

    const cancelAppointment = async (id: number, reason: string) => {
        setActionLoadingId(id);
        try {
            await cancelAppointmentApi(id, reason);

            // به‌روزرسانی لیست محلی
            setAppointments((prev) =>
                prev.map((a) =>
                    a.id === id ? { ...a, status: 'canceled' as const, cancelReason: reason } : a
                )
            );
            setOpenMenuId(null);
        } catch (error) {
            console.error('خطا در لغو نوبت:', error);
            // نمایش پیام خطا به کاربر
        } finally {
            setActionLoadingId(null);
        }
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <CalendarCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">نوبت‌ها</h2>
                        <p className="text-sm text-slate-500">
                            مدیریت نوبت‌های رزرو شده از لیست پزشکان و ویزیت آنلاین
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => downloadAppointmentsExcel(appointments)}
                        disabled={appointments.length === 0}
                        className="flex h-11 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        دانلود اکسل
                    </button>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        بروزرسانی
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Filter className="h-4 w-4" />
                        جستجو و فیلتر
                    </div>
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex items-center gap-1 text-xs text-slate-500 transition hover:text-indigo-600"
                    >
                        <X className="h-3.5 w-3.5" />
                        پاک کردن فیلترها
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">نام بیمار</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={patientSearch}
                                onChange={(e) => {
                                    setPatientSearch(e.target.value);
                                }}
                                placeholder="جستجوی نام..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">شماره موبایل بیمار</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={patientPhone}
                                onChange={(e) => {
                                    setPatientPhone(e.target.value);
                                }}
                                placeholder="09..."
                                dir="ltr"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-right text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">پزشک</label>
                        <select
                            value={doctorId}
                            onChange={(e) => {
                                setDoctorId(e.target.value);
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه پزشکان</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={String(d.id)}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">استان</label>
                        <select
                            value={province}
                            onChange={(e) => {
                                setProvince(e.target.value);
                                setCity('all');
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه استان‌ها</option>
                            {iranProvinces.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">شهر</label>
                        <select
                            value={city}
                            onChange={(e) => {
                                setCity(e.target.value);
                            }}
                            disabled={province === 'all'}
                            className={`${selectClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
                        >
                            <option value="all">همه شهرها</option>
                            {cities.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">وضعیت</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as AppointmentStatus | 'all');
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {Object.entries(appointmentStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                            <th className="w-14 px-4 py-3 font-medium">ردیف</th>
                            <th className="px-4 py-3 font-medium">بیمار</th>
                            <th className="w-36 px-4 py-3 font-medium">موبایل</th>
                            <th className="px-4 py-3 font-medium">پزشک</th>
                            <th className="px-4 py-3 font-medium">تاریخ / زمان</th>
                            <th className="w-32 px-4 py-3 font-medium">وضعیت</th>
                            <th className="w-28 px-4 py-3 font-medium">عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center">
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
                                </td>
                            </tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                    نوبتی یافت نشد
                                </td>
                            </tr>
                        ) : (
                            appointments.map((row, index) => {
                                const rowNumber = pagination.from + index;
                                const isMenuOpen = openMenuId === row.id;
                                const isRowLoading = actionLoadingId === row.id;

                                return (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                                    >
                                        <td className="px-4 py-3 text-slate-500">{rowNumber}</td>
                                        <td className="px-4 py-3">
                                                <span className="font-medium text-slate-800">
                                                    {row.patientName}
                                                </span>
                                            <span className="mt-0.5 block text-xs text-slate-400">
                                                    {row.province} — {row.city}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600" dir="ltr">
                                            <span className="block text-right">{row.patientPhone}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span className="font-medium text-slate-800">
                                                    {row.doctorName}
                                                </span>
                                            {row.doctorSpecialty && (
                                                <span className="mt-0.5 block text-xs text-slate-400">
                                                        {row.doctorSpecialty}
                                                    </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarClock className="h-4 w-4 shrink-0 text-slate-400" />
                                                    {formatDateTime(row.scheduledAt)}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex w-24 justify-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${appointmentStatusStyles[row.status]}`}
                                                >
                                                    {appointmentStatusLabels[row.status]}
                                                </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    title="مشاهده جزئیات"
                                                    disabled={isRowLoading}
                                                    onClick={() => setDetailsRow(row)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        title="عملیات بیشتر"
                                                        disabled={isRowLoading}
                                                        onClick={() =>
                                                            setOpenMenuId(isMenuOpen ? null : row.id)
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                                                    >
                                                        {isRowLoading ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <MoreVertical className="h-5 w-5" />
                                                        )}
                                                    </button>

                                                    {isMenuOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-10"
                                                                onClick={() => setOpenMenuId(null)}
                                                            />
                                                            <div className="absolute left-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                                                                <p className="px-4 py-2 text-xs text-slate-400">
                                                                    تغییر وضعیت
                                                                </p>
                                                                {(
                                                                    [
                                                                        {
                                                                            status: 'booked' as const,
                                                                            label: 'رزرو شده',
                                                                            icon: CalendarCheck,
                                                                        },
                                                                        {
                                                                            status: 'done' as const,
                                                                            label: 'انجام شده',
                                                                            icon: CheckCircle2,
                                                                        },
                                                                        {
                                                                            status: 'no-show' as const,
                                                                            label: 'عدم حضور',
                                                                            icon: UserX,
                                                                        },
                                                                    ] as const
                                                                ).map((item) => (
                                                                    <button
                                                                        key={item.status}
                                                                        type="button"
                                                                        disabled={row.status === item.status}
                                                                        onClick={() =>
                                                                            updateStatus(row.id, item.status)
                                                                        }
                                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                                                                    >
                                                                        <item.icon className="h-4 w-4" />
                                                                        {item.label}
                                                                    </button>
                                                                ))}
                                                                {row.status !== 'canceled' && (
                                                                    <>
                                                                        <div className="my-1 border-t border-slate-100" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setOpenMenuId(null);
                                                                                setCancelRow(row);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                                                                        >
                                                                            <Ban className="h-4 w-4" />
                                                                            لغو با دلیل
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                    <span>
                        نمایش {appointments.length} از {pagination.total} نوبت
                        {pagination.from > 0 && ` (${pagination.from} تا ${pagination.to})`}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition ${
                                    p === page
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={page >= pagination.last_page}
                            onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {detailsRow && (
                <AppointmentDetailsModal
                    appointment={detailsRow}
                    onClose={() => setDetailsRow(null)}
                />
            )}

            {cancelRow && (
                <CancelAppointmentModal
                    appointment={cancelRow}
                    onClose={() => setCancelRow(null)}
                    onConfirm={(reason) => cancelAppointment(cancelRow.id, reason)}
                />
            )}
        </div>
    );
}
