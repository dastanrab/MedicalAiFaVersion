import { Send, FileText } from 'lucide-react';
import { PageHeader } from '../../components';
import { useLabStore } from '../../store/labStore';

export function LabResultsPage() {
    const results = useLabStore((s) => s.results);
    const requests = useLabStore((s) => s.requests);
    const markResultSent = useLabStore((s) => s.markResultSent);

    return (
        <div className="space-y-6">
            <PageHeader
                title="نتایج آزمایش"
                description="نتایج ثبت‌شده از درخواست‌ها — برای افزودن نتیجه به صفحه درخواست‌ها بروید"
            />

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-amber-800">
                برای ثبت نتیجه جدید، از صفحه «درخواست‌های آزمایش» روی «افزودن نتیجه» کلیک کنید.
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold">کد درخواست</th>
                            <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold">فایل</th>
                            <th className="px-4 py-3 text-right font-semibold">تاریخ آپلود</th>
                            <th className="px-4 py-3 text-right font-semibold">وضعیت ارسال</th>
                            <th className="px-4 py-3 text-right font-semibold">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                                    هنوز نتیجه‌ای ثبت نشده است
                                </td>
                            </tr>
                        ) : (
                            results.map((r) => {
                                const req = requests.find((x) => x.id === r.requestId);
                                return (
                                    <tr key={r.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3 font-mono text-xs">{r.requestCode}</td>
                                        <td className="px-4 py-3">{r.patientName}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                                <FileText className="h-3.5 w-3.5" />
                                                {r.fileName ?? '—'}
                                            </span>
                                            {r.notes && (
                                                <p className="mt-1 text-xs text-slate-400">{r.notes}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{r.uploadedAt}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    r.sent
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-amber-50 text-amber-700'
                                                }`}
                                            >
                                                {r.sent ? 'ارسال شده' : 'آماده ارسال'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {!r.sent && (
                                                <button
                                                    type="button"
                                                    onClick={() => markResultSent(r.id)}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
                                                >
                                                    <Send className="h-3.5 w-3.5" />
                                                    ارسال به بیمار
                                                </button>
                                            )}
                                            {req?.result?.fileUrl && (
                                                <a
                                                    href={req.result.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mr-3 text-xs text-slate-500 hover:text-amber-600"
                                                >
                                                    مشاهده
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
