import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowDownUp, Eye, Loader2 } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
    Timeline,
    formatPrice,
} from '../../components';
import { ProviderPagination } from '../../components/ProviderPagination';
import { useNurseStore } from '../../store/nurseStore';
import { fetchNurseRequests } from '../../services/nurseApi';
import {
    nurseStatusLabels,
    nurseStatusStyles,
    type NurseRequestStatus,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import { nurseServiceLabels } from '../../data/mockData';
import type { NurseRequest } from '../../data/mockData';

const PAGE_SIZE = 8;

const statusOptions = [
    { value: 'all', label: 'همه' },
    ...Object.entries(nurseStatusLabels).map(([value, label]) => ({ value, label })),
];

const serviceOptions = [
    { value: 'all', label: 'همه خدمات' },
    ...Object.entries(nurseServiceLabels).map(([value, label]) => ({ value, label })),
];

export function NurseRequestsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [serviceType, setServiceType] = useState('all');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{
        items: NurseRequest[];
        total: number;
        totalPages: number;
    }>({ items: [], total: 0, totalPages: 1 });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchNurseRequests({
                page,
                pageSize: PAGE_SIZE,
                sortOrder,
                search,
                status: status as NurseRequestStatus | 'all',
                serviceType,
                patientName,
                patientPhone,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            });
            setResult({ items: res.items, total: res.total, totalPages: res.totalPages });
        } finally {
            setLoading(false);
        }
    }, [page, sortOrder, search, status, serviceType, patientName, patientPhone, dateFrom, dateTo]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [search, status, serviceType, patientName, patientPhone, dateFrom, dateTo, sortOrder]);

    const toggleSort = () => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));

    return (
        <div className="space-y-6">
            <PageHeader
                title="لیست درخواست‌ها"
                description="تمام درخواست‌های پرستاری با فیلتر و صفحه‌بندی"
            />

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجوی سریع..." />
                <FilterSelect label="نوع خدمت" value={serviceType} onChange={setServiceType} options={serviceOptions} />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">نام بیمار</label>
                    <input
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="نام بیمار..."
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">موبایل بیمار</label>
                    <input
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="09..."
                        dir="ltr"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dir-ltr text-left"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">از تاریخ (شمسی)</label>
                    <input
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="1404/03/01"
                        dir="ltr"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dir-ltr text-left"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">تا تاریخ (شمسی)</label>
                    <input
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="1404/03/31"
                        dir="ltr"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dir-ltr text-left"
                    />
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <button
                        type="button"
                        onClick={toggleSort}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowDownUp className="h-4 w-4" />
                        مرتب‌سازی: {sortOrder === 'desc' ? 'جدیدترین' : 'قدیمی‌ترین'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : result.items.length === 0 ? (
                <EmptyState message="درخواستی یافت نشد." />
            ) : (
                <>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">موبایل</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">خدمت</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">ساعت</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">مبلغ</th>
                                    <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {result.items.map((r) => (
                                    <tr key={r.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                                        <td className="px-4 py-3">{r.patientName}</td>
                                        <td className="px-4 py-3 dir-ltr text-left text-xs">{r.patientPhone}</td>
                                        <td className="px-4 py-3">{r.serviceType}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{r.scheduledDate}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">{r.scheduledTime}</td>
                                        <td className="px-4 py-3">{formatPrice(r.amount)}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                label={nurseStatusLabels[r.status]}
                                                className={nurseStatusStyles[r.status]}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                to={providerPath('nurse', `requests/${r.id}`)}
                                                className="inline-flex items-center gap-1 text-rose-600 hover:underline"
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
                    <ProviderPagination
                        page={page}
                        totalPages={result.totalPages}
                        total={result.total}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}

export function NurseRequestDetailPage({ requestId }: { requestId: number }) {
    const request = useNurseStore((s) => s.requests.find((r) => r.id === requestId));
    const [report, setReport] = useState({
        duration: '۴۵',
        services: '',
        condition: '',
        advice: '',
        followUp: false,
    });

    if (!request) return <EmptyState message="درخواست یافت نشد." />;

    const actions: Partial<Record<NurseRequestStatus, string[]>> = {
        new: ['پذیرش', 'رد'],
        accepted: ['در راه هستم'],
        on_way: ['شروع خدمت'],
        in_progress: ['تکمیل + ثبت گزارش'],
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={request.code}
                actions={
                    <Link to={providerPath('nurse', 'requests')} className="text-sm text-slate-500">
                        بازگشت
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <Row label="بیمار" value={request.patientName} />
                        <Row label="موبایل" value={request.patientPhone} />
                        <Row label="خدمت" value={request.serviceType} />
                        <Row label="تاریخ" value={request.scheduledDate} />
                        <Row label="ساعت" value={request.scheduledTime} />
                        <Row label="مبلغ" value={`${formatPrice(request.amount)} تومان`} />
                        {request.note && <Row label="توضیحات" value={request.note} />}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">آدرس</p>
                        <p className="text-sm text-slate-600">{request.address}</p>
                        <div className="mt-4 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-rose-200 bg-rose-50/30 text-xs text-slate-500">
                            نقشه (نمایشی)
                        </div>
                    </div>

                    {request.status === 'in_progress' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="mb-4 text-sm font-semibold text-slate-700">گزارش ویزیت</p>
                            <div className="grid gap-3 md:grid-cols-2">
                                <input
                                    placeholder="مدت (دقیقه)"
                                    value={report.duration}
                                    onChange={(e) => setReport({ ...report, duration: e.target.value })}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={report.followUp}
                                        onChange={(e) => setReport({ ...report, followUp: e.target.checked })}
                                    />
                                    نیاز به ویزیت مجدد
                                </label>
                                <textarea
                                    placeholder="خدمات انجام‌شده"
                                    value={report.services}
                                    onChange={(e) => setReport({ ...report, services: e.target.value })}
                                    className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    rows={2}
                                />
                                <textarea
                                    placeholder="وضعیت بیمار"
                                    value={report.condition}
                                    onChange={(e) => setReport({ ...report, condition: e.target.value })}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    rows={2}
                                />
                                <textarea
                                    placeholder="توصیه‌ها"
                                    value={report.advice}
                                    onChange={(e) => setReport({ ...report, advice: e.target.value })}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    rows={2}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <StatusBadge
                            label={nurseStatusLabels[request.status]}
                            className={nurseStatusStyles[request.status]}
                        />
                        <div className="mt-4 flex flex-col gap-2">
                            {(actions[request.status] ?? []).map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    className="rounded-xl border border-slate-200 py-2 text-sm hover:bg-rose-50"
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-sm font-semibold">تاریخچه</p>
                        <Timeline entries={request.timeline} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 border-b border-slate-50 py-2 text-sm last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800">{value}</span>
        </div>
    );
}
