import { useState } from 'react';
import { Upload, Send } from 'lucide-react';
import { PageHeader } from '../../components';
import { mockLabResults } from '../../data/mockData';

export function LabResultsPage() {
    const [results, setResults] = useState(mockLabResults);

    const markSent = (id: number) => {
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, sent: true } : r)));
    };

    return (
        <div className="space-y-6">
            <PageHeader title="نتایج آزمایش" description="آپلود PDF و ارسال به بیمار" />

            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/30 p-8 text-center">
                <Upload className="mx-auto h-10 w-10 text-amber-500" />
                <p className="mt-3 text-sm font-medium text-slate-700">آپلود فایل PDF نتیجه</p>
                <p className="mt-1 text-xs text-slate-500">فایل را اینجا رها کنید یا کلیک کنید (نمایشی)</p>
                <button type="button" className="mt-4 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white">
                    انتخاب فایل
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold">کد درخواست</th>
                            <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold">تاریخ آپلود</th>
                            <th className="px-4 py-3 text-right font-semibold">وضعیت ارسال</th>
                            <th className="px-4 py-3 text-right font-semibold" />
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((r) => (
                            <tr key={r.id} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-mono text-xs">{r.requestCode}</td>
                                <td className="px-4 py-3">{r.patientName}</td>
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
                                            onClick={() => markSent(r.id)}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            ارسال به بیمار
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
