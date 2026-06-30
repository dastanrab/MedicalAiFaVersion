import { useState, useEffect } from 'react';
import { Send, FileText, X, Eye, Activity } from 'lucide-react';
import { PageHeader } from '../../components';
import {useProviderSession} from "../../store/providerAuthStore";

interface ResultFile {
    result_id: number;
    file_path: string;
    file_name: string | null;
    mime_type: string | null;
    status: number;
    note: string | null;
}

interface GroupedTestResult {
    test_pack_id: number;
    test_name: string;
    request_id: number;
    request_code: string;
    patient_name: string;
    uploaded_at: string;
    all_sent: boolean;
    files: ResultFile[];
}

export function LabResultsPage() {
    const labSession = useProviderSession('lab');
    const [results, setResults] = useState<GroupedTestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState<ResultFile | null>(null);

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://185.222.163.113:7000/api/owner/lab/results', {
                headers: {
                    'Authorization': `Bearer ${labSession?.token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.status) {
                setResults(data.data);
            }
        } catch (err) {
            console.error('خطا در دریافت نتایج', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsSent = async (testPackId: number) => {
        alert(`تغییر وضعیت ارسال برای آزمایش ${testPackId} ...`);
    };

    const getFullFileUrl = (path: string) => {
        return path.startsWith('http') ? path : `http://185.222.163.113:7000${path}`;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="نتایج آزمایش‌ها"
                description="فایل‌های نتیجه تفکیک‌شده بر اساس هر آزمایش (از درخواست‌های تکمیل‌شده)"
            />

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="px-4 py-3 text-right font-semibold">درخواست</th>
                        <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                        <th className="px-4 py-3 text-right font-semibold">نام آزمایش</th>
                        <th className="px-4 py-3 text-right font-semibold">فایل‌های ضمیمه</th>
                        <th className="px-4 py-3 text-right font-semibold">تاریخ آپلود</th>
                        <th className="px-4 py-3 text-right font-semibold">وضعیت ارسال</th>
                        <th className="px-4 py-3 text-right font-semibold">عملیات</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                در حال بارگذاری...
                            </td>
                        </tr>
                    ) : results.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                هنوز نتیجه‌ای ثبت نشده است
                            </td>
                        </tr>
                    ) : (
                        results.map((r) => {
                            const jalaliDate = new Intl.DateTimeFormat('fa-IR-u-nu-latn').format(new Date(r.uploaded_at));
                            return (
                                <tr key={r.test_pack_id} className="border-t border-slate-100 align-top">
                                    <td className="px-4 py-4 font-mono text-xs">{r.request_code}</td>
                                    <td className="px-4 py-4">{r.patient_name}</td>
                                    <td className="px-4 py-4 font-medium text-slate-800">
                                        <div className="flex items-center gap-1">
                                            <Activity className="h-4 w-4 text-amber-500" />
                                            {r.test_name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 space-y-2">
                                        {r.files.map(file => (
                                            <div key={file.result_id} className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            {file.file_name ?? 'فایل'}
                                                        </span>
                                                    <button
                                                        onClick={() => setPreviewFile(file)}
                                                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        نمایش
                                                    </button>
                                                </div>
                                                {file.note && <span className="text-[10px] text-slate-400 block">{file.note}</span>}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="px-4 py-4 text-slate-500 text-xs">{jalaliDate}</td>
                                    <td className="px-4 py-4">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                r.all_sent ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {r.all_sent ? 'ارسال شده' : 'آماده ارسال'}
                                            </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        {!r.all_sent && (
                                            <button
                                                type="button"
                                                onClick={() => handleMarkAsSent(r.test_pack_id)}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline"
                                            >
                                                <Send className="h-3.5 w-3.5" />
                                                ارسال نتیجه
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* مودال پیش‌نمایش فایل (بدون تغییر نسبت به قبل) */}
            {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: '90vh' }}>
                        <div className="flex items-center justify-between border-b border-slate-100 p-4">
                            <h3 className="font-semibold text-slate-800">
                                پیش‌نمایش {previewFile.file_name ?? 'فایل'}
                            </h3>
                            <button
                                onClick={() => setPreviewFile(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto bg-slate-50 p-4 relative flex items-center justify-center min-h-[400px]">
                            {previewFile.mime_type?.startsWith('image/') ? (
                                <img
                                    src={getFullFileUrl(previewFile.file_path)}
                                    alt="Result Preview"
                                    className="max-w-full max-h-full object-contain rounded"
                                />
                            ) : previewFile.mime_type === 'application/pdf' ? (
                                <iframe
                                    src={getFullFileUrl(previewFile.file_path)}
                                    className="w-full h-full min-h-[60vh] border-0 rounded"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="text-center text-slate-500">
                                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                                    <p>امکان پیش‌نمایش این فرمت فایل وجود ندارد.</p>
                                    <a
                                        href={getFullFileUrl(previewFile.file_path)}
                                        target="_blank"
                                        download
                                        className="mt-4 inline-block text-blue-500 hover:underline"
                                    >
                                        دانلود فایل
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
