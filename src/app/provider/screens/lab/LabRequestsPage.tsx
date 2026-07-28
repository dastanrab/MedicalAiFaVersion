import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Eye, FileUp } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    PageHeader,
    EmptyState,
    formatPrice,
} from '../../components';
import { AddLabResultModal } from '../../components/AddLabResultModal';
import { useLabStore } from '../../store/labStore';
import { useProviderSession } from '../../store/providerAuthStore';
import {
    labResultEligibleStatuses,
    type LabRequestStatus,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';

// دیکشنری وضعیت‌های درخواست
const statusLabels: Record<number, string> = {
    0: 'درخواست جدید',
    1: 'در انتظار پرداخت',
    2: 'در انتظار نمونه‌گیری',
    3: 'در انتظار اعلام نتیجه',
    4: 'تکمیل شده',
    5: 'انجام شده',
    6: 'لغو شده',
};

// گزینه‌های فیلتر وضعیت بر اساس دیکشنری بالا
const statusFilterOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(statusLabels).map(([value, label]) => ({
        value,
        label,
    })),
];

// استایل اختصاصی برای هر وضعیت (Badge)
const getStatusBadgeStyle = (status: number): string => {
    switch (status) {
        case 0:
            return 'bg-blue-50 text-blue-700 border-blue-200';
        case 1:
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case 2:
            return 'bg-orange-50 text-orange-700 border-orange-200';
        case 3:
            return 'bg-purple-50 text-purple-700 border-purple-200';
        case 4:
        case 5:
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 6:
            return 'bg-rose-50 text-rose-700 border-rose-200';
        default:
            return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

// نگاشت وضعیت دیتابیس به وضعیت‌های رشته‌ای داخلی (جهت سازگاری با store و مودال)
const mapApiStatusToLocal = (status: number): LabRequestStatus => {
    switch (status) {
        case 0:
            return 'new';
        case 1:
        case 2:
            return 'accepted';
        case 3:
            return 'in_progress';
        case 4:
        case 5:
            return 'completed';
        case 6:
            return 'cancelled';
        default:
            return 'new';
    }
};

// تایپ پاسخ API
interface ApiRequestItem {
    request_id: number;
    visit_type: number | null;
    request_status: number;
    total_price: string;
    request_date: string;
    user_id: number;
    user_name: string;
    user_phone: string;
    prescription_type_id: number;
    prescription_details: { code: string; files: string[] };
    tests: Array<{
        lab_request_id: number;
        test_pack_id: number;
        test_name: string;
        test_price: string | null;
    }>;
}

export function LabRequestsPage() {
    const requests = useLabStore((s) => s.requests);
    const setRequests = useLabStore((s) => s.setRequests);
    const addResult = useLabStore((s) => s.addResult);

    // دریافت سشن مربوط به آزمایشگاه
    const labSession = useProviderSession('lab');
    const token = labSession?.token || '';

    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [type, setType] = useState<string>('all');
    const [resultRequest, setResultRequest] = useState<any | null>(null);

    useEffect(() => {
        const fetchRequests = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch('http://185.222.163.113:7000/api/owner/lab/requests', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                });
                const result = await response.json();

                if (result.status && result.data) {
                    const mappedRequests = result.data.map((item: ApiRequestItem) => ({
                        id: item.request_id,
                        code: `REQ-${item.request_id}`,
                        patientName: item.user_name || 'نامشخص',
                        patientPhone: item.user_phone || '-',
                        nationalCode: '-',
                        tests:
                            item.tests?.map((t) => ({
                                name: t.test_name,
                                price: parseFloat(t.test_price || '0'),
                            })) || [],
                        scheduledDate: item.request_date,
                        totalPrice: parseFloat(item.total_price || '0'),
                        type: item.visit_type === 0 ? 'home' : 'in_person',
                        statusCode: item.request_status, // ذخیره کد وضعیت سرور
                        status: mapApiStatusToLocal(item.request_status),
                        prescriptionType:
                            item.prescription_type_id === 2
                                ? 'digital'
                                : item.prescription_type_id === 3
                                    ? 'file'
                                    : 'none',
                        prescriptionCode: item.prescription_details?.code || '',
                        prescriptionFiles: item.prescription_details?.files || [],
                        timeline: [],
                    }));

                    setRequests(mappedRequests);
                }
            } catch (error) {
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [setRequests, token]);

    const filtered = useMemo(() => {
        return requests.filter((r: any) => {
            if (status !== 'all' && String(r.statusCode) !== status && r.status !== status) {
                return false;
            }
            if (type !== 'all' && r.type !== type) return false;
            const q = search.trim();
            if (!q) return true;
            return (
                r.patientName?.includes(q) ||
                r.nationalCode?.includes(q) ||
                r.code?.includes(q)
            );
        });
    }, [requests, search, status, type]);

    if (loading) {
        return (
            <div className="flex h-40 items-center justify-center text-slate-500">
                در حال دریافت اطلاعات...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="درخواست‌های آزمایش"
                description="لیست، فیلتر و مدیریت درخواست‌ها"
            />

            <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="نام، کد ملی، شماره درخواست..."
                />
                <FilterSelect
                    label="وضعیت"
                    value={status}
                    onChange={setStatus}
                    options={statusFilterOptions}
                />
                <FilterSelect
                    label="نوع"
                    value={type}
                    onChange={setType}
                    options={[
                        { value: 'all', label: 'همه' },
                        { value: 'in_person', label: 'حضوری' },
                        { value: 'home', label: 'در منزل' },
                    ]}
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState message="درخواستی یافت نشد." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[800px] text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 text-right font-semibold">کد</th>
                            <th className="px-4 py-3 text-right font-semibold">بیمار</th>
                            <th className="px-4 py-3 text-right font-semibold">آزمایش‌ها</th>
                            <th className="px-4 py-3 text-right font-semibold">تاریخ</th>
                            <th className="px-4 py-3 text-right font-semibold">مبلغ</th>
                            <th className="px-4 py-3 text-right font-semibold">نوع</th>
                            <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                            <th className="px-4 py-3 text-right font-semibold">عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((r: any) => {
                            // امکان افزودن نتیجه در وضعیت‌های مجاز یا وضعیت «در انتظار اعلام نتیجه (3)»
                            const canAddResult =
                                labResultEligibleStatuses.includes(r.status) ||
                                r.statusCode === 3 ||
                                r.statusCode === 2;

                            return (
                                <tr
                                    key={r.id}
                                    className="border-t border-slate-100 hover:bg-slate-50/50"
                                >
                                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                                        {r.code}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-800">
                                            {r.patientName}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {r.patientPhone}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-xs leading-relaxed max-w-xs truncate">
                                        {r.tests?.map((t: any) => t.name).join('، ')}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500" dir="ltr">
                                        {r.scheduledDate}
                                    </td>
                                    <td className="px-4 py-3">{formatPrice(r.totalPrice)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-sm font-medium ${
                                                    r.type === 'home'
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                {r.type === 'home' ? 'در منزل' : 'حضوری'}
                                            </span>
                                    </td>

                                    {/* نمایش وضعیت به‌صورت Read-Only با استایل اختصاصی */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeStyle(
                                                    r.statusCode
                                                )}`}
                                            >
                                                {statusLabels[r.statusCode] || 'نامشخص'}
                                            </span>
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={providerPath('lab', `requests/${r.id}`)}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                            >
                                                <Eye className="h-4 w-4" />
                                                جزئیات
                                            </Link>
                                            <button
                                                type="button"
                                                disabled={!canAddResult}
                                                onClick={() => setResultRequest(r)}
                                                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <FileUp className="h-4 w-4" />
                                                نتیجه
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            <AddLabResultModal
                open={!!resultRequest}
                onClose={() => setResultRequest(null)}
                request={resultRequest}
                onSubmit={async (payload) => {
                    if (!resultRequest) return;
                    await addResult({
                        requestId: resultRequest.id,
                        status: payload.status,
                        file: payload.file,
                        notes: payload.notes,
                    });
                    setResultRequest(null);
                }}
            />
        </div>
    );
}
