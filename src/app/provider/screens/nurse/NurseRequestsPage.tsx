import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye, MapPin } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
    Timeline,
    formatPrice,
} from '../../components';
import { mockNurseRequests } from '../../data/mockData';
import {
    nurseStatusLabels,
    nurseStatusStyles,
    type NurseRequestStatus,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const statusOptions = [
    { value: 'all', label: 'همه' },
    ...Object.entries(nurseStatusLabels).map(([value, label]) => ({ value, label })),
];

export function NurseRequestsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const filtered = useMemo(() => {
        return mockNurseRequests.filter((r) => {
            if (status !== 'all' && r.status !== status) return false;
            const q = search.trim();
            if (!q) return true;
            return r.patientName.includes(q) || r.code.includes(q) || r.serviceType.includes(q);
        });
    }, [search, status]);

    return (
        <div className="space-y-6">
            <PageHeader title="درخواست‌های پرستاری" />

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجو..." />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
            </div>

            {filtered.length === 0 ? (
                <EmptyState message="درخواستی یافت نشد." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">خدمت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">زمان</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">مبلغ</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                                    <td className="px-4 py-3">{r.patientName}</td>
                                    <td className="px-4 py-3">{r.serviceType}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{r.scheduledAt}</td>
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
            )}
        </div>
    );
}

export function NurseRequestDetailPage({ requestId }: { requestId: number }) {
    const request = mockNurseRequests.find((r) => r.id === requestId);
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
                        <Row label="زمان" value={request.scheduledAt} />
                        <Row label="مبلغ" value={`${formatPrice(request.amount)} تومان`} />
                        {request.note && <Row label="توضیحات" value={request.note} />}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <MapPin className="h-4 w-4 text-rose-500" />
                            آدرس
                        </p>
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
