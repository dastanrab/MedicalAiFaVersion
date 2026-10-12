import { useMemo, useRef, useState } from 'react';
import { FileCheck2, ShieldCheck, Upload } from 'lucide-react';
import { EmptyState, PageHeader, StatusBadge } from '../../../components';
import { showProviderError, showProviderSuccess } from '../../../utils/toast';
import {
    ALLOWED_RESULT_EXTENSIONS,
    ALLOWED_RESULT_MIME_TYPES,
    MAX_RESULT_FILE_SIZE_BYTES,
} from '../../../utils/validation';
import { staffLabStatusLabels, staffLabStatusStyles } from '../../config/staffStatusOptions';
import type { StaffLabRequest } from '../../data/mockStaffData';
import { useStaffDataStore } from '../../store/staffDataStore';
import { useStaffActivityLogger } from '../../store/staffStore';

/**
 * پذیرش فقط فایل جواب را آپلود می‌کند؛ مشاهده محتوا و انتشار برای بیمار با مسئول فنی (صاحب حساب) است.
 */
export function StaffLabResultsPage() {
    const log = useStaffActivityLogger('lab');
    const requests = useStaffDataStore((s) => s.labRequests);
    const updateLabRequest = useStaffDataStore((s) => s.updateLabRequest);
    const fileInput = useRef<HTMLInputElement>(null);
    const [target, setTarget] = useState<StaffLabRequest | null>(null);

    const pending = useMemo(() => requests.filter((r) => r.status === 'testing'), [requests]);
    const uploaded = useMemo(() => requests.filter((r) => r.status === 'result_uploaded'), [requests]);

    const pickFile = (r: StaffLabRequest) => {
        setTarget(r);
        fileInput.current?.click();
    };

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !target) return;
        if (!ALLOWED_RESULT_MIME_TYPES.includes(file.type)) {
            showProviderError('فقط فایل PDF یا تصویر مجاز است');
            return;
        }
        if (file.size > MAX_RESULT_FILE_SIZE_BYTES) {
            showProviderError('حجم فایل نباید بیشتر از ۵ مگابایت باشد');
            return;
        }
        updateLabRequest(target.id, { status: 'result_uploaded', resultFileName: file.name });
        log('آپلود فایل جواب', `${target.code} — ${target.patientName}`);
        showProviderSuccess('فایل جواب آپلود شد و برای تأیید مسئول فنی ارسال شد');
        setTarget(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="آپلود جواب" description="آپلود فایل جواب آزمایش برای تأیید مسئول فنی" />

            <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                    پس از آپلود، فایل جواب فقط برای مسئول فنی قابل مشاهده است و بعد از تأیید او برای بیمار منتشر می‌شود.
                </span>
            </div>

            <input
                ref={fileInput}
                type="file"
                accept={ALLOWED_RESULT_EXTENSIONS.join(',')}
                className="hidden"
                onChange={onFile}
            />

            <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">در انتظار آپلود جواب</h3>
                {pending.length === 0 ? (
                    <EmptyState message="درخواستی در انتظار آپلود جواب نیست." />
                ) : (
                    <ResultTable
                        rows={pending}
                        action={(r) => (
                            <button
                                type="button"
                                onClick={() => pickFile(r)}
                                className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-400"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                آپلود فایل
                            </button>
                        )}
                    />
                )}
            </section>

            <section className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">آپلود شده</h3>
                {uploaded.length === 0 ? (
                    <EmptyState message="هنوز فایلی آپلود نشده است." />
                ) : (
                    <ResultTable
                        rows={uploaded}
                        action={(r) => (
                            <span className="flex items-center gap-1 text-xs text-emerald-700">
                                <FileCheck2 className="h-3.5 w-3.5" />
                                {r.resultFileName}
                            </span>
                        )}
                    />
                )}
            </section>
        </div>
    );
}

function ResultTable({
    rows,
    action,
}: {
    rows: StaffLabRequest[];
    action: (r: StaffLabRequest) => React.ReactNode;
}) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">آزمایش‌ها</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id} className="border-t border-slate-100">
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{r.code}</td>
                            <td className="px-4 py-3 font-medium text-slate-800">{r.patientName}</td>
                            <td className="px-4 py-3 text-slate-600" dir="ltr">{r.tests.join('، ')}</td>
                            <td className="px-4 py-3">
                                <StatusBadge label={staffLabStatusLabels[r.status]} className={staffLabStatusStyles[r.status]} />
                            </td>
                            <td className="px-4 py-3">{action(r)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
