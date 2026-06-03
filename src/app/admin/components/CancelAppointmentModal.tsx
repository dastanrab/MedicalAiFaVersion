import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import type { AdminAppointmentRow } from '../config/appointmentOptions';

interface CancelAppointmentModalProps {
    appointment: AdminAppointmentRow;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
}

export function CancelAppointmentModal({
    appointment,
    onClose,
    onConfirm,
}: CancelAppointmentModalProps) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const trimmed = reason.trim();
        if (!trimmed) {
            setError('لطفاً دلیل لغو را وارد کنید.');
            return;
        }
        setError('');
        setSubmitting(true);
        try {
            await onConfirm(trimmed);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'خطا در لغو نوبت');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-semibold text-slate-800">لغو نوبت</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4 p-5">
                    <p className="text-sm text-slate-600">
                        لغو نوبت{' '}
                        <span className="font-medium text-slate-800">{appointment.patientName}</span>
                        {' '}با دکتر{' '}
                        <span className="font-medium text-slate-800">{appointment.doctorName}</span>
                    </p>

                    <div>
                        <label className="mb-1.5 block text-xs text-slate-500">دلیل لغو *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            placeholder="مثال: درخواست بیمار، تداخل برنامه پزشک..."
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        تأیید لغو
                    </button>
                </div>
            </div>
        </div>
    );
}
