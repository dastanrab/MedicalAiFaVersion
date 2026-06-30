import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, MessageSquare, FileText } from 'lucide-react';
import {
    PageHeader,
    EmptyState,
    StatusBadge,
    Timeline,
} from '../../components';
import {
    getAppointmentById,
    getPatientById,
    getPatientAppointments,
    doctorVisitTypeLabels,
} from '../data/mockDoctorData';
import {
    doctorAppointmentStatusLabels,
    doctorAppointmentStatusStyles,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

interface DoctorAppointmentDetailPageProps {
    appointmentId: number;
}

export function DoctorAppointmentDetailPage({ appointmentId }: DoctorAppointmentDetailPageProps) {
    const appointment = getAppointmentById(appointmentId);
    const [visitResult, setVisitResult] = useState(appointment?.notes ?? '');

    if (!appointment) {
        return <EmptyState message="نوبت یافت نشد." />;
    }

    const patient = getPatientById(appointment.patientId);
    const history = getPatientAppointments(appointment.patientId).filter(
        (a) => a.id !== appointmentId
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title={`نوبت — ${appointment.patientName}`}
                description={`${appointment.date} — ${appointment.time}`}
                actions={
                    <Link
                        to={providerPath('doctor', 'appointments')}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                        <ArrowRight className="h-4 w-4" />
                        بازگشت
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="mb-4 text-sm font-semibold text-slate-700">اطلاعات بیمار</p>
                    {patient ? (
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-slate-500">نام</dt>
                                <dd className="font-medium">{patient.name}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">موبایل</dt>
                                <dd dir="ltr">{patient.phone}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">سن</dt>
                                <dd>{patient.age.toLocaleString('fa-IR')} سال</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-slate-500">تعداد ویزیت</dt>
                                <dd>{patient.visitCount.toLocaleString('fa-IR')}</dd>
                            </div>
                            {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                                <div>
                                    <dt className="text-slate-500">بیماری‌های مزمن</dt>
                                    <dd className="mt-1 text-amber-700">{patient.chronicConditions.join('، ')}</dd>
                                </div>
                            )}
                        </dl>
                    ) : (
                        <p className="text-sm text-slate-500">اطلاعات بیمار در دسترس نیست</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                        <StatusBadge
                            label={doctorAppointmentStatusLabels[appointment.status]}
                            className={doctorAppointmentStatusStyles[appointment.status]}
                        />
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700 ring-1 ring-blue-200">
                            {doctorVisitTypeLabels[appointment.visitType]}
                        </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="mb-4 text-sm font-semibold text-slate-700">سابقه مراجعه</p>
                    {history.length === 0 ? (
                        <p className="text-sm text-slate-500">مراجعه قبلی ثبت نشده</p>
                    ) : (
                        <Timeline
                            entries={history.map((h) => ({
                                at: `${h.date} — ${h.time}`,
                                label: `${doctorVisitTypeLabels[h.visitType]} — ${doctorAppointmentStatusLabels[h.status]}`,
                            }))}
                        />
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">ثبت نتیجه ویزیت</p>
                <textarea
                    value={visitResult}
                    onChange={(e) => setVisitResult(e.target.value)}
                    rows={4}
                    placeholder="یادداشت پزشک، تشخیص و توصیه‌ها..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                {/* TODO: ذخیره نتیجه ویزیت از طریق API */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        ذخیره نتیجه
                    </button>
                    {appointment.visitType === 'online' && (
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                        >
                            <MessageSquare className="h-4 w-4" />
                            شروع مشاوره
                        </button>
                    )}
                    <Link
                        to={providerPath('doctor', 'prescriptions')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <FileText className="h-4 w-4" />
                        صدور نسخه
                    </Link>
                </div>
            </div>
        </div>
    );
}
