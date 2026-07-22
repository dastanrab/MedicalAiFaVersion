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

/** ساختار جزئیات درخواست داروخانه (دریافت از API) */
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

    useEffect(() => {
        if (!accessToken) {
            setLoading(false);
            setError('توکن احراز هویت موجود نیست.');
            return;
        }
        const fetchOrders = async () => {
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

/* ───────────────────── شیت جزئیات (با پشتیبانی از داروخانه) ───────────────────── */
function OrderDetailSheet({
                              order,
                              open,
                              onOpenChange,
                          }: {
    order: UserRequestOrder | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { accessToken } = useAuthStore();

    // وضعیت‌های مربوط به دریافت فاکتور داروخانه
    const [detailData, setDetailData] = useState<PharmacyRequestDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [paying, setPaying] = useState(false);

    // هر بار که order تغییر کند و نوع آن pharmacy باشد، فاکتور را دریافت می‌کنیم
    useEffect(() => {
        if (!order || order.serviceType !== 'pharmacy') {
            setDetailData(null);
            return;
        }

        const fetchPharmacyDetail = async () => {
            setDetailLoading(true);
            setDetailError(null);
            try {
                const res = await fetch(
                    `http://185.222.163.113:7000/api/user/pharmacy-requests/${order.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            Accept: 'application/json',
                        },
                    }
                );
                if (!res.ok) throw new Error('خطا در دریافت فاکتور');
                const json = await res.json();
                if (!json.success) throw new Error(json.message || 'پاسخ نامعتبر');
                setDetailData(json.data);
            } catch (err: any) {
                setDetailError(err.message);
            } finally {
                setDetailLoading(false);
            }
        };

        fetchPharmacyDetail();
    }, [order?.id, order?.serviceType]);

    if (!order) return null;

    const Icon = serviceIcons[order.serviceType];
    const statusClass = getStatusClass(order.status);
    const isPharmacyAwaitingPayment =
        order.serviceType === 'pharmacy' && order.status_label === 'در انتظار پرداخت';

    // عملیات پرداخت
    const handlePay = async () => {
        if (!order || paying) return;
        if (!confirm('آیا از پرداخت اطمینان دارید؟')) return;
        setPaying(true);
        try {
            const res = await fetch(
                `http://185.222.163.113:7000/api/user/pharmacy-requests/${order.id}/pay`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
            const json = await res.json();
            if (json.success) {
                // ریفرش صفحه برای به‌روزرسانی وضعیت (در پروژه‌های واقعی بهتر است وضعیت لیست را به‌روز کنید)
                window.location.reload();
            } else {
                alert(json.message || 'خطا در پرداخت');
            }
        } catch (err: any) {
            alert('خطا در برقراری ارتباط');
        } finally {
            setPaying(false);
        }
    };

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
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${serviceIconStyles[order.serviceType]}`}
                        >
                            <Icon className="h-6 w-6" />
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
                            <SheetTitle className="mt-2 text-base font-bold text-gray-900">
                                {order.title}
                            </SheetTitle>
                            <SheetDescription className="mt-1 text-xs text-gray-500">
                                {order.providerName}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="mt-5 space-y-3">
                    {/* اطلاعات عمومی */}
                    {order.summary && <DetailRow label="خلاصه درخواست" value={order.summary} />}
                    <DetailRow label="کد پیگیری" value={order.code} />
                    <DetailRow label="تاریخ ثبت" value={order.createdAt} />

                    {/* بخش اختصاصی داروخانه */}
                    {order.serviceType === 'pharmacy' && (
                        <>
                            {/* حالت بارگذاری فاکتور */}
                            {detailLoading && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                                </div>
                            )}
                            {/* خطا در دریافت فاکتور */}
                            {detailError && (
                                <div className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">
                                    {detailError}
                                </div>
                            )}
                            {/* نمایش فاکتور و دکمه پرداخت */}
                            {detailData && !detailLoading && (
                                <div className="rounded-2xl border border-gray-100 bg-white p-3 text-sm">
                                    <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                                        <ShoppingBag className="h-4 w-4 text-emerald-600" />
                                        فاکتور داروها
                                    </h4>
                                    <div className="space-y-2">
                                        {detailData.medicines.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-700">
                                                        {item.medicine_name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {item.quantity} × {formatOrderPrice(item.unit_price)} تومان
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {formatOrderPrice(item.total_price)} ت
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                                        <span className="font-semibold text-gray-700">مبلغ کل</span>
                                        <span className="font-bold text-emerald-600">
                                            {formatOrderPrice(detailData.total_price)} تومان
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* دکمه پرداخت (فقط در وضعیت "در انتظار پرداخت") */}
                            {isPharmacyAwaitingPayment && (
                                <button
                                    onClick={handlePay}
                                    disabled={paying}
                                    className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 px-4 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    {paying ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <CreditCard className="h-5 w-5" />
                                    )}
                                    {paying ? 'در حال پرداخت...' : 'پرداخت'}
                                </button>
                            )}
                        </>
                    )}

                    {/* سایر جزئیات (در صورت وجود) */}
                    {order.address && (
                        <div className="rounded-2xl bg-gray-50 px-3 py-2.5">
                            <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                <MapPin className="h-3.5 w-3.5" />
                                آدرس
                            </p>
                            <p className="text-sm text-gray-800">{order.address}</p>
                        </div>
                    )}
                    {order.details?.map((item) => (
                        <DetailRow key={item.label} label={item.label} value={item.value} />
                    ))}
                    {order.amount != null && (
                        <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-3 py-3">
                            <span className="text-xs font-medium text-blue-700">مبلغ</span>
                            <span className="text-sm font-bold text-blue-800">
                                {formatOrderPrice(order.amount)} تومان
                            </span>
                        </div>
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
