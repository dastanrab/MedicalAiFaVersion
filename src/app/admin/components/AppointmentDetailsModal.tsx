import { X, Calendar, User, Stethoscope, Phone, MessageSquare, FileText } from 'lucide-react';
import {
    appointmentStatusLabels,
    appointmentStatusStyles,
    type AdminAppointmentRow,
} from '../config/appointmentOptions';

interface AppointmentDetailsModalProps {
    appointment: AdminAppointmentRow;
    onClose: () => void;
}

function formatDateTime(iso: string) {
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export function AppointmentDetailsModal({ appointment, onClose }: AppointmentDetailsModalProps) {
    const statusClass = appointmentStatusStyles[appointment.status];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
                role="dialog"
                aria-labelledby="appointment-details-title"
            >
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                    <h3 id="appointment-details-title" className="text-lg font-semibold text-slate-800">
                        جزئیات ویزیت
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-5 p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">شناسه نوبت</span>
                        <span className="font-mono text-sm text-slate-700" dir="ltr">
                            #{appointment.id}
                        </span>
                    </div>

                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${statusClass}`}
                    >
                        {appointmentStatusLabels[appointment.status]}
                    </span>

                    <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <User className="h-4 w-4 text-indigo-500" />
                            بیمار
                        </div>
                        <p className="font-medium text-slate-800">{appointment.patientName}</p>
                        {appointment.patientPhone && (
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600" dir="ltr">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="text-right w-full">{appointment.patientPhone}</span>
                            </p>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Stethoscope className="h-4 w-4 text-indigo-500" />
                            پزشک
                        </div>
                        <p className="font-medium text-slate-800">{appointment.doctorName}</p>
                        {appointment.doctorSpecialty && (
                            <p className="mt-1 text-sm text-slate-500">{appointment.doctorSpecialty}</p>
                        )}
                    </section>

                    <section className="rounded-xl border border-slate-100 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            تاریخ و زمان
                        </div>
                        <p className="text-sm text-slate-800">{formatDateTime(appointment.scheduledAt)}</p>
                    </section>

                    {appointment.roomId != null && (
                        <section className="rounded-xl border border-slate-100 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <MessageSquare className="h-4 w-4 text-indigo-500" />
                                اتاق مشاوره
                            </div>
                            <p className="text-sm text-slate-600">
                                شناسه اتاق:{' '}
                                <span className="font-mono text-slate-800" dir="ltr">
                                    {appointment.roomId}
                                </span>
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                در اپ کاربری: مسیر{' '}
                                <span dir="ltr" className="font-mono">
                                    /consultation/{appointment.roomId}
                                </span>
                            </p>
                        </section>
                    )}

                    {appointment.cancelReason && (
                        <section className="rounded-xl border border-red-100 bg-red-50/40 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-800">
                                <FileText className="h-4 w-4" />
                                دلیل لغو
                            </div>
                            <p className="text-sm text-red-700">{appointment.cancelReason}</p>
                        </section>
                    )}

                    {appointment.notes && (
                        <section className="rounded-xl border border-slate-100 p-4">
                            <p className="mb-1 text-xs text-slate-500">یادداشت</p>
                            <p className="text-sm text-slate-700">{appointment.notes}</p>
                        </section>
                    )}

                    <section className="rounded-xl border border-slate-100 p-4">
                        <p className="mb-1 text-xs text-slate-500">موقعیت</p>
                        <p className="text-sm text-slate-700">
                            {appointment.province} — {appointment.city}
                        </p>
                    </section>
                </div>

                <div className="border-t border-slate-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-full rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
}
