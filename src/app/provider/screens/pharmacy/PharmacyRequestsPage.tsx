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
    Timeline,
} from '../../components';
import { mockPharmacyRequests } from '../../data/mockData';
import {
    pharmacyStatusLabels,
    pharmacyStatusStyles,
    type PharmacyRequestStatus,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

const statusOptions = [
    { value: 'all', label: 'همه' },
    ...Object.entries(pharmacyStatusLabels).map(([value, label]) => ({ value, label })),
];

export function PharmacyRequestsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [delivery, setDelivery] = useState('all');

    const filtered = useMemo(() => {
        return mockPharmacyRequests.filter((r) => {
            if (status !== 'all' && r.status !== status) return false;
            if (delivery !== 'all' && r.deliveryType !== delivery) return false;
            const q = search.trim();
            if (!q) return true;
            return r.patientName.includes(q) || r.code.includes(q);
        });
    }, [search, status, delivery]);

    return (
        <div className="space-y-6">
            <PageHeader title="درخواست‌های نسخه" />

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجو..." />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
                <FilterSelect
                    label="تحویل"
                    value={delivery}
                    onChange={setDelivery}
                    options={[
                        { value: 'all', label: 'همه' },
                        { value: 'pickup', label: 'حضوری' },
                        { value: 'delivery', label: 'ارسال' },
                    ]}
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState message="نسخه‌ای یافت نشد." />
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">مبلغ</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">تحویل</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمه</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                                    <td className="px-4 py-3">
                                        <p>{r.patientName}</p>
                                        <p className="text-xs text-slate-400">{r.patientPhone}</p>
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(r.totalPrice)}</td>
                                    <td className="px-4 py-3">{r.deliveryType === 'delivery' ? 'ارسال' : 'حضوری'}</td>
                                    <td className="px-4 py-3">{r.insurance ? 'بله' : 'خیر'}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            label={pharmacyStatusLabels[r.status]}
                                            className={pharmacyStatusStyles[r.status]}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={providerPath('pharmacy', `requests/${r.id}`)}
                                            className="inline-flex items-center gap-1 text-teal-600 hover:underline"
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

export function PharmacyRequestDetailPage({ requestId }: { requestId: number }) {
    const request = mockPharmacyRequests.find((r) => r.id === requestId);
    if (!request) return <EmptyState message="درخواست یافت نشد." />;

    const actions: Partial<Record<PharmacyRequestStatus, string[]>> = {
        new: ['بررسی نسخه', 'تماس با بیمار'],
        reviewing: ['تأیید قیمت', 'اعلام ناموجود'],
        preparing: ['ثبت آماده', 'ثبت ارسال'],
        ready: ['تحویل به بیمار', 'تحویل به پیک'],
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title={request.code}
                actions={
                    <Link to={providerPath('pharmacy', 'requests')} className="text-sm text-slate-500">
                        بازگشت
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card title="بیمار">
                        <Row label="نام" value={request.patientName} />
                        <Row label="موبایل" value={request.patientPhone} />
                    </Card>
                    <Card title="داروها">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-slate-500">
                                    <th className="pb-2 text-right">نام</th>
                                    <th className="pb-2 text-right">دوز</th>
                                    <th className="pb-2 text-right">تعداد</th>
                                    <th className="pb-2 text-right">موجودی</th>
                                    <th className="pb-2 text-right">قیمت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request.items.map((item, i) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="py-2">{item.name}</td>
                                        <td className="py-2">{item.dose}</td>
                                        <td className="py-2">{item.qty}</td>
                                        <td className="py-2">
                                            <span className={item.available ? 'text-emerald-600' : 'text-red-600'}>
                                                {item.available ? 'موجود' : 'ناموجود'}
                                            </span>
                                        </td>
                                        <td className="py-2">{formatPrice(item.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                    {request.address && (
                        <Card title="آدرس تحویل">
                            <p className="text-sm text-slate-600">{request.address}</p>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <StatusBadge
                            label={pharmacyStatusLabels[request.status]}
                            className={pharmacyStatusStyles[request.status]}
                        />
                        <p className="mt-3 text-sm">جمع: {formatPrice(request.totalPrice)}</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {(actions[request.status] ?? ['لغو']).map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    className="rounded-xl border border-slate-200 py-2 text-sm hover:bg-teal-50"
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-2 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
