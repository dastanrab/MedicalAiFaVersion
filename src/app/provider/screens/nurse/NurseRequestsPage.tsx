import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowDownUp, Eye, Loader2, CheckCircle } from 'lucide-react';
import {
    FilterSelect,
    SearchInput,
    StatusBadge,
    PageHeader,
    EmptyState,
    Timeline,
    formatPrice,
} from '../../components';
import { ProviderPagination } from '../../components/ProviderPagination';
import {
    nurseStatusLabels,
    nurseStatusStyles,
} from '../../config/statusOptions';
import { providerPath } from '../../config/providerNav';
import { nurseServiceLabels } from '../../data/mockData';
import type { NurseRequest } from '../../data/mockData';

import { useProviderSession } from '../../store/providerAuthStore';

const PAGE_SIZE = 8;
const API_BASE_URL = 'http://185.222.163.113:7000/api/owner/medical-center';

const statusOptions = [
    { value: 'all', label: 'همه' },
    ...Object.entries(nurseStatusLabels).map(([value, label]) => ({ value, label })),
];

export function NurseRequestsPage() {
    const session = useProviderSession('nurse');
    const token = session?.token || '';

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{
        items: NurseRequest[];
        total: number;
        totalPages: number;
    }>({ items: [], total: 0, totalPages: 1 });

    const load = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: String(page),
                pageSize: String(PAGE_SIZE),
                sortOrder,
                ...(search && { search }),
                ...(status !== 'all' && { status }),
                ...(patientName && { patientName }),
                ...(patientPhone && { patientPhone }),
                ...(dateFrom && { dateFrom }),
                ...(dateTo && { dateTo }),
            });

            const res = await fetch(`${API_BASE_URL}/requests?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const json = await res.json();

            if (json.success) {
                setResult(json.data);
            }
        } catch (error) {
            console.error("خطا در دریافت لیست:", error);
        } finally {
            setLoading(false);
        }
    }, [page, sortOrder, search, status, patientName, patientPhone, dateFrom, dateTo, token]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [search, status, patientName, patientPhone, dateFrom, dateTo, sortOrder]);

    const toggleSort = () => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'));

    return (
        <div className="space-y-6">
            <PageHeader title="لیست درخواست‌ها" description="تمام درخواست‌های پرستاری با فیلتر و صفحه‌بندی" />

            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
                <SearchInput value={search} onChange={setSearch} placeholder="جستجوی سریع..." />
                <FilterSelect label="وضعیت" value={status} onChange={setStatus} options={statusOptions} />
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">نام بیمار</label>
                    <input
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="نام بیمار..."
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">موبایل بیمار</label>
                    <input
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="09..."
                        dir="ltr"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dir-ltr text-left"
                    />
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                    <button
                        type="button"
                        onClick={toggleSort}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        <ArrowDownUp className="h-4 w-4" />
                        مرتب‌سازی: {sortOrder === 'desc' ? 'جدیدترین' : 'قدیمی‌ترین'}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : result.items.length === 0 ? (
                <EmptyState message="درخواستی یافت نشد." />
            ) : (
                <>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">کد</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">بیمار</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">موبایل</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">تاریخ</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">وضعیت</th>
                                <th className="px-4 py-3" />
                            </tr>
                            </thead>
                            <tbody>
                            {result.items.map((r) => (
                                <tr key={r.id} className="border-t border-slate-100">
                                    <td className="px-4 py-3 font-mono text-xs">{r.code}</td>
                                    <td className="px-4 py-3">{r.patientName}</td>
                                    <td className="px-4 py-3 dir-ltr text-left text-xs">{r.patientPhone}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{r.scheduledDate} - {r.scheduledTime}</td>
                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            label={nurseStatusLabels[r.status] || r.status}
                                            className={nurseStatusStyles[r.status] || ''}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={providerPath('nurse', `requests/${r.id}`)}
                                            className="inline-flex items-center gap-1 text-rose-600 hover:underline"
                                        >
                                            <Eye className="h-4 w-4" />
                                            جزئیات
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <ProviderPagination
                        page={page}
                        totalPages={result.totalPages}
                        total={result.total}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}

// --- صفحه جزئیات ---


export function NurseRequestDetailPage() {
    const { id } = useParams<{ id: string }>();
    const session = useProviderSession('nurse');
    const token = session?.token || '';

    const [request, setRequest] = useState<NurseRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // استیت‌های مربوط به انتخاب پرسنل
    const [staffList, setStaffList] = useState<{ id: number; name: string }[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string>('');

    // استیت گزارش
    const [report, setReport] = useState({
        duration_minutes: '45',
        services_performed: '',
        patient_condition: '',
        recommendations: '',
        needs_followup: false,
    });

    const fetchDetail = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/requests/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const json = await res.json();
            if (json.success || json.status) {
                setRequest(json.data);
            }
        } catch (error) {
            console.error("خطا در دریافت جزئیات:", error);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    // دریافت لیست پرسنل (پرستاران) مرکز درمانی
    const fetchStaffs = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/staff`, { // آدرس فرضی لیست پرسنل شما
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const json = await res.json();
            if (json.success || json.status) {
                // فرض می‌کنیم دیتا در json.data.items یا json.data است
                setStaffList(json.data.items || json.data || []);
            }
        } catch (error) {
            console.error("خطا در دریافت لیست پرسنل:", error);
        }
    }, [token]);

    useEffect(() => {
        if (id) {
            fetchDetail();
            fetchStaffs();
        }
    }, [id, fetchDetail, fetchStaffs]);

    // تابع تغییر وضعیت عمومی
    const handleStatusChange = async (newStatus: string) => {
        if (!confirm('آیا از تغییر وضعیت اطمینان دارید؟')) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
                method: 'PUT', // یا POST بر اساس روت لاراول شما
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            const json = await res.json();
            if (json.success || json.status) {
                fetchDetail(); // ریفرش کردن جزئیات
            } else {
                alert(json.message || 'خطا در تغییر وضعیت');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    // تابع اختصاص پرستار (وقتی وضعیت pending_nurse است)
    const handleAssignStaff = async () => {
        if (!selectedStaff) {
            alert('لطفاً یک پرستار را انتخاب کنید.');
            return;
        }
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/requests/${id}/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ staff_id: Number(selectedStaff) })
            });
            const json = await res.json();
            if (json.success || json.status) {
                alert('پرستار با موفقیت اختصاص داده شد.');
                fetchDetail(); // ریفرش اطلاعات
            } else {
                alert(json.message || 'خطا در تخصیص پرستار');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    // تابع ثبت گزارش
    const handleSubmitReport = async () => {
        if (!report.services_performed || !report.patient_condition) {
            alert('لطفاً خدمات انجام‌شده و وضعیت بیمار را وارد کنید.');
            return;
        }
        setActionLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/requests/${id}/report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    duration_minutes: Number(report.duration_minutes),
                    services_performed: report.services_performed,
                    patient_condition: report.patient_condition,
                    recommendations: report.recommendations,
                    needs_followup: report.needs_followup
                })
            });
            const json = await res.json();
            if (json.success || json.status) {
                alert('گزارش با موفقیت ثبت شد.');
                fetchDetail();
            } else {
                alert(json.message || 'خطا در ثبت گزارش');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (!request) return <EmptyState message="درخواست یافت نشد." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title={request.code}
                actions={
                    <Link to={providerPath('nurse', 'requests')} className="text-sm text-slate-500 hover:text-slate-800">
                        بازگشت به لیست
                    </Link>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    {/* اطلاعات اصلی */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                        <Row label="بیمار" value={request.patientName} />
                        <Row label="موبایل" value={request.patientPhone} />
                        <Row label="خدمت" value={request.serviceType} />
                        <Row label="تاریخ" value={request.scheduledDate} />
                        <Row label="ساعت" value={request.scheduledTime} />
                        <Row label="مبلغ" value={`${formatPrice(request.amount)} تومان`} />
                        {request.assignedStaff && (
                            <Row label="پرستار اختصاص یافته" value={`${request.assignedStaff.name} (${request.assignedStaff.mobile})`} />
                        )}
                        {request.note && <Row label="توضیحات" value={request.note} />}
                    </div>

                    {/* اطلاعات تکمیلی (extra_info) */}
                    {request.extra_info && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                            <p className="mb-3 text-sm font-semibold text-slate-700">اطلاعات تکمیلی بیمار</p>
                            <Row label="وضعیت بیمار" value={request.extra_info.condition || 'ثبت نشده'} />
                            <Row label="جنسیت درخواستی پرستار" value={
                                request.extra_info.gender_pref === 'male' ? 'آقا' :
                                    request.extra_info.gender_pref === 'female' ? 'خانم' : 'فرقی نمیکند'
                            } />
                            <Row label="اورژانسی" value={request.extra_info.is_urgent ? 'بله (نیاز فوری)' : 'خیر (عادی)'} />
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-500 mb-1">آدرس ثبت شده برای این درخواست:</p>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                    {request.extra_info.custom_address || request.address || 'آدرسی ثبت نشده است'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* فرم ثبت گزارش (فقط visited) */}
                    {request.status === 'visited' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="mb-4 text-sm font-semibold text-slate-700">ثبت گزارش ویزیت</p>
                            <div className="grid gap-3 md:grid-cols-2">
                                <input
                                    placeholder="مدت (دقیقه)"
                                    type="number"
                                    value={report.duration_minutes}
                                    onChange={(e) => setReport({ ...report, duration_minutes: e.target.value })}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={report.needs_followup}
                                        onChange={(e) => setReport({ ...report, needs_followup: e.target.checked })}
                                    />
                                    نیاز به پیگیری مجدد دارد
                                </label>
                                <textarea
                                    placeholder="خدمات انجام‌شده (الزامی)"
                                    value={report.services_performed}
                                    onChange={(e) => setReport({ ...report, services_performed: e.target.value })}
                                    className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    rows={2}
                                />
                                <textarea
                                    placeholder="وضعیت بیمار (الزامی)"
                                    value={report.patient_condition}
                                    onChange={(e) => setReport({ ...report, patient_condition: e.target.value })}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    rows={2}
                                />
                                <textarea
                                    placeholder="توصیه‌ها"
                                    value={report.recommendations}
                                    onChange={(e) => setReport({ ...report, recommendations: e.target.value })}
                                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                                    rows={2}
                                />
                                <button
                                    onClick={handleSubmitReport}
                                    disabled={actionLoading}
                                    className="md:col-span-2 flex justify-center items-center gap-2 rounded-xl bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    ثبت گزارش و تکمیل فرآیند
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-4">
                            <StatusBadge
                                label={nurseStatusLabels[request.status] || request.status}
                                className={nurseStatusStyles[request.status] || ''}
                            />
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* اکشن: پرداخت */}
                            {request.status === 'pending_payment' && (
                                <button onClick={() => handleStatusChange('pending_nurse')} disabled={actionLoading} className="rounded-xl border border-slate-200 py-2 text-sm hover:bg-slate-50">تایید پرداخت</button>
                            )}

                            {/* اکشن: انتخاب و انتصاب پرستار */}
                            {request.status === 'pending_nurse' && (
                                <div className="space-y-2 rounded-xl bg-blue-50/50 p-3 border border-blue-100">
                                    <label className="text-xs font-semibold text-blue-800">انتخاب پرستار جهت اعزام:</label>
                                    <select
                                        className="w-full text-sm border-slate-200 rounded-lg p-2"
                                        value={selectedStaff}
                                        onChange={(e) => setSelectedStaff(e.target.value)}
                                        disabled={actionLoading}
                                    >
                                        <option value="">-- انتخاب کنید --</option>
                                        {staffList.map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssignStaff}
                                        disabled={actionLoading || !selectedStaff}
                                        className="w-full rounded-lg bg-blue-600 text-white py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {actionLoading ? 'درحال ثبت...' : 'تایید و اعزام پرستار'}
                                    </button>
                                </div>
                            )}

                            {/* اکشن: ثبت مراجعه */}
                            {request.status === 'pending_visit' && (
                                <button onClick={() => handleStatusChange('visited')} disabled={actionLoading} className="rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-sm hover:bg-emerald-100 text-emerald-800">
                                    تایید مراجعه پرستار (visited)
                                </button>
                            )}

                            {/* اکشن: لغو */}
                            {['pending_payment', 'pending_nurse', 'pending_visit'].includes(request.status) && (
                                <button onClick={() => handleStatusChange('canceled')} disabled={actionLoading} className="mt-2 rounded-xl border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50">لغو درخواست</button>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-sm font-semibold">تاریخچه</p>
                        <Timeline entries={request.timeline || []} />
                    </div>
                </div>
            </div>
        </div>
    );
}


function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 border-b border-slate-50 py-2 text-sm last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800 text-right">{value}</span>
        </div>
    );
}
