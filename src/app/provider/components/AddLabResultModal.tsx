import { useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { ProviderModal, ProviderFormField, inputClass } from './ProviderModal';
import {
    labManageableStatuses,
    labStatusLabels,
    type LabRequestStatus,
} from '../config/statusOptions';
import type { LabRequest } from '../data/mockData';
import { validateResultFile } from '../utils/validation';

interface AddLabResultModalProps {
    open: boolean;
    onClose: () => void;
    request: LabRequest | null;
    onSubmit: (payload: {
        status: LabRequestStatus;
        file: File;
        notes?: string;
    }) => Promise<void>;
}

export function AddLabResultModal({ open, onClose, request, onSubmit }: AddLabResultModalProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState<LabRequestStatus>('completed');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const reset = () => {
        setStatus('completed');
        setNotes('');
        setFile(null);
        setFileError('');
        setSubmitError('');
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (!picked) {
            setFile(null);
            setFileError('');
            return;
        }
        const err = validateResultFile(picked);
        if (err) {
            setFile(null);
            setFileError(err);
            return;
        }
        setFile(picked);
        setFileError('');
    };

    const handleSubmit = async () => {
        setSubmitError('');
        if (!file) {
            setFileError('انتخاب فایل نتیجه الزامی است');
            return;
        }
        setLoading(true);
        try {
            await onSubmit({ status, file, notes: notes.trim() || undefined });
            handleClose();
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : 'خطا در ثبت نتیجه');
        } finally {
            setLoading(false);
        }
    };

    if (!request) return null;

    return (
        <ProviderModal
            open={open}
            onClose={handleClose}
            title="افزودن نتیجه آزمایش"
            description={`درخواست ${request.code} — ${request.patientName}`}
            size="lg"
            footer={
                <>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        ثبت نتیجه
                    </button>
                </>
            }
        >
            <div className="grid gap-4">
                <ProviderFormField label="وضعیت درخواست" required>
                    <select
                        className={inputClass}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as LabRequestStatus)}
                    >
                        {labManageableStatuses.map((s) => (
                            <option key={s} value={s}>
                                {labStatusLabels[s]}
                            </option>
                        ))}
                    </select>
                </ProviderFormField>

                <ProviderFormField label="فایل نتیجه (PDF یا تصویر)" required error={fileError}>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {file ? (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-emerald-800">
                                <FileText className="h-4 w-4" />
                                <span className="truncate">{file.name}</span>
                                <span className="text-xs text-emerald-600">
                                    ({(file.size / 1024).toFixed(0)} KB)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setFile(null);
                                    if (fileRef.current) fileRef.current.value = '';
                                }}
                                className="text-emerald-600 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/40 px-4 py-8 text-sm text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                            <Upload className="h-8 w-8 text-amber-500" />
                            <span>انتخاب فایل PDF یا تصویر</span>
                            <span className="text-xs text-slate-400">حداکثر ۵ مگابایت</span>
                        </button>
                    )}
                </ProviderFormField>

                <ProviderFormField label="توضیحات نتیجه (اختیاری)">
                    <textarea
                        className={inputClass}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        placeholder="یادداشت برای بیمار یا پزشک..."
                    />
                </ProviderFormField>
            </div>
            {submitError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                </div>
            )}
        </ProviderModal>
    );
}
