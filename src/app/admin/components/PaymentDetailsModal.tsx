import { X, User, Phone, CreditCard, Calendar, FileText, Stethoscope } from 'lucide-react';
import {
    paymentStatusLabels,
    paymentStatusStyles,
    paymentMethodLabels,
    paymentServiceLabels,
    paymentServiceStyles,
    type AdminPaymentRow,
} from '../config/paymentOptions';

interface PaymentDetailsModalProps {
    payment: AdminPaymentRow;
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

function formatAmount(amount: number) {
    return `${amount.toLocaleString('fa-IR')} تومان`;
}

export function PaymentDetailsModal({ payment, onClose }: PaymentDetailsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div
                className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
                role="dialog"
                aria-labelledby="payment-details-title"
            >
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                    <h3 id="payment-details-title" className="text-lg font-semibold text-slate-800">
                        جزئیات پرداخت
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <span className="text-xs text-slate-500">شناسه تراکنش</span>
                            <p className="font-mono text-sm text-slate-700" dir="ltr">
                                {payment.trackingCode}
                            </p>
                        </div>
                        <span className="text-lg font-semibold text-indigo-600">
                            {formatAmount(payment.amount)}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${paymentStatusStyles[payment.status]}`}
                        >
                            {paymentStatusLabels[payment.status]}
                        </span>
                        <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ${paymentServiceStyles[payment.serviceType]}`}
                        >
                            {paymentServiceLabels[payment.serviceType]}
                        </span>
                    </div>

                    <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <User className="h-4 w-4 text-indigo-500" />
                            پرداخت‌کننده
                        </div>
                        <p className="font-medium text-slate-800">{payment.patientName}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600" dir="ltr">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span className="w-full text-right">{payment.patientPhone}</span>
                        </p>
                    </section>

                    <section className="rounded-xl border border-slate-100 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <CreditCard className="h-4 w-4 text-indigo-500" />
                            روش و درگاه
                        </div>
                        <p className="text-sm text-slate-800">{paymentMethodLabels[payment.method]}</p>
                        {payment.gatewayRef && (
                            <p className="mt-1 text-xs text-slate-500">
                                مرجع درگاه:{' '}
                                <span className="font-mono text-slate-700" dir="ltr">
                                    {payment.gatewayRef}
                                </span>
                            </p>
                        )}
                    </section>

                    {payment.doctorName && (
                        <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Stethoscope className="h-4 w-4 text-indigo-500" />
                                پزشک مرتبط
                            </div>
                            <p className="text-sm text-slate-800">{payment.doctorName}</p>
                        </section>
                    )}

                    <section className="rounded-xl border border-slate-100 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Calendar className="h-4 w-4 text-indigo-500" />
                            تاریخ پرداخت
                        </div>
                        <p className="text-sm text-slate-800">{formatDateTime(payment.paidAt)}</p>
                    </section>

                    {payment.appointmentId != null && (
                        <section className="rounded-xl border border-slate-100 p-4">
                            <p className="mb-1 text-xs text-slate-500">شناسه نوبت مرتبط</p>
                            <p className="font-mono text-sm text-slate-700" dir="ltr">
                                #{payment.appointmentId}
                            </p>
                        </section>
                    )}

                    {payment.description && (
                        <section className="rounded-xl border border-slate-100 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <FileText className="h-4 w-4 text-indigo-500" />
                                توضیحات
                            </div>
                            <p className="text-sm text-slate-600">{payment.description}</p>
                        </section>
                    )}

                    <section className="rounded-xl border border-slate-100 p-4">
                        <p className="mb-1 text-xs text-slate-500">موقعیت</p>
                        <p className="text-sm text-slate-700">
                            {payment.province} — {payment.city}
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
