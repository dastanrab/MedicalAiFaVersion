import { useMemo, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import {
    EmptyState,
    FilterSelect,
    PageHeader,
    ProviderFormField,
    ProviderModal,
    SearchInput,
    StatusBadge,
    inputClass,
} from '../../../components';
import { showProviderError, showProviderSuccess } from '../../../utils/toast';
import { useStaffCan } from '../../components/StaffGates';
import { DetailRow } from '../../components/StaffUi';
import { staffNurseStatusLabels, staffNurseStatusStyles } from '../../config/staffStatusOptions';
import { mockStaffNursePersonnel, type StaffNurseRequest } from '../../data/mockStaffData';
import { useStaffDataStore } from '../../store/staffDataStore';
import { useStaffActivityLogger } from '../../store/staffStore';

const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(staffNurseStatusLabels).map(([value, label]) => ({ value, label })),
];

const nurseName = (id?: number) => mockStaffNursePersonnel.find((p) => p.id === id)?.name;

export function StaffNurseRequestsPage() {
    const can = useStaffCan('nurse');
    const log = useStaffActivityLogger('nurse');
    const requests = useStaffDataStore((s) => s.nurseRequests);
    const updateNurseRequest = useStaffDataStore((s) => s.updateNurseRequest);

    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [assignFor, setAssignFor] = useState<StaffNurseRequest | null>(null);
    const [nurseId, setNurseId] = useState('');

    const list = useMemo(() => {
        const q = search.trim();
        return requests
            .filter((r) => {
                if (status !== 'all' && r.status !== status) return false;
                if (q && !r.patientName.includes(q) && !r.patientPhone.includes(q) && !r.code.includes(q)) return false;
                return true;
            })
            .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    }, [requests, status, search]);

    const selected = requests.find((r) => r.id === selectedId) ?? null;
    const activePersonnel = mockStaffNursePersonnel.filter((p) => p.active);

    const openAssign = (r: StaffNurseRequest) => {
        setAssignFor(r);
        setNurseId(r.nurseId ? String(r.nurseId) : '');
    };

    const assign = () => {
        if (!assignFor) return;
        if (!nurseId) {
            showProviderError('پرستار را انتخاب کنید');
            return;
        }
        const id = Number(nurseId);
        updateNurseRequest(assignFor.id, { nurseId: id, status: 'pending_visit' });
        log(assignFor.nurseId ? 'تغییر پرستار' : 'تعیین پرستار', `${assignFor.code} — ${nurseName(id)}`);
        showProviderSuccess('پرستار برای درخواست تعیین شد');
        setAssignFor(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="لیست درخواست‌ها" description="پیگیری درخواست‌ها و تعیین پرستار" />

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
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">خدمت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">زمان</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">پرستار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((r) => {
                                const assignable = r.status === 'pending_nurse' || r.status === 'pending_visit';
                                return (
                                    <tr key={r.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.code}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{r.patientName}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.service}</td>
                                        <td className="px-4 py-3 text-slate-600">{r.date} — {r.time}</td>
                                        <td className="px-4 py-3 text-slate-600">{nurseName(r.nurseId) ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge label={staffNurseStatusLabels[r.status]} className={staffNurseStatusStyles[r.status]} />
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
                                                {can('nurse.requests.assign') && assignable && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openAssign(r)}
                                                        className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                                                    >
                                                        {r.nurseId ? 'تغییر پرستار' : 'تعیین پرستار'}
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
                        <DetailRow label="خدمت" value={selected.service} />
                        <DetailRow label="زمان" value={`${selected.date} — ساعت ${selected.time}`} />
                        <DetailRow
                            label="آدرس"
                            value={
                                <span className="flex items-start gap-1">
                                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                                    {selected.address}
                                </span>
                            }
                        />
                        <DetailRow label="پرستار" value={nurseName(selected.nurseId) ?? 'تعیین نشده'} />
                    </dl>
                </ProviderModal>
            )}

            {assignFor && (
                <ProviderModal
                    open
                    onClose={() => setAssignFor(null)}
                    title="تعیین پرستار"
                    description={`${assignFor.code} — ${assignFor.service} برای ${assignFor.patientName}`}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setAssignFor(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                            >
                                انصراف
                            </button>
                            <button
                                type="button"
                                onClick={assign}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500"
                            >
                                ثبت
                            </button>
                        </>
                    }
                >
                    <ProviderFormField label="پرستار" required>
                        <select value={nurseId} onChange={(e) => setNurseId(e.target.value)} className={inputClass}>
                            <option value="">انتخاب پرستار</option>
                            {activePersonnel.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.gender === 'female' ? 'خانم' : 'آقا'})
                                </option>
                            ))}
                        </select>
                    </ProviderFormField>
                </ProviderModal>
            )}
        </div>
    );
}
