import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarClock, Loader2, Plus, UserCheck, XCircle } from 'lucide-react';
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
import { useStaffActivityLogger, useStaffSession, useStaffStore } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

const filterOptions = [
    { value: 'today', label: 'نوبت‌های امروز' },
    { value: 'upcoming', label: 'نوبت‌های آینده' },
    { value: 'all', label: 'همه' },
];

const statusFilterOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(staffAppointmentStatusLabels).map(([value, label]) => ({ value, label })),
];

const dayOptions = Array.from({ length: 14 }, (_, i) => jalaliFromToday(i));

interface AvailableSlot {
    slot_id: number;
    time: string;
}

type ModalState =
    | { kind: 'create' }
    | { kind: 'reschedule'; appointment: StaffAppointment }
    | { kind: 'cancel'; appointment: StaffAppointment }
    | null;

export function StaffAppointmentsPage() {
    const session = useStaffSession('doctor');
    const logout = useStaffStore((s) => s.logout);
    const can = useStaffCan('doctor');
    const log = useStaffActivityLogger('doctor');

    const [appointments, setAppointments] = useState<StaffAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [range, setRange] = useState<'today' | 'upcoming' | 'all'>('today');
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<ModalState>(null);

    const today = todayKey();

    const fetchAppointments = useCallback(async () => {
        if (!session?.token) {
            logout('doctor');
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams({
                range,
                status,
                search: search.trim(),
            });

            const res = await fetch(`${API_BASE}/staff/doctor/appointments?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
            });

            if (res.status === 401) {
                logout('doctor');
                return;
            }

            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
                setAppointments(result.data);
            } else {
                showProviderError(result.message || 'خطا در بارگذاری نوبت‌ها');
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);
            showProviderError('ارتباط با سرور برقرار نشد.');
        } finally {
            setLoading(false);
        }
    }, [session?.token, logout, range, status, search]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const list = useMemo(() => {
        const q = search.trim();
        return appointments.filter((a) => {
            if (q && !a.patientName.includes(q) && !a.patientPhone.includes(q)) return false;
            return true;
        });
    }, [appointments, search]);

    // ثبت حضور
    const handleCheckIn = async (a: StaffAppointment) => {
        if (!session?.token) return;

        try {
            const res = await fetch(`${API_BASE}/staff/doctor/appointments/${a.id}/check-in`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
            });

            if (res.status === 401) {
                logout('doctor');
                return;
            }

            const result = await res.json();
            if (result.success) {
                setAppointments((prev) =>
                    prev.map((item) => (item.id === a.id ? { ...item, status: 'checked_in' } : item))
                );
                log('ثبت حضور بیمار', `${a.patientName} — ${a.date} ${a.time}`);
                showProviderSuccess('حضور بیمار ثبت شد');
            } else {
                showProviderError(result.message || 'خطا در ثبت حضور');
            }
        } catch (error) {
            console.error('Error checking in:', error);
            showProviderError('خطایی در ارتباط با سرور رخ داد.');
        }
    };

    // ثبت نوبت با slot_id
    const handleBookAppointment = async (payload: { slot_id: number; patientName: string; patientPhone: string; date: string; time: string }) => {
        if (!session?.token) return;

        try {
            setActionLoading(true);
            const res = await fetch(`${API_BASE}/staff/doctor/appointments/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
                body: JSON.stringify({
                    slot_id: payload.slot_id,
                    patientName: payload.patientName,
                    patientPhone: payload.patientPhone,
                }),
            });

            if (res.status === 401) {
                logout('doctor');
                return;
            }

            const result = await res.json();
            if (result.success) {
                log('ثبت نوبت حضوری', `${payload.patientName} — ${payload.date} ${payload.time}`);
                showProviderSuccess('نوبت با موفقیت ثبت شد');
                setModal(null);
                fetchAppointments();
            } else {
                showProviderError(result.message || 'خطا در ثبت نوبت');
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
            showProviderError('خطایی رخ داد.');
        } finally {
            setActionLoading(false);
        }
    };

    // جابه‌جایی نوبت به اسلات جدید
    const handleReschedule = async (appointmentId: number, newSlotId: number, date: string, time: string) => {
        if (!session?.token) return;

        try {
            setActionLoading(true);
            const res = await fetch(`${API_BASE}/staff/doctor/appointments/${appointmentId}/reschedule`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
                body: JSON.stringify({ new_slot_id: newSlotId }),
            });

            if (res.status === 401) {
                logout('doctor');
                return;
            }

            const result = await res.json();
            if (result.success) {
                showProviderSuccess('زمان نوبت با موفقیت تغییر کرد');
                log('جابه‌جایی نوبت', `اسلات ${appointmentId} به ${date} ${time}`);
                setModal(null);
                fetchAppointments();
            } else {
                showProviderError(result.message || 'خطا در تغییر زمان نوبت');
            }
        } catch (error) {
            console.error('Error rescheduling:', error);
            showProviderError('خطایی رخ داد.');
        } finally {
            setActionLoading(false);
        }
    };

    // لغو نوبت
    const handleCancel = async (a: StaffAppointment) => {
        if (!session?.token) return;

        try {
            setActionLoading(true);
            const res = await fetch(`${API_BASE}/staff/doctor/appointments/${a.id}/cancel`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${session.token}`,
                },
            });

            if (res.status === 401) {
                logout('doctor');
                return;
            }

            const result = await res.json();
            if (result.success) {
                setAppointments((prev) =>
                    prev.map((item) => (item.id === a.id ? { ...item, status: 'canceled' } : item))
                );
                log('لغو نوبت', `${a.patientName} — ${a.date} ${a.time}`);
                showProviderSuccess('نوبت لغو شد');
                setModal(null);
            } else {
                showProviderError(result.message || 'خطا در لغو نوبت');
            }
        } catch (error) {
            console.error('Error canceling appointment:', error);
            showProviderError('خطایی رخ داد.');
        } finally {
            setActionLoading(false);
        }
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

            {loading ? (
                <div className="flex h-64 w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : list.length === 0 ? (
                <EmptyState message="نوبتی یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ (شمسی)</th>
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
                                    <td className="px-4 py-3 font-medium text-slate-700">{a.date}</td>
                                    <td className="px-4 py-3">{a.time}</td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {visitTypeLabels[a.type] ?? 'حضوری'}
                                        {a.source === 'secretary' && (
                                            <span className="mr-1 text-xs text-slate-400">(ثبت منشی)</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            label={staffAppointmentStatusLabels[a.status] ?? a.status}
                                            className={staffAppointmentStatusStyles[a.status] ?? 'bg-slate-100 text-slate-700'}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        {editable ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {can('appointments.checkin') && a.type === 'in_person' && (
                                                    <ActionButton
                                                        icon={UserCheck}
                                                        label="حضور"
                                                        tone="emerald"
                                                        onClick={() => handleCheckIn(a)}
                                                    />
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

            {/* مودال ثبت نوبت با انتخاب ساعت آزاد */}
            {modal?.kind === 'create' && (
                <AppointmentFormModal
                    token={session?.token}
                    title="ثبت نوبت حضوری"
                    submitting={actionLoading}
                    onClose={() => setModal(null)}
                    onSubmit={(v) => handleBookAppointment(v)}
                />
            )}

            {/* مودال جابه‌جایی نوبت */}
            {modal?.kind === 'reschedule' && (
                <AppointmentFormModal
                    token={session?.token}
                    title="جابه‌جایی نوبت"
                    initial={modal.appointment}
                    submitting={actionLoading}
                    onClose={() => setModal(null)}
                    onSubmit={(v) => handleReschedule(modal.appointment.id, v.slot_id, v.date, v.time)}
                />
            )}

            {/* مودال لغو نوبت */}
            {modal?.kind === 'cancel' && (
                <ConfirmModal
                    title="لغو نوبت"
                    description={`نوبت ${modal.appointment.patientName} در ${modal.appointment.date} ساعت ${modal.appointment.time} لغو شود؟`}
                    note="پس از لغو، وضعیت نوبت به لغو شده تغییر می‌یابد."
                    confirmLabel={actionLoading ? 'در حال لغو...' : 'لغو نوبت'}
                    onClose={() => setModal(null)}
                    onConfirm={() => handleCancel(modal.appointment)}
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

interface AppointmentFormModalProps {
    token?: string;
    title: string;
    initial?: StaffAppointment;
    submitting: boolean;
    onClose: () => void;
    onSubmit: (values: { slot_id: number; patientName: string; patientPhone: string; date: string; time: string }) => void;
}

function AppointmentFormModal({
                                  token,
                                  title,
                                  initial,
                                  submitting,
                                  onClose,
                                  onSubmit,
                              }: AppointmentFormModalProps) {
    const isReschedule = Boolean(initial);
    const [patientName, setPatientName] = useState(initial?.patientName ?? '');
    const [patientPhone, setPatientPhone] = useState(initial?.patientPhone ?? '');
    const [date, setDate] = useState(initial && dayOptions.includes(initial.date) ? initial.date : dayOptions[0]);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // واکشی اسلات‌های آزاد به ازای تاریخ انتخابی
    useEffect(() => {
        if (!token || !date) return;

        let active = true;
        const fetchSlots = async () => {
            try {
                setLoadingSlots(true);
                setSelectedSlotId(null);
                const res = await fetch(`${API_BASE}/staff/doctor/appointments/available-slots?date=${encodeURIComponent(date)}`, {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await res.json();
                if (active && result.success && result.data?.slots) {
                    setAvailableSlots(result.data.slots);
                }
            } catch (err) {
                console.error('Error fetching available slots:', err);
            } finally {
                if (active) setLoadingSlots(false);
            }
        };

        fetchSlots();

        return () => {
            active = false;
        };
    }, [token, date]);

    const submit = () => {
        const next: Record<string, string> = {};
        if (!isReschedule) {
            if (!patientName.trim()) next.patientName = 'نام بیمار را وارد کنید';
            if (!isValidIranPhone(patientPhone)) next.patientPhone = 'شماره موبایل معتبر نیست';
        }
        if (!selectedSlotId) next.slot = 'لطفاً یکی از ساعت‌های آزاد را انتخاب کنید';

        setErrors(next);
        if (Object.keys(next).length) return;

        const chosenSlot = availableSlots.find((s) => s.slot_id === selectedSlotId);
        if (!chosenSlot) return;

        onSubmit({
            slot_id: chosenSlot.slot_id,
            patientName: patientName.trim(),
            patientPhone: normalizePhone(patientPhone),
            date,
            time: chosenSlot.time,
        });
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
                        disabled={submitting}
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        disabled={submitting || loadingSlots || availableSlots.length === 0}
                        onClick={submit}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isReschedule ? 'تأیید جابه‌جایی' : 'ثبت نوبت'}
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
                            <input
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className={inputClass}
                                placeholder="مثلاً: علی رضایی"
                            />
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

                <div className="space-y-2">
                    <ProviderFormField label="تاریخ نوبت" required>
                        <select
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
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
                </div>

                {/* فهرست ساعت‌های فراهم */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                        ساعت‌های آزاد و فراهم برای رزرو:
                    </label>

                    {loadingSlots ? (
                        <div className="flex items-center justify-center py-6 text-sm text-slate-400 gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            در حال بررسی اسلات‌های خالی...
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-rose-500">
                            هیچ نوبت آزادی برای این تاریخ تعریف نشده یا همه ساعات تکمیل شده‌اند.
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 max-h-48 overflow-y-auto p-1">
                            {availableSlots.map((s) => {
                                const isSelected = selectedSlotId === s.slot_id;
                                return (
                                    <button
                                        key={s.slot_id}
                                        type="button"
                                        onClick={() => setSelectedSlotId(s.slot_id)}
                                        className={`rounded-xl border py-2 text-center text-xs font-medium transition ${
                                            isSelected
                                                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                                        }`}
                                    >
                                        {s.time}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {errors.slot && <p className="text-xs text-rose-600 mt-1">{errors.slot}</p>}
                </div>
            </div>
        </ProviderModal>
    );
}
