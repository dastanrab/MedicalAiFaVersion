import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
    ClipboardList,
    Stethoscope,
    TestTube2,
    Pill,
    Scan,
    HeartHandshake,
    ChevronLeft,
    MapPin,
    CalendarClock,
    Building2,
    PackageOpen,
    Loader2,
    CreditCard,
    ShoppingBag,
    FileText,
    Download,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Card } from '../components/ui/card';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '../components/ui/sheet';
import { useAuthStore } from '../store/authStore';
import {
    formatOrderPrice,
    serviceTypeLabels,
    statusGroupLabels,
    type UserRequestOrder,
    type UserRequestServiceType,
    type UserRequestStatusGroup,
} from '../data/userOrdersMockData';

/* ───────────────────── نگاشت‌های مورد نیاز ───────────────────── */
const serviceTypeMap: Record<string, UserRequestServiceType> = {
    doctor: 'consultation',
    lab: 'lab',
    pharmacy: 'pharmacy',
    nurse: 'nurse',
};

const mapToStatusGroup = (type: string, rawStatus: string | number): UserRequestStatusGroup => {
    const s = typeof rawStatus === 'string' ? rawStatus : Number(rawStatus);
    switch (type) {
        case 'doctor':
            if (s === 'cancelled') return 'cancelled';
            return 'active';
        case 'lab':
            if (s === 4 || s === 5) return 'completed';
            if (s === 6) return 'cancelled';
            return 'active';
        case 'pharmacy':
            if (s === 5 || s === 6) return 'completed';
            if (s === 7) return 'cancelled';
            return 'active';
        case 'nurse':
            if (s === 4) return 'completed';
            if (s === 5) return 'cancelled';
            return 'active';
        default:
            return 'active';
    }
};

const getStatusClass = (group: UserRequestStatusGroup): string => {
    switch (group) {
        case 'active': return 'bg-blue-50 text-blue-600 ring-blue-200';
        case 'completed': return 'bg-emerald-50 text-emerald-600 ring-emerald-200';
        case 'cancelled': return 'bg-red-50 text-red-600 ring-red-200';
        default: return 'bg-gray-50 text-gray-600 ring-gray-200';
    }
};

const toJalaliDate = (iso: string): string => {
    try {
        return new Date(iso).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return iso;
    }
};

/* ───────────────────── اینترفیس‌ها ───────────────────── */
interface ApiOrder {
    id: number;
    status: string | number;
    price: number;
    created_at: string;
    name: string;
    detail: string;
    type: 'doctor' | 'lab' | 'pharmacy' | 'nurse';
    status_label: string;
}

interface ApiOrdersResponse {
    success: boolean;
    data: {
        orders: ApiOrder[];
        count_doctor: number;
        count_lab: number;
        count_pharmacy: number;
        count_nurse: number;
    };
}

interface NurseRequestDetail {
    id: number;
    status: number;
    total_price: number;
    center_name: string;
    staff: { name: string; mobile: string } | null;
    services: { service_name: string; price: number }[];
    extra_info: {
        condition?: string;
        is_urgent?: boolean;
        custom_address?: string;
        report?: {
            duration_minutes: number;
            services_performed: string;
            patient_condition: string;
            recommendations: string;
            needs_followup: boolean;
        }
    };
}

interface PharmacyRequestDetail {
    id: number;
    status: number;
    status_label: string;
    total_price: number;
    created_at: string;
    pharmacy_name: string;
    medicines: {
        id: number;
        medicine_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        unit: string;
    }[];
}

// ساختار جزئیات درخواست آزمایشگاه (بر اساس API اصلاح‌شده)
interface LabRequestDetail {
    id: number;
    status: number;
    status_label: string;
    total_price: number;
    visit_type: number; // 0 = در منزل، 1 = حضوری
    visit_type_label: string;
    request_date: string;
    lab_name: string;
    address: string | null; // آدرس در صورت وجود
    tests: {
        id: number;
        test_name: string;
        price: number;
        result_file: string | null; // URL کامل فایل نتیجه
    }[];
}

/* ───────────────────── ثابت‌ها ───────────────────── */
const pageClass =
    'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

type ServiceFilter = 'all' | UserRequestServiceType;

