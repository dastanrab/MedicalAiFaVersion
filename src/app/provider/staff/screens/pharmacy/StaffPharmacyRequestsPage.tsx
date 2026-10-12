import { useMemo, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import {
    EmptyState,
    FilterSelect,
    PageHeader,
    ProviderModal,
    SearchInput,
    StatusBadge,
    formatFaNumber,
} from '../../../components';
import {
    pharmacyStatusLabels,
    pharmacyStatusStyles,
} from '../../../config/statusOptions';
import { showProviderSuccess } from '../../../utils/toast';
import { useStaffCan } from '../../components/StaffGates';
import { ConfirmModal, DetailRow } from '../../components/StaffUi';
import { deliveryTypeLabels } from '../../config/staffStatusOptions';
import type { StaffPharmacyRequest, StaffPharmacyStatus } from '../../data/mockStaffData';
import { useStaffDataStore } from '../../store/staffDataStore';
import { useStaffActivityLogger } from '../../store/staffStore';

const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(pharmacyStatusLabels).map(([value, label]) => ({ value, label })),
];

const nextStep: Partial<Record<StaffPharmacyStatus, { to: StaffPharmacyStatus; label: string }>> = {
    new: { to: 'reviewing', label: 'شروع بررسی' },
    reviewing: { to: 'preparing', label: 'آماده‌سازی' },
    preparing: { to: 'ready', label: 'آماده تحویل' },
};

export function StaffPharmacyRequestsPage() {
    const can = useStaffCan('pharmacy');
    const log = useStaffActivityLogger('pharmacy');
    const requests = useStaffDataStore((s) => s.pharmacyRequests);
    const updatePharmacyRequest = useStaffDataStore((s) => s.updatePharmacyRequest);

    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [cancelId, setCancelId] = useState<number | null>(null);

    const list = useMemo(() => {
        const q = search.trim();
        return requests
            .filter((r) => {
                if (status !== 'all' && r.status !== status) return false;
                if (q && !r.patientName.includes(q) && !r.patientPhone.includes(q) && !r.code.includes(q)) return false;
                return true;
            })
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }, [requests, status, search]);

    const selected = requests.find((r) => r.id === selectedId) ?? null;
    const toCancel = requests.find((r) => r.id === cancelId) ?? null;

    const setRequestStatus = (r: StaffPharmacyRequest, to: StaffPharmacyStatus, action: string) => {
        updatePharmacyRequest(r.id, { status: to });
        log(action, `${r.code} — ${r.patientName}`);
        showProviderSuccess(`وضعیت به «${pharmacyStatusLabels[to]}» تغییر کرد`);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="درخواست‌های نسخه" description="بررسی و آماده‌سازی نسخه‌های دریافتی" />

            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="کد، نام یا موبایل..." />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
            </div>

            {list.length === 0 ? (
                <EmptyState message="درخواستی یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">اقلام</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">تحویل</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((r) => {
                                const step = nextStep[r.status];
                                return (
                                    <tr key={r.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.code}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{r.patientName}</p>
                                            <p className="text-xs text-slate-400">{r.createdAt}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{formatFaNumber(r.drugs.length)} قلم</td>
                                        <td className="px-4 py-3 text-slate-600">{deliveryTypeLabels[r.deliveryType]}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge label={pharmacyStatusLabels[r.status]} className={pharmacyStatusStyles[r.status]} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedId(r.id)}
                                                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                                                >
                                                    جزئیات
                                                </button>
                                                {can('pharmacy.requests.status') && step && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRequestStatus(r, step.to, step.label)}
                                                        className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-100"
                                                    >
                                                        {step.label}
                                                    </button>
                                                )}
                                                {can('pharmacy.requests.status') && r.status === 'ready' && r.deliveryType === 'pickup' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setRequestStatus(r, 'delivered', 'تحویل حضوری نسخه')}
                                                        className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                                                    >
                                                        تحویل شد
                                                    </button>
                                                )}
                                                {can('pharmacy.requests.status') && (r.status === 'new' || r.status === 'reviewing') && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setCancelId(r.id)}
                                                        className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                                                    >
                                                        لغو
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {selected && (
                <ProviderModal open onClose={() => setSelectedId(null)} title={`نسخه ${selected.code}`}>
                    <dl className="space-y-3 text-sm">
                        <DetailRow label="بیمار" value={selected.patientName} />
                        <DetailRow
                            label="موبایل"
                            value={
                                <span className="flex items-center gap-1" dir="ltr">
                                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                                    {selected.patientPhone}
                                </span>
                            }
                        />
                        <DetailRow label="کد رهگیری نسخه" value={selected.prescriptionCode} />
                        <DetailRow label="نوع تحویل" value={deliveryTypeLabels[selected.deliveryType]} />
                        {selected.address && (
                            <DetailRow
                                label="آدرس"
                                value={
                                    <span className="flex items-start gap-1">
                                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                        {selected.address}
                                    </span>
                                }
                            />
                        )}
                    </dl>
                    <div className="mt-4 rounded-xl border border-slate-200">
                        <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">اقلام نسخه</p>
                        <ul className="divide-y divide-slate-100 text-sm">
                            {selected.drugs.map((d) => (
                                <li key={d.name} className="flex justify-between px-4 py-2">
                                    <span>{d.name}</span>
                                    <span className="text-slate-500">{formatFaNumber(d.qty)} عدد</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </ProviderModal>
            )}

            {toCancel && (
                <ConfirmModal
                    title="لغو نسخه"
                    description={`درخواست ${toCancel.code} (${toCancel.patientName}) لغو شود؟`}
                    note="پس از لغو، بیمار از طریق پیامک مطلع می‌شود."
                    confirmLabel="لغو درخواست"
                    onClose={() => setCancelId(null)}
                    onConfirm={() => {
                        setRequestStatus(toCancel, 'canceled', 'لغو درخواست نسخه');
                        setCancelId(null);
                    }}
                />
            )}
        </div>
    );
}
