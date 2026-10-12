import { useMemo, useState } from 'react';
import { CalendarClock, Plus, UserCheck, XCircle } from 'lucide-react';
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
import { isValidIranPhone, normalizePhone } from '../../../utils/validation';
import { useStaffCan } from '../../components/StaffGates';
import { ConfirmModal } from '../../components/StaffUi';
import {
    staffAppointmentStatusLabels,
    staffAppointmentStatusStyles,
    visitTypeLabels,
} from '../../config/staffStatusOptions';
import { jalaliFromToday, todayKey, type StaffAppointment } from '../../data/mockStaffData';
import { useStaffDataStore } from '../../store/staffDataStore';
import { useStaffActivityLogger } from '../../store/staffStore';

const filterOptions = [
    { value: 'today', label: 'نوبت‌های امروز' },
    { value: 'upcoming', label: 'نوبت‌های آینده' },
    { value: 'all', label: 'همه' },
];

const statusFilterOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(staffAppointmentStatusLabels).map(([value, label]) => ({ value, label })),
];

/** روزهای قابل انتخاب برای ثبت / جابه‌جایی نوبت */
const dayOptions = Array.from({ length: 14 }, (_, i) => jalaliFromToday(i));

const timeOptions = Array.from({ length: 25 }, (_, i) => {
    const minutes = 8 * 60 + i * 30;
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

type ModalState =
    | { kind: 'create' }
    | { kind: 'reschedule'; appointment: StaffAppointment }
    | { kind: 'cancel'; appointment: StaffAppointment }
    | null;

export function StaffAppointmentsPage() {
    const can = useStaffCan('doctor');
    const log = useStaffActivityLogger('doctor');
    const appointments = useStaffDataStore((s) => s.appointments);
    const addAppointment = useStaffDataStore((s) => s.addAppointment);
    const updateAppointment = useStaffDataStore((s) => s.updateAppointment);

    const [range, setRange] = useState<'today' | 'upcoming' | 'all'>('today');
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<ModalState>(null);

    const today = todayKey();
    const list = useMemo(() => {
        const q = search.trim();
        return appointments
            .filter((a) => {
                if (range === 'today' && a.date !== today) return false;
                if (range === 'upcoming' && a.date < today) return false;
                if (status !== 'all' && a.status !== status) return false;
                if (q && !a.patientName.includes(q) && !a.patientPhone.includes(q)) return false;
                return true;
            })
            .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    }, [appointments, range, status, search, today]);

    const checkIn = (a: StaffAppointment) => {
        updateAppointment(a.id, { status: 'checked_in' });
        log('ثبت حضور بیمار', `${a.patientName} — ${a.date} ${a.time}`);
        showProviderSuccess('حضور بیمار ثبت شد');
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="نوبت‌ها"
                description="ثبت، جابه‌جایی و لغو نوبت‌ها و ثبت حضور بیماران"
                actions={
                    can('appointments.create') && (
                        <button
                            type="button"
                            onClick={() => setModal({ kind: 'create' })}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                        >
                            <Plus className="h-4 w-4" />
                            ثبت نوبت حضوری
                        </button>
                    )
                }
            />

            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <SearchInput value={search} onChange={setSearch} placeholder="نام یا موبایل بیمار..." />
                <FilterSelect label="بازه" value={range} onChange={(v) => setRange(v as typeof range)} options={filterOptions} />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusFilterOptions} />
            </div>

            {list.length === 0 ? (
                <EmptyState message="نوبتی یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">ساعت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">نوع</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((a) => {
                                const editable = a.status === 'booked';
                                return (
                                    <tr key={a.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{a.patientName}</p>
                                            <p className="text-xs text-slate-400" dir="ltr">{a.patientPhone}</p>
                                        </td>
                                        <td className="px-4 py-3">{a.date}</td>
                                        <td className="px-4 py-3">{a.time}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {visitTypeLabels[a.type]}
                                            {a.source === 'secretary' && (
                                                <span className="mr-1 text-xs text-slate-400">(ثبت منشی)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                label={staffAppointmentStatusLabels[a.status]}
                                                className={staffAppointmentStatusStyles[a.status]}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {editable ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {can('appointments.checkin') && a.type === 'in_person' && a.date === today && (
                                                        <ActionButton icon={UserCheck} label="حضور" tone="emerald" onClick={() => checkIn(a)} />
                                                    )}
                                                    {can('appointments.reschedule') && (
                                                        <ActionButton
                                                            icon={CalendarClock}
                                                            label="جابه‌جایی"
                                                            tone="blue"
                                                            onClick={() => setModal({ kind: 'reschedule', appointment: a })}
                                                        />
                                                    )}
                                                    {can('appointments.cancel') && (
                                                        <ActionButton
                                                            icon={XCircle}
                                                            label="لغو"
                                                            tone="red"
                                                            onClick={() => setModal({ kind: 'cancel', appointment: a })}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {modal?.kind === 'create' && (
                <AppointmentFormModal
                    title="ثبت نوبت حضوری"
                    appointments={appointments}
                    onClose={() => setModal(null)}
                    onSubmit={(v) => {
                        const created = addAppointment({ ...v, type: 'in_person' });
                        log('ثبت نوبت حضوری', `${created.patientName} — ${created.date} ${created.time}`);
                        showProviderSuccess('نوبت ثبت شد');
                        setModal(null);
                    }}
                />
            )}

            {modal?.kind === 'reschedule' && (
                <AppointmentFormModal
                    title="جابه‌جایی نوبت"
                    initial={modal.appointment}
                    appointments={appointments}
                    onClose={() => setModal(null)}
                    onSubmit={(v) => {
                        const a = modal.appointment;
                        updateAppointment(a.id, { date: v.date, time: v.time });
                        log('جابه‌جایی نوبت', `${a.patientName}: ${a.date} ${a.time} ← ${v.date} ${v.time}`);
                        showProviderSuccess('زمان نوبت تغییر کرد');
                        setModal(null);
                    }}
                />
            )}

            {modal?.kind === 'cancel' && (
                <ConfirmModal
                    title="لغو نوبت"
                    description={`نوبت ${modal.appointment.patientName} در ${modal.appointment.date} ساعت ${modal.appointment.time} لغو شود؟`}
                    note="پس از لغو، پیامک اطلاع‌رسانی برای بیمار ارسال می‌شود."
                    confirmLabel="لغو نوبت"
                    onClose={() => setModal(null)}
                    onConfirm={() => {
                        const a = modal.appointment;
                        updateAppointment(a.id, { status: 'canceled' });
                        log('لغو نوبت', `${a.patientName} — ${a.date} ${a.time}`);
                        showProviderSuccess('نوبت لغو شد');
                        setModal(null);
                    }}
                />
            )}
        </div>
    );
}

const actionTones = {
    emerald: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
    blue: 'text-blue-700 bg-blue-50 hover:bg-blue-100',
    red: 'text-red-700 bg-red-50 hover:bg-red-100',
};

function ActionButton({
    icon: Icon,
    label,
    tone,
    onClick,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    tone: keyof typeof actionTones;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${actionTones[tone]}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    );
}

interface AppointmentFormValues {
    patientName: string;
    patientPhone: string;
    date: string;
    time: string;
}

function AppointmentFormModal({
    title,
    initial,
    appointments,
    onClose,
    onSubmit,
}: {
    title: string;
    initial?: StaffAppointment;
    appointments: StaffAppointment[];
    onClose: () => void;
    onSubmit: (values: AppointmentFormValues) => void;
}) {
    const isReschedule = Boolean(initial);
    const [patientName, setPatientName] = useState(initial?.patientName ?? '');
    const [patientPhone, setPatientPhone] = useState(initial?.patientPhone ?? '');
    const [date, setDate] = useState(initial && dayOptions.includes(initial.date) ? initial.date : dayOptions[0]);
    const [time, setTime] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const takenTimes = useMemo(
        () =>
            new Set(
                appointments
                    .filter((a) => a.date === date && a.status !== 'canceled' && a.id !== initial?.id)
                    .map((a) => a.time)
            ),
        [appointments, date, initial?.id]
    );

    const submit = () => {
        const next: Record<string, string> = {};
        if (!isReschedule) {
            if (!patientName.trim()) next.patientName = 'نام بیمار را وارد کنید';
            if (!isValidIranPhone(patientPhone)) next.patientPhone = 'شماره موبایل معتبر نیست';
        }
        if (!time) next.time = 'ساعت نوبت را انتخاب کنید';
        setErrors(next);
        if (Object.keys(next).length) return;
        if (takenTimes.has(time)) {
            showProviderError('این ساعت قبلاً رزرو شده است');
            return;
        }
        onSubmit({ patientName: patientName.trim(), patientPhone: normalizePhone(patientPhone), date, time });
    };

    return (
        <ProviderModal
            open
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={submit}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                        ثبت
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {isReschedule ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        {initial!.patientName} — نوبت فعلی: {initial!.date} ساعت {initial!.time}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <ProviderFormField label="نام و نام خانوادگی بیمار" required error={errors.patientName}>
                            <input value={patientName} onChange={(e) => setPatientName(e.target.value)} className={inputClass} />
                        </ProviderFormField>
                        <ProviderFormField label="موبایل بیمار" required error={errors.patientPhone}>
                            <input
                                value={patientPhone}
                                onChange={(e) => setPatientPhone(normalizePhone(e.target.value))}
                                dir="ltr"
                                placeholder="09123456789"
                                className={inputClass}
                            />
                        </ProviderFormField>
                    </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                    <ProviderFormField label="تاریخ" required>
                        <select
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value);
                                setTime('');
                            }}
                            className={inputClass}
                        >
                            {dayOptions.map((d, i) => (
                                <option key={d} value={d}>
                                    {d}
                                    {i === 0 ? ' (امروز)' : i === 1 ? ' (فردا)' : ''}
                                </option>
                            ))}
                        </select>
                    </ProviderFormField>
                    <ProviderFormField label="ساعت" required error={errors.time}>
                        <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
                            <option value="">انتخاب ساعت</option>
                            {timeOptions.map((t) => (
                                <option key={t} value={t} disabled={takenTimes.has(t)}>
                                    {t}
                                    {takenTimes.has(t) ? ' — رزرو شده' : ''}
                                </option>
                            ))}
                        </select>
                    </ProviderFormField>
                </div>
            </div>
        </ProviderModal>
    );
}
