import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { PageHeader, EmptyState, Timeline } from '../../components';
import {
    getPatientById,
    getPatientAppointments,
    getPatientPrescriptions,
    doctorVisitTypeLabels,
} from '../data/mockDoctorData';
import { doctorAppointmentStatusLabels } from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

interface DoctorPatientDetailPageProps {
    patientId: number;
}

export function DoctorPatientDetailPage({ patientId }: DoctorPatientDetailPageProps) {
    const patient = getPatientById(patientId);

    if (!patient) {
        return <EmptyState message="بیمار یافت نشد." />;
    }

    const appointments = getPatientAppointments(patientId);
    const prescriptions = getPatientPrescriptions(patientId);

    return (
        <div className="space-y-6">
            <PageHeader
                title={patient.name}
                description={`${patient.age.toLocaleString('fa-IR')} سال — ${patient.gender === 'male' ? 'مرد' : 'زن'}`}
                actions={
                    <Link
                        to={providerPath('doctor', 'patients')}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                        <ArrowRight className="h-4 w-4" />
                        بازگشت
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="mb-4 text-sm font-semibold text-slate-700">اطلاعات پایه</p>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-500">موبایل</dt>
                            <dd dir="ltr">{patient.phone}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">کد ملی</dt>
                            <dd>{patient.nationalId}</dd>
                        </div>
                        {patient.bloodType && (
                            <div className="flex justify-between">
                                <dt className="text-slate-500">گروه خونی</dt>
                                <dd>{patient.bloodType}</dd>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <dt className="text-slate-500">آخرین مراجعه</dt>
                            <dd>{patient.lastVisit}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">تعداد ویزیت</dt>
                            <dd>{patient.visitCount.toLocaleString('fa-IR')}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <p className="mb-4 text-sm font-semibold text-slate-700">سابقه پزشکی</p>
                    {patient.allergies && patient.allergies.length > 0 && (
                        <div className="mb-3">
                            <p className="text-xs text-slate-500">حساسیت‌ها</p>
                            <p className="mt-1 text-sm text-red-700">{patient.allergies.join('، ')}</p>
                        </div>
                    )}
                    {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
                        <div>
                            <p className="text-xs text-slate-500">بیماری‌های مزمن</p>
                            <p className="mt-1 text-sm text-amber-700">{patient.chronicConditions.join('، ')}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">بیماری مزمن ثبت نشده</p>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">نسخه‌ها</p>
                {prescriptions.length === 0 ? (
                    <p className="text-sm text-slate-500">نسخه‌ای ثبت نشده</p>
                ) : (
                    <div className="space-y-4">
                        {prescriptions.map((rx) => (
                            <div key={rx.id} className="rounded-xl border border-slate-100 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-medium text-slate-800">{rx.diagnosis}</p>
                                    <span className="text-xs text-slate-400">{rx.date}</span>
                                </div>
                                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                    {rx.medicines.map((m, i) => (
                                        <li key={i}>
                                            {m.name} — {m.dosage} — {m.duration}
                                        </li>
                                    ))}
                                </ul>
                                {rx.doctorNotes && (
                                    <p className="mt-2 text-xs text-slate-500">{rx.doctorNotes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="mb-4 text-sm font-semibold text-slate-700">جلسات قبلی</p>
                {appointments.length === 0 ? (
                    <p className="text-sm text-slate-500">جلسه‌ای ثبت نشده</p>
                ) : (
                    <Timeline
                        entries={appointments.map((a) => ({
                            at: `${a.date} — ${a.time}`,
                            label: `${doctorVisitTypeLabels[a.visitType]} — ${doctorAppointmentStatusLabels[a.status]}`,
                        }))}
                    />
                )}
            </div>
        </div>
    );
}
