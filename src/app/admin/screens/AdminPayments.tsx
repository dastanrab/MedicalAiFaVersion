import { useState, useMemo } from 'react';
import {
    CreditCard,
    Search,
    Filter,
    Eye,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    RefreshCw,
    FileSpreadsheet,
    RotateCcw,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import { iranProvinces, iranCitiesByProvince } from '../../data/iranLocations';
import {
    paymentStatusLabels,
    paymentStatusStyles,
    paymentMethodLabels,
    paymentServiceLabels,
    paymentServiceStyles,
    type AdminPaymentRow,
    type PaymentStatus,
    type PaymentMethod,
    type PaymentServiceType,
} from '../config/paymentOptions';
import { samplePayments } from '../data/samplePayments';
import { PaymentDetailsModal } from '../components/PaymentDetailsModal';

const PAGE_SIZE = 8;

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

function formatAmount(amount: number) {
    return amount.toLocaleString('fa-IR');
}

function downloadPaymentsExcel(rows: AdminPaymentRow[]) {
    const header = [
        'ردیف',
        'کد پیگیری',
        'پرداخت‌کننده',
        'موبایل',
        'مبلغ (تومان)',
        'نوع خدمت',
        'روش پرداخت',
        'وضعیت',
        'پزشک',
        'شناسه نوبت',
        'استان',
        'شهر',
        'تاریخ پرداخت',
        'مرجع درگاه',
        'توضیحات',
    ];

    const body = rows
        .map(
            (r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r.trackingCode}</td>
            <td>${r.patientName}</td>
            <td>${r.patientPhone}</td>
            <td>${r.amount}</td>
            <td>${paymentServiceLabels[r.serviceType]}</td>
            <td>${paymentMethodLabels[r.method]}</td>
            <td>${paymentStatusLabels[r.status]}</td>
            <td>${r.doctorName ?? ''}</td>
            <td>${r.appointmentId ?? ''}</td>
            <td>${r.province}</td>
            <td>${r.city}</td>
            <td>${formatDateTime(r.paidAt)}</td>
            <td>${r.gatewayRef ?? ''}</td>
            <td>${r.description ?? ''}</td>
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
    link.download = `payments-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
}

export function AdminPayments() {
    const [payments, setPayments] = useState<AdminPaymentRow[]>(samplePayments);
    const [loading, setLoading] = useState(false);

    const [patientSearch, setPatientSearch] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [trackingCode, setTrackingCode] = useState('');
    const [status, setStatus] = useState<PaymentStatus | 'all'>('all');
    const [method, setMethod] = useState<PaymentMethod | 'all'>('all');
    const [serviceType, setServiceType] = useState<PaymentServiceType | 'all'>('all');
    const [province, setProvince] = useState('all');
    const [city, setCity] = useState('all');

    const [page, setPage] = useState(1);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [detailsRow, setDetailsRow] = useState<AdminPaymentRow | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const cities = province === 'all' ? [] : iranCitiesByProvince[province] ?? [];

    const filtered = useMemo(() => {
        return payments.filter((row) => {
            const q = patientSearch.trim().toLowerCase();
            const matchesPatient = !q || row.patientName.toLowerCase().includes(q);
            const matchesPhone =
                !patientPhone.trim() || row.patientPhone.includes(patientPhone.trim());
            const matchesTracking =
                !trackingCode.trim() ||
                row.trackingCode.toLowerCase().includes(trackingCode.trim().toLowerCase());
            const matchesStatus = status === 'all' || row.status === status;
            const matchesMethod = method === 'all' || row.method === method;
            const matchesService = serviceType === 'all' || row.serviceType === serviceType;
            const matchesProvince = province === 'all' || row.province === province;
            const matchesCity = city === 'all' || row.city === city;
            return (
                matchesPatient &&
                matchesPhone &&
                matchesTracking &&
                matchesStatus &&
                matchesMethod &&
                matchesService &&
                matchesProvince &&
                matchesCity
            );
        });
    }, [
        payments,
        patientSearch,
        patientPhone,
        trackingCode,
        status,
        method,
        serviceType,
        province,
        city,
    ]);

    const summary = useMemo(() => {
        const successRows = filtered.filter((p) => p.status === 'success');
        const totalAmount = successRows.reduce((sum, p) => sum + p.amount, 0);
        return {
            total: filtered.length,
            success: successRows.length,
            pending: filtered.filter((p) => p.status === 'pending').length,
            totalAmount,
        };
    }, [filtered]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const resetPage = () => setPage(1);

    const resetFilters = () => {
        setPatientSearch('');
        setPatientPhone('');
        setTrackingCode('');
        setStatus('all');
        setMethod('all');
        setServiceType('all');
        setProvince('all');
        setCity('all');
        resetPage();
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setPayments([...samplePayments]);
            setLoading(false);
        }, 400);
    };

    const updateStatus = (id: number, newStatus: PaymentStatus) => {
        setActionLoadingId(id);
        setPayments((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        setOpenMenuId(null);
        setActionLoadingId(null);
    };

    const selectClass =
        'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">پرداخت‌ها</h2>
                        <p className="text-sm text-slate-500">
                            مشاهده و مدیریت تراکنش‌های مالی سامانه
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => downloadPaymentsExcel(filtered)}
                        disabled={filtered.length === 0}
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

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs text-slate-500">کل تراکنش‌ها</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{summary.total}</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                    <p className="text-xs text-emerald-700">موفق</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-800">{summary.success}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                    <p className="text-xs text-amber-700">در انتظار</p>
                    <p className="mt-1 text-lg font-semibold text-amber-800">{summary.pending}</p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                    <p className="text-xs text-indigo-700">جمع پرداخت موفق</p>
                    <p className="mt-1 text-sm font-semibold text-indigo-800">
                        {formatAmount(summary.totalAmount)} تومان
                    </p>
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
                        <label className="mb-1.5 block text-xs text-slate-500">نام پرداخت‌کننده</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={patientSearch}
                                onChange={(e) => {
                                    setPatientSearch(e.target.value);
                                    resetPage();
                                }}
                                placeholder="جستجوی نام..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">شماره موبایل</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={patientPhone}
                                onChange={(e) => {
                                    setPatientPhone(e.target.value);
                                    resetPage();
                                }}
                                placeholder="09..."
                                dir="ltr"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-right text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">کد پیگیری</label>
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={trackingCode}
                                onChange={(e) => {
                                    setTrackingCode(e.target.value);
                                    resetPage();
                                }}
                                placeholder="TRX-..."
                                dir="ltr"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-9 pl-3 text-right text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">نوع خدمت</label>
                        <select
                            value={serviceType}
                            onChange={(e) => {
                                setServiceType(e.target.value as PaymentServiceType | 'all');
                                resetPage();
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {Object.entries(paymentServiceLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">روش پرداخت</label>
                        <select
                            value={method}
                            onChange={(e) => {
                                setMethod(e.target.value as PaymentMethod | 'all');
                                resetPage();
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">وضعیت</label>
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value as PaymentStatus | 'all');
                                resetPage();
                            }}
                            className={selectClass}
                        >
                            <option value="all">همه</option>
                            {Object.entries(paymentStatusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
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
                                resetPage();
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
                                resetPage();
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
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                                <th className="w-14 px-4 py-3 font-medium">ردیف</th>
                                <th className="px-4 py-3 font-medium">کد پیگیری</th>
                                <th className="px-4 py-3 font-medium">پرداخت‌کننده</th>
                                <th className="w-28 px-4 py-3 font-medium">مبلغ</th>
                                <th className="w-32 px-4 py-3 font-medium">نوع خدمت</th>
                                <th className="px-4 py-3 font-medium">تاریخ</th>
                                <th className="w-28 px-4 py-3 font-medium">وضعیت</th>
                                <th className="w-28 px-4 py-3 font-medium">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
                                    </td>
                                </tr>
                            ) : paged.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                                        تراکنشی یافت نشد
                                    </td>
                                </tr>
                            ) : (
                                paged.map((row, index) => {
                                    const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                                    const isMenuOpen = openMenuId === row.id;
                                    const isRowLoading = actionLoadingId === row.id;

                                    return (
                                        <tr
                                            key={row.id}
                                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                                        >
                                            <td className="px-4 py-3 text-slate-500">{rowNumber}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="font-mono text-xs text-slate-600"
                                                    dir="ltr"
                                                >
                                                    {row.trackingCode}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-slate-800">
                                                    {row.patientName}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-slate-400" dir="ltr">
                                                    <span className="text-right">{row.patientPhone}</span>
                                                </span>
                                                <span className="mt-0.5 block text-xs text-slate-400">
                                                    {paymentMethodLabels[row.method]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {formatAmount(row.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-lg px-2 py-1 text-xs font-medium ${paymentServiceStyles[row.serviceType]}`}
                                                >
                                                    {paymentServiceLabels[row.serviceType]}
                                                </span>
                                                {row.doctorName && (
                                                    <span className="mt-1 block text-xs text-slate-400">
                                                        {row.doctorName}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                {formatDateTime(row.paidAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex w-24 justify-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${paymentStatusStyles[row.status]}`}
                                                >
                                                    {paymentStatusLabels[row.status]}
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
                                                                        تغییر وضعیت (نمونه)
                                                                    </p>
                                                                    {row.status === 'pending' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateStatus(row.id, 'success')
                                                                            }
                                                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-emerald-700 transition hover:bg-emerald-50"
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4" />
                                                                            تایید پرداخت
                                                                        </button>
                                                                    )}
                                                                    {row.status === 'success' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateStatus(row.id, 'refunded')
                                                                            }
                                                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                                                                        >
                                                                            <RotateCcw className="h-4 w-4" />
                                                                            ثبت استرداد
                                                                        </button>
                                                                    )}
                                                                    {row.status === 'failed' && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateStatus(row.id, 'pending')
                                                                            }
                                                                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-amber-700 transition hover:bg-amber-50"
                                                                        >
                                                                            <Clock className="h-4 w-4" />
                                                                            بازگشت به انتظار
                                                                        </button>
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
                        نمایش {paged.length} از {filtered.length} تراکنش
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            disabled={currentPage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs transition ${
                                    p === currentPage
                                        ? 'bg-indigo-600 text-white'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={currentPage >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {detailsRow && (
                <PaymentDetailsModal payment={detailsRow} onClose={() => setDetailsRow(null)} />
            )}
        </div>
    );
}
