import { useMemo, useState } from 'react';
import { Home, MapPin, Phone } from 'lucide-react';
import {
    EmptyState,
    FilterSelect,
    PageHeader,
    ProviderModal,
    SearchInput,
    StatusBadge,
} from '../../../components';
import { showProviderSuccess } from '../../../utils/toast';
import { useStaffCan } from '../../components/StaffGates';
import { ConfirmModal, DetailRow } from '../../components/StaffUi';
import {
    labVisitTypeLabels,
    staffLabNextStep,
    staffLabStatusLabels,
    staffLabStatusStyles,
} from '../../config/staffStatusOptions';
import type { StaffLabRequest } from '../../data/mockStaffData';
import { useStaffDataStore } from '../../store/staffDataStore';
import { useStaffActivityLogger } from '../../store/staffStore';

const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(staffLabStatusLabels).map(([value, label]) => ({ value, label })),
];

const typeOptions = [
    { value: 'all', label: 'همه' },
    { value: 'in_person', label: labVisitTypeLabels.in_person },
    { value: 'home', label: labVisitTypeLabels.home },
];

export function StaffLabRequestsPage() {
    const can = useStaffCan('lab');
    const log = useStaffActivityLogger('lab');
    const requests = useStaffDataStore((s) => s.labRequests);
    const updateLabRequest = useStaffDataStore((s) => s.updateLabRequest);

    const [status, setStatus] = useState('all');
    const [type, setType] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [cancelId, setCancelId] = useState<number | null>(null);

    const list = useMemo(() => {
        const q = search.trim();
        return requests
            .filter((r) => {
                if (status !== 'all' && r.status !== status) return false;
                if (type !== 'all' && r.type !== type) return false;
                if (q && !r.patientName.includes(q) && !r.patientPhone.includes(q) && !r.code.includes(q)) return false;
                return true;
            })
            .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    }, [requests, status, type, search]);

    const selected = requests.find((r) => r.id === selectedId) ?? null;
    const toCancel = requests.find((r) => r.id === cancelId) ?? null;

    const advance = (r: StaffLabRequest) => {
        const step = staffLabNextStep[r.status];
        if (!step) return;
        updateLabRequest(r.id, { status: step.to });
        log(step.label, `${r.code} — ${r.patientName}`);
        showProviderSuccess(`وضعیت به «${staffLabStatusLabels[step.to]}» تغییر کرد`);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="درخواست‌های آزمایش" description="پذیرش، تأیید و پیگیری وضعیت نمونه‌ها" />

            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="کد، نام یا موبایل..." />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
                <FilterSelect label="نوع مراجعه" value={type} onChange={setType} options={typeOptions} />
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
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">آزمایش‌ها</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">زمان</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((r) => {
                                const step = staffLabNextStep[r.status];
                                return (
                                    <tr key={r.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.code}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{r.patientName}</p>
                                            <p className="flex items-center gap-1 text-xs text-slate-400">
                                                {r.type === 'home' && <Home className="h-3 w-3" />}
                                                {labVisitTypeLabels[r.type]}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600" dir="ltr">{r.tests.join('، ')}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {r.date} — {r.time}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge label={staffLabStatusLabels[r.status]} className={staffLabStatusStyles[r.status]} />
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
                                                {can('lab.requests.status') && step && (
                                                    <button
                                                        type="button"
                                                        onClick={() => advance(r)}
                                                        className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
                                                    >
                                                        {step.label}
                                                    </button>
                                                )}
                                                {can('lab.requests.status') && (r.status === 'new' || r.status === 'confirmed') && (
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
                <ProviderModal open onClose={() => setSelectedId(null)} title={`درخواست ${selected.code}`}>
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
                        <DetailRow label="آزمایش‌ها" value={<span dir="ltr">{selected.tests.join('، ')}</span>} />
                        <DetailRow label="نوع مراجعه" value={labVisitTypeLabels[selected.type]} />
                        <DetailRow label="زمان" value={`${selected.date} — ساعت ${selected.time}`} />
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
                        <DetailRow
                            label="وضعیت"
                            value={<StatusBadge label={staffLabStatusLabels[selected.status]} className={staffLabStatusStyles[selected.status]} />}
                        />
                    </dl>
                </ProviderModal>
            )}

            {toCancel && (
                <ConfirmModal
                    title="لغو درخواست"
                    description={`درخواست ${toCancel.code} (${toCancel.patientName}) لغو شود؟`}
                    note="پس از لغو، بیمار از طریق پیامک مطلع می‌شود."
                    confirmLabel="لغو درخواست"
                    onClose={() => setCancelId(null)}
                    onConfirm={() => {
                        updateLabRequest(toCancel.id, { status: 'canceled' });
                        log('لغو درخواست آزمایش', `${toCancel.code} — ${toCancel.patientName}`);
                        showProviderSuccess('درخواست لغو شد');
                        setCancelId(null);
                    }}
                />
            )}
        </div>
    );
}
