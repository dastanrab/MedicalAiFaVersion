import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowRight, Loader2, Save } from 'lucide-react';
import {
    getAppointmentDetails,
    updateAppointmentStatus,
    cancelAppointmentApi,
    setTokenGetter,
} from '../../../services/api';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import { useAdminDataStore } from '../../store/adminDataStore';
import { saveAppointmentNotes } from '../../services/adminApi';
import {
    appointmentStatusLabels,
    appointmentStatusStyles,
    type AdminAppointmentRow,
    type AppointmentStatus,
} from '../../config/appointmentOptions';
import { CancelAppointmentModal } from '../../components/CancelAppointmentModal';

type ApiAppointmentDetail = {
    id: number;
    slot_date?: string;
    start_time?: string;
    end_time?: string;
    status?: string | { key?: string; text?: string };
    patient?: {
        id?: number;
        name?: string;
        phone?: string | null;
        province?: string | null;
        city?: string | null;
    };
    doctor?: {
        id?: number;
        name?: string;
        specialty?: string | null;
    };
    mobile?: string | null;
    province?: string | null;
    city?: string | null;
    datetime?: {
        date?: string;
        time?: string;
    };
    patientName?: string;
    patientPhone?: string | null;
    doctorName?: string;
    room_id?: number | null;
    roomId?: number | null;
    cancel_reason?: string | null;
    notes?: string | null;
};

function mapApiStatusToUi(status: ApiAppointmentDetail['status']): AppointmentStatus {
    const raw =
        typeof status === 'string'
            ? status
            : status?.key || status?.text || '';

    switch (raw) {
        case 'completed':
        case 'done':
        case 'انجام شده':
            return 'done';
        case 'cancelled':
        case 'canceled':
        case 'لغو شده':
            return 'canceled';
        case 'no_show':
        case 'no-show':
        case 'عدم حضور':
            return 'no-show';
        default:
            return 'booked';
    }
}

function toIsoDateTime(date?: string, time?: string) {
    if (!date) return '';
    const normalizedTime = (time || '00:00').slice(0, 5);
    return `${date}T${normalizedTime}:00`;
}

function formatJalaliDateTime(value: string) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function normalizeAppointment(appt: ApiAppointmentDetail): AdminAppointmentRow {
    const date = appt.slot_date || appt.datetime?.date || '';
    const time =
        appt.start_time ||
        appt.datetime?.time?.split('-')?.[0]?.trim() ||
        '00:00';

    return {
        id: appt.id,
        patientName: appt.patient?.name ?? appt.patientName ?? '',
        patientPhone: appt.patient?.phone ?? appt.mobile ?? appt.patientPhone ?? '',
        doctorId: appt.doctor?.id ?? 0,
        doctorName: appt.doctor?.name ?? '',
        doctorSpecialty: appt.doctor?.specialty ?? '',
        province: appt.patient?.province ?? appt.province ?? '—',
        city: appt.patient?.city ?? appt.city ?? '—',
        scheduledAt: toIsoDateTime(date, time),
        status: mapApiStatusToUi(appt.status),
        roomId: appt.room_id ?? appt.roomId ?? null,
        cancelReason: appt.cancel_reason ?? undefined,
        notes: appt.notes ?? undefined,
    };
}

export function AdminAppointmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = useAdminAuthStore((s) => s.token);
    const getNote = useAdminDataStore((s) => s.getAppointmentNote);
    const setNote = useAdminDataStore((s) => s.setAppointmentNote);
    const addActivity = useAdminDataStore((s) => s.addActivity);

    const [row, setRow] = useState<AdminAppointmentRow | null>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCancel, setShowCancel] = useState(false);

    useEffect(() => {
        setTokenGetter(() => token);
    }, [token]);

    const load = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await getAppointmentDetails(Number(id));
            const appt = response?.data ?? response;

            if (appt) {
                const normalized = normalizeAppointment(appt);
                setRow(normalized);
                setNotes(normalized.notes ?? getNote(Number(id)) ?? '');
            } else {
                setRow(null);
            }
        } catch {
            setRow(null);
        } finally {
            setLoading(false);
        }
    }, [id, getNote]);

    useEffect(() => {
        load();
    }, [load]);

    const jalaliScheduledAt = useMemo(() => {
        return row?.scheduledAt ? formatJalaliDateTime(row.scheduledAt) : '—';
    }, [row?.scheduledAt]);

    const saveNotes = async () => {
        if (!row) return;

        setSaving(true);
        try {
            await saveAppointmentNotes(row.id, notes);
            setNote(row.id, notes);
            setRow({ ...row, notes });
            addActivity({
                type: 'appointment',
                message: `یادداشت ادمین برای نوبت #${row.id}`,
                link: `/admin/appointments/${row.id}`,
            });
        } finally {
            setSaving(false);
        }
    };

    const changeStatus = async (status: AppointmentStatus) => {
        if (!row) return;

        const apiStatus =
            status === 'done'
                ? 'completed'
                : status === 'no-show'
                    ? 'no_show'
                    : status === 'canceled'
                        ? 'cancelled'
                        : 'booked';

        await updateAppointmentStatus(row.id, apiStatus);
        setRow({ ...row, status });
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!row) {
        return <p className="text-center text-slate-500">نوبت یافت نشد</p>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate('/admin/appointments')}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white"
                >
                    <ArrowRight className="h-5 w-5" />
                </button>

                <div>
                    <h2 className="text-xl font-semibold">نوبت #{row.id}</h2>
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${appointmentStatusStyles[row.status]}`}
                    >
                        {appointmentStatusLabels[row.status]}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border bg-white p-6">
                    <div>
                        <span className="text-xs text-slate-500">بیمار</span>
                        <p className="font-medium">{row.patientName || '—'}</p>
                        <p dir="ltr" className="text-sm text-slate-500">
                            {row.patientPhone || '—'}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs text-slate-500">پزشک</span>
                        <p className="font-medium">{row.doctorName || '—'}</p>
                        <p className="text-sm text-slate-500">
                            {row.doctorSpecialty || '—'}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs text-slate-500">موقعیت بیمار</span>
                        <p>
                            {row.province || '—'} - {row.city || '—'}
                        </p>
                    </div>

                    <div>
                        <span className="text-xs text-slate-500">زمان نوبت</span>
                        <p>{jalaliScheduledAt}</p>
                    </div>

                    {row.cancelReason && (
                        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                            دلیل لغو: {row.cancelReason}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {(['booked', 'done', 'no-show'] as AppointmentStatus[]).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => changeStatus(s)}
                                className="rounded-lg border px-3 py-1.5 text-xs hover:bg-slate-50"
                            >
                                {appointmentStatusLabels[s]}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setShowCancel(true)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600"
                        >
                            لغو
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-6">
                    <h3 className="font-semibold">یادداشت ادمین</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        className="mt-3 w-full rounded-xl border p-3 text-sm"
                        placeholder="یادداشت داخلی..."
                    />
                    <button
                        type="button"
                        onClick={saveNotes}
                        disabled={saving}
                        className="mt-3 flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm text-white disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'در حال ذخیره...' : 'ذخیره یادداشت'}
                    </button>
                </div>
            </div>

            {showCancel && (
                <CancelAppointmentModal
                    appointment={row}
                    onClose={() => setShowCancel(false)}
                    onConfirm={async (reason) => {
                        await cancelAppointmentApi(row.id, reason);
                        setRow({ ...row, status: 'canceled', cancelReason: reason });
                        setShowCancel(false);
                    }}
                />
            )}
        </div>
    );
}