const serviceFilters: { key: ServiceFilter; label: string }[] = [
    { key: 'all', label: 'همه' },
    { key: 'consultation', label: 'نوبت' },
    { key: 'lab', label: 'آزمایش' },
    { key: 'pharmacy', label: 'دارو' },
    { key: 'radiology', label: 'رادیولوژی' },
    { key: 'nurse', label: 'پرستاری' },
];

const statusGroups: UserRequestStatusGroup[] = ['all', 'active', 'completed', 'cancelled'];

const serviceIcons: Record<UserRequestServiceType, LucideIcon> = {
    consultation: Stethoscope,
    lab: TestTube2,
    pharmacy: Pill,
    radiology: Scan,
    nurse: HeartHandshake,
};

const serviceIconStyles: Record<UserRequestServiceType, string> = {
    consultation: 'bg-blue-50 text-blue-600',
    lab: 'bg-violet-50 text-violet-600',
    pharmacy: 'bg-emerald-50 text-emerald-600',
    radiology: 'bg-cyan-50 text-cyan-600',
    nurse: 'bg-rose-50 text-rose-600',
};

/* ───────────────────── صفحه اصلی ───────────────────── */
export function OrdersPage() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
    const [statusGroup, setStatusGroup] = useState<UserRequestStatusGroup>('all');
    const [selected, setSelected] = useState<UserRequestOrder | null>(null);

    const [orders, setOrders] = useState<UserRequestOrder[]>([]);
    const [counts, setCounts] = useState({ doctor: 0, lab: 0, pharmacy: 0, nurse: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // تابع بازخوانی لیست سفارش‌ها
    const fetchOrders = async () => {
        if (!accessToken) {
            setLoading(false);
            setError('توکن احراز هویت موجود نیست.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('http://185.222.163.113:7000/api/user/orders', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
            });
            if (!res.ok) throw new Error('خطا در دریافت داده‌ها. ممکن است توکن منقضی شده باشد.');
            const json: ApiOrdersResponse = await res.json();
            if (!json.success) throw new Error('پاسخ API نامعتبر است.');

            const mapped: UserRequestOrder[] = json.data.orders.map((item) => {
                const serviceType = serviceTypeMap[item.type] ?? 'lab';
                const group = mapToStatusGroup(item.type, item.status);
                return {
                    id: item.id,
                    serviceType,
                    status: group,
                    status_label: item.status_label,
                    title:
                        serviceType !== 'consultation'
                            ? serviceTypeLabels[serviceType]
                            : `نوبت دکتر ${item.detail}`,
                    providerName: item.name,
                    summary: item.detail !== '-' ? item.detail : '',
                    amount: item.price,
                    code: `#ORD-${item.id}`,
                    scheduledAt: null,
                    createdAt: toJalaliDate(item.created_at),
                    updatedAt: null,
                    address: null,
                    details: [],
                };
            });

            setOrders(mapped);
            setCounts({
                doctor: json.data.count_doctor,
                lab: json.data.count_lab,
                pharmacy: json.data.count_pharmacy,
                nurse: json.data.count_nurse,
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [accessToken]);

    const filtered = useMemo(() => {
        return orders.filter((o) => {
            const typeOk = serviceFilter === 'all' || o.serviceType === serviceFilter;
            const statusOk = statusGroup === 'all' || o.status === statusGroup;
            return typeOk && statusOk;
        });
    }, [orders, serviceFilter, statusGroup]);

    const activeCount = useMemo(() => orders.filter((o) => o.status === 'active').length, [orders]);

    if (loading) {
        return (
            <div className={pageClass}>
                <AppBar backTo="/home" />
                <div className="flex flex-col items-center justify-center h-full pt-24">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="mt-3 text-sm text-gray-500">در حال بارگذاری سفارش‌ها…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={pageClass}>
                <AppBar backTo="/home" />
                <div className="flex flex-col items-center justify-center pt-24 px-4">
                    <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm max-w-sm text-center">
                        {error}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                    >
                        تلاش مجدد
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={pageClass}>
            <AppBar backTo="/home" />

            <div className="mx-auto w-full max-w-lg px-3 pb-6 pt-24 sm:px-4">
                <header className="mb-4 px-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">سفارش‌ها</h1>
                            <p className="text-xs text-gray-500">
                                تاریخچه درخواست‌ها به مراکز درمانی و وضعیت آن‌ها
                            </p>
                        </div>
                    </div>

                    {activeCount > 0 && (
                        <div className="mt-3 rounded-2xl bg-white px-3 py-2.5 text-xs text-gray-600 shadow-sm ring-1 ring-gray-100">
                            <span className="font-semibold text-blue-600">
                                {activeCount.toLocaleString('fa-IR')}
                            </span>{' '}
                            درخواست فعال در حال پیگیری دارید
                        </div>
                    )}
                </header>

                {/* فیلتر نوع سرویس */}
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {serviceFilters.map((item) => {
                        const active = serviceFilter === item.key;
                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setServiceFilter(item.key)}
                                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                                    active
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white text-gray-600 ring-1 ring-gray-100 hover:bg-gray-50'
                                }`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* گروه وضعیت */}
                <div className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
                    {statusGroups.map((group) => {
                        const active = statusGroup === group;
                        return (
                            <button
                                key={group}
                                type="button"
                                onClick={() => setStatusGroup(group)}
                                className={`rounded-xl py-2 text-xs font-medium transition-colors ${
                                    active
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {statusGroupLabels[group]}
                            </button>
                        );
                    })}
                </div>

                {filtered.length === 0 ? (
                    <EmptyOrders onBrowse={() => navigate('/services')} />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onOpen={() => setSelected(order)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <OrderDetailSheet
                order={selected}
                open={selected !== null}
                onOpenChange={(open) => {
                    if (!open) setSelected(null);
                }}
                onOrderUpdate={(updatedOrder) => {
                    // به‌روزرسانی سفارش در لیست
                    setOrders((prev) =>
                        prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
                    );
                }}
                refreshOrders={fetchOrders}
            />
        </div>
    );
}

/* ───────────────────── کارت سفارش ───────────────────── */
function OrderCard({ order, onOpen }: { order: UserRequestOrder; onOpen: () => void }) {
    const Icon = serviceIcons[order.serviceType];
    const statusClass = getStatusClass(order.status);

    return (
        <button type="button" onClick={onOpen} className="block w-full text-right">
            <Card
                dir="rtl"
                className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${serviceIconStyles[order.serviceType]}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                {serviceTypeLabels[order.serviceType]}
                            </span>
                            <span
                                className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusClass}`}
                            >
                                {order.status_label}
                            </span>
                        </div>

                        <h3 className="mt-2 text-sm font-bold leading-snug text-gray-900">
                            {order.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{order.providerName}</span>
                        </p>
                        {order.summary && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-gray-400">
                                {order.summary}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                        {order.amount != null && (
                            <p className="text-sm font-bold text-gray-900">
                                {formatOrderPrice(order.amount)} ت
                            </p>
                        )}
                        <ChevronLeft className="h-4 w-4 text-gray-300" />
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-50 pt-3 text-[11px] text-gray-500">
                    <span>کد: {order.code}</span>
                    {order.scheduledAt ? (
                        <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            {order.scheduledAt}
                        </span>
                    ) : (
                        <span>{order.createdAt}</span>
                    )}
                </div>
            </Card>
        </button>
    );
}

/* ───────────────────── شیت جزئیات (با پشتیبانی از آزمایشگاه) ───────────────────── */
function OrderDetailSheet({
                              order,
                              open,
                              onOpenChange,
                              onOrderUpdate,
                              refreshOrders,
                          }: {
    order: UserRequestOrder | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onOrderUpdate?: (updated: UserRequestOrder) => void;
    refreshOrders?: () => void;
}) {
    const { accessToken } = useAuthStore();

    // وضعیت‌های داروخانه، پرستاری، آزمایشگاه
    const [detailData, setDetailData] = useState<PharmacyRequestDetail | null>(null);
    const [nurseData, setNurseData] = useState<NurseRequestDetail | null>(null);
    const [labData, setLabData] = useState<LabRequestDetail | null>(null);

    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        if (!order) return;

        const fetchData = async () => {
            setDetailLoading(true);
            setDetailError(null);
            try {
                let url = '';
                if (order.serviceType === 'pharmacy') {
                    url = `http://185.222.163.113:7000/api/user/pharmacy-requests/${order.id}`;
                } else if (order.serviceType === 'nurse') {
                    url = `http://185.222.163.113:7000/api/user/medical-requests/${order.id}`;
                } else if (order.serviceType === 'lab') {
                    url = `http://185.222.163.113:7000/api/user/labs-requests/${order.id}`;
                } else {
                    setDetailLoading(false);
                    return;
                }

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json',
                    },
                });

                if (!res.ok) throw new Error('خطا در دریافت اطلاعات فاکتور');
                const json = await res.json();
                if (!json.success) throw new Error(json.message || 'پاسخ نامعتبر');

                if (order.serviceType === 'pharmacy') setDetailData(json.data);
                if (order.serviceType === 'nurse') setNurseData(json.data);
                if (order.serviceType === 'lab') setLabData(json.data);

            } catch (err: any) {
                setDetailError(err.message);
            } finally {
                setDetailLoading(false);
            }
        };

        // ریست کردن استیت‌ها
        setDetailData(null);
        setNurseData(null);
        setLabData(null);
        fetchData();
    }, [order?.id, order?.serviceType, accessToken]);

    // پرداخت برای آزمایشگاه
    const handleLabPay = async () => {
        if (!order || !labData) return;
        setPaying(true);
        try {
            const res = await fetch(`http://185.222.163.113:7000/api/user/labs-requests/${order.id}/pay`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || 'پرداخت ناموفق بود');
            }

            // به‌روزرسانی وضعیت محلی
            const updatedOrder: UserRequestOrder = {
                ...order,
                status: 'active',
                status_label: 'در انتظار نمونه‌گیری',
            };
            if (onOrderUpdate) onOrderUpdate(updatedOrder);

            // به‌روزرسانی labData
            setLabData((prev) => prev ? { ...prev, status: 2, status_label: 'در انتظار نمونه‌گیری' } : null);

            // بازخوانی لیست سفارش‌ها (اختیاری)
            if (refreshOrders) refreshOrders();

        } catch (err: any) {
            setDetailError(err.message);
        } finally {
            setPaying(false);
        }
    };

    if (!order) return null;

    const Icon = serviceIcons[order.serviceType];
    const statusClass = getStatusClass(order.status);

    // آیا باید دکمه پرداخت نمایش داده شود؟
    const showPayButton = order.serviceType === 'lab' && labData && labData.status === 1;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="max-h-[85vh] overflow-y-auto rounded-t-3xl border-gray-100 px-4 pb-8 pt-4 font-[YekanBakhFaNum]"
                dir="rtl"
            >
                <SheetHeader className="text-right">
                    <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
                    <div className="flex items-start gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${serviceIconStyles[order.serviceType]}`}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                    {serviceTypeLabels[order.serviceType]}
                                </span>
                                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusClass}`}>
                                    {order.status_label}
                                </span>
                            </div>
                            <SheetTitle className="mt-2 text-base font-bold text-gray-900">{order.title}</SheetTitle>
                            <SheetDescription className="mt-1 text-xs text-gray-500">{order.providerName}</SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="mt-5 space-y-3">
                    {/* لودینگ و خطا عمومی */}
                    {detailLoading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        </div>
                    )}
                    {detailError && (
                        <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">
                            {detailError}
                        </div>
                    )}

                    {order.summary && <DetailRow label="خلاصه درخواست" value={order.summary} />}
                    <DetailRow label="کد پیگیری" value={order.code} />
                    <DetailRow label="تاریخ ثبت" value={order.createdAt} />

                    {/* === بخش اختصاصی پرستاری === */}
                    {order.serviceType === 'nurse' && nurseData && !detailLoading && (
                        <>
                            <div className="rounded-2xl border border-gray-100 bg-white p-3 text-sm space-y-2">
                                <h4 className="mb-2 font-semibold text-gray-800">جزئیات خدمات پرستاری</h4>
                                {nurseData.services.map((svc, idx) => (
                                    <div key={idx} className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="text-gray-700">{svc.service_name}</span>
                                        <span className="text-gray-900 font-medium">{formatOrderPrice(svc.price)} ت</span>
                                    </div>
                                ))}
                            </div>

                            {nurseData.staff && (
                                <div className="rounded-2xl bg-blue-50/50 p-3 text-sm border border-blue-100">
                                    <p className="text-xs font-semibold text-blue-800 mb-1">پرستار اعزامی:</p>
                                    <p className="text-gray-800">{nurseData.staff.name} - {nurseData.staff.mobile}</p>
                                </div>
                            )}

                            {nurseData.extra_info?.report && (
                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm space-y-2">
                                    <p className="font-semibold text-emerald-800 border-b border-emerald-100 pb-2">گزارش ویزیت پرستار</p>
                                    <p className="text-gray-700"><span className="text-xs font-semibold">اقدامات:</span> {nurseData.extra_info.report.services_performed}</p>
                                    <p className="text-gray-700"><span className="text-xs font-semibold">وضعیت بیمار:</span> {nurseData.extra_info.report.patient_condition}</p>
                                    {nurseData.extra_info.report.recommendations && (
                                        <p className="text-gray-700"><span className="text-xs font-semibold">توصیه ها:</span> {nurseData.extra_info.report.recommendations}</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* === بخش اختصاصی داروخانه === */}
                    {order.serviceType === 'pharmacy' && detailData && !detailLoading && (
                        <>
                            <div className="rounded-2xl border border-gray-100 bg-white p-3 text-sm space-y-2">
                                <h4 className="mb-2 font-semibold text-gray-800">داروهای سفارش‌داده‌شده</h4>
                                {detailData.medicines.map((med) => (
                                    <div key={med.id} className="flex justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="text-gray-700">{med.medicine_name} ({med.quantity} {med.unit})</span>
                                        <span className="text-gray-900 font-medium">{formatOrderPrice(med.total_price)} ت</span>
                                    </div>
                                ))}
                            </div>
                            <DetailRow label="داروخانه" value={detailData.pharmacy_name} />
                        </>
                    )}

                    {/* === بخش اختصاصی آزمایشگاه (بر اساس ساختار جدید) === */}
                    {order.serviceType === 'lab' && labData && !detailLoading && (
                        <>
                            <div className="rounded-2xl border border-gray-100 bg-white p-3 text-sm space-y-2">
                                <h4 className="mb-2 font-semibold text-gray-800">آزمایش‌های درخواستی</h4>
                                {labData.tests.map((test) => (
                                    <div key={test.id} className="flex flex-col gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">{test.test_name}</span>
                                            <span className="text-gray-900 font-medium">{formatOrderPrice(test.price)} ت</span>
                                        </div>
                                        {test.result_file && (
                                            <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                                                <FileText className="h-4 w-4" />
                                                <span>نتیجه: </span>
                                                <a
                                                    href={test.result_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Download className="h-3 w-3" /> دانلود
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <DetailRow label="آزمایشگاه" value={labData.lab_name} />
                            {labData.address && <DetailRow label="آدرس" value={labData.address} />}
                            <DetailRow label="نوع مراجعه" value={labData.visit_type_label} />
                            <DetailRow label="تاریخ درخواست" value={toJalaliDate(labData.request_date)} />
                        </>
                    )}

                    {/* مبلغ کل (عمومی) */}
                    {order.amount != null && !detailLoading && (
                        <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-3 py-3 mt-4">
                            <span className="text-xs font-medium text-blue-700">مبلغ نهایی</span>
                            <span className="text-sm font-bold text-blue-800">
                                {formatOrderPrice(
                                    order.serviceType === 'pharmacy' && detailData
                                        ? detailData.total_price
                                        : order.serviceType === 'nurse' && nurseData
                                            ? nurseData.total_price
                                            : order.serviceType === 'lab' && labData
                                                ? labData.total_price
                                                : order.amount
                                )} تومان
                            </span>
                        </div>
                    )}

                    {/* دکمه پرداخت برای آزمایشگاه */}
                    {showPayButton && (
                        <button
                            onClick={handleLabPay}
                            disabled={paying}
                            className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {paying ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    در حال پرداخت…
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5" />
                                    پرداخت فاکتور
                                </>
                            )}
                        </button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

/* ───────────────────── ردیف جزئیات ───────────────────── */
function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3 rounded-2xl bg-gray-50 px-3 py-2.5">
            <span className="shrink-0 text-[11px] font-medium text-gray-500">{label}</span>
            <span className="text-left text-sm text-gray-800">{value}</span>
        </div>
    );
}

/* ───────────────────── حالت خالی ───────────────────── */
function EmptyOrders({ onBrowse }: { onBrowse: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <PackageOpen className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">سفارشی یافت نشد</h3>
            <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-gray-500">
                با فیلترهای فعلی چیزی نمایش داده نمی‌شود. می‌توانید از خدمات درمانی
                درخواست جدید ثبت کنید.
            </p>
            <button
                type="button"
                onClick={onBrowse}
                className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
                مشاهده خدمات درمانی
            </button>
        </div>
    );
}