import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
    formatPrice,
} from '../../components';
import { mockLabRequests } from '../../data/mockData';
import {
    labStatusLabels,
    labStatusStyles,
    type LabRequestStatus,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const statusFilterOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(labStatusLabels).map(([value, label]) => ({ value, label })),
];

export function LabRequestsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [type, setType] = useState<string>('all');

    const filtered = useMemo(() => {
        return mockLabRequests.filter((r) => {
            if (status !== 'all' && r.status !== status) return false;
            if (type !== 'all' && r.type !== type) return false;
            const q = search.trim();
            if (!q) return true;
            return (
                r.patientName.includes(q) ||
                r.nationalCode.includes(q) ||
                r.code.includes(q)
            );
        });
    }, [search, status, type]);

    return (
        <div className="space-y-6">
            <PageHeader title="درخواست‌های آزمایش" description="لیست، فیلتر و مدیریت درخواست‌ها" />

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="نام، کد ملی، شماره درخواست..." />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusFilterOptions} />
                <FilterSelect
                    label="نوع"
                    value={type}
                    onChange={setType}
                    options={[
                        { value: 'all', label: 'همه' },
                        { value: 'in_person', label: 'حضوری' },
                        { value: 'home', label: 'در منزل' },
                    ]}
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState message="درخواستی یافت نشد." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold">کد</th>
                                <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold">آزمایش‌ها</th>
                                <th className="px-4 py-3 text-right font-semibold">زمان</th>
                                <th className="px-4 py-3 text-right font-semibold">مبلغ</th>
                                <th className="px-4 py-3 text-right font-semibold">نوع</th>
                                <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                                <th className="px-4 py-3 text-right font-semibold" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                                    <td className="px-4 py-3">
                                        <p>{r.patientName}</p>
                                        <p className="text-xs text-slate-400">{r.patientPhone}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{r.tests.map((t) => t.name).join('، ')}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{r.scheduledAt}</td>
                                    <td className="px-4 py-3">{formatPrice(r.totalPrice)}</td>
                                    <td className="px-4 py-3">{r.type === 'home' ? 'در منزل' : 'حضوری'}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            label={labStatusLabels[r.status]}
                                            className={labStatusStyles[r.status]}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={providerPath('lab', `requests/${r.id}`)}
                                            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800"
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

export function LabRequestDetailPage({ requestId }: { requestId: number }) {
    const request = mockLabRequests.find((r) => r.id === requestId);

    if (!request) {
        return <EmptyState message="درخواست یافت نشد." />;
    }

    const nextActions: Partial<Record<LabRequestStatus, string[]>> = {
        new: ['تأیید', 'رد', 'تماس با بیمار'],
        confirmed: ['ثبت نمونه‌گیری', 'تغییر زمان', 'لغو'],
        sampled: ['شروع آزمایش'],
        testing: ['آپلود نتیجه'],
        ready: ['ارسال به بیمار'],
    };

    const actions = nextActions[request.status] ?? ['لغو'];

    return (
        <div className="space-y-6">
            <PageHeader
                title={`درخواست ${request.code}`}
                actions={
                    <Link to={providerPath('lab', 'requests')} className="text-sm text-slate-500 hover:text-slate-700">
                        بازگشت به لیست
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Section title="اطلاعات بیمار">
                        <InfoRow label="نام" value={request.patientName} />
                        <InfoRow label="موبایل" value={request.patientPhone} />
                        <InfoRow label="کد ملی" value={request.nationalCode} />
                        {request.insuranceNumber && (
                            <InfoRow label="بیمه" value={request.insuranceNumber} />
                        )}
                    </Section>

                    <Section title="نسخه">
                        <InfoRow
                            label="نوع"
                            value={request.prescriptionType === 'digital' ? 'کد دیجیتال' : 'عکس نسخه'}
                        />
                        {request.prescriptionCode && (
                            <InfoRow label="کد" value={request.prescriptionCode} />
                        )}
                    </Section>

                    <Section title="آزمایش‌ها">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-500">
                                    <th className="pb-2 text-right font-medium">نام</th>
                                    <th className="pb-2 text-right font-medium">قیمت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request.tests.map((t, i) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="py-2">{t.name}</td>
                                        <td className="py-2">{formatPrice(t.price)}</td>
                                    </tr>
                                ))}
                                <tr className="border-t border-slate-200 font-semibold">
                                    <td className="py-2">جمع</td>
                                    <td className="py-2">{formatPrice(request.totalPrice)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>

                    {request.address && (
                        <Section title="آدرس">
                            <p className="text-sm text-slate-600">{request.address}</p>
                        </Section>
                    )}

                    {request.note && (
                        <Section title="یادداشت بیمار">
                            <p className="text-sm text-slate-600">{request.note}</p>
                        </Section>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <StatusBadge
                            label={labStatusLabels[request.status]}
                            className={labStatusStyles[request.status]}
                        />
                        <p className="mt-3 text-sm text-slate-500">زمان: {request.scheduledAt}</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {actions.map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:border-amber-200"
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-sm font-semibold text-slate-700">تاریخچه</p>
                        <ol className="space-y-3">
                            {request.timeline.map((e, i) => (
                                <li key={i} className="text-sm">
                                    <p className="font-medium text-slate-700">{e.label}</p>
                                    <p className="text-xs text-slate-400">{e.at}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
            {children}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 border-b border-slate-50 py-2 text-sm last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800">{value}</span>
        </div>
    );
}
