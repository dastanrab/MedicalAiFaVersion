import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    MapPin,
    Phone,
    Truck,
    CheckCircle2,
    Search,
    Loader2,
    RefreshCw,
    User,
    PackageCheck,
} from 'lucide-react';
import { EmptyState, PageHeader, formatFaNumber } from '../../../components';
import { showProviderError, showProviderSuccess } from '../../../utils/toast';
import { toEnglishDigits } from '../../../utils/validation';
import { mockStaffCouriers } from '../../data/mockStaffData';
import { useStaffCan } from '../../components/StaffGates';
import { useStaffActivityLogger, useStaffSession } from '../../store/staffStore';

const API_BASE = 'https://api.mediraai.com/api';

export interface DeliveryOrderItem {
    id: number;
    prescription_id?: number;
    prescription_code?: string;
    user_id: number;
    user_name?: string;
    user_mobile?: string;
    status: number; // 3: آماده ارسال | 4: در حال ارسال | 5: تحویل داده شده
    delivery_type: number;
    user_address_id?: number;
    address_name?: string;
    address_lat?: string | number;
    address_lng?: string | number;
    courier_name?: string | null;
    courier_phone?: string | null;
    total_price?: number;
    delivered_at?: string | null;
    created_at: string;
    updated_at: string;
}

interface DeliveryCounts {
    ready: number;
    delivering: number;
    delivered_today: number;
}

type TabKey = 'active' | 'ready' | 'delivering' | 'delivered' | 'all';

const STATUS_CONFIG: Record<number, { label: string; badgeClass: string }> = {
    3: {
        label: 'آماده ارسال',
        badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
    },
    4: {
        label: 'تحویل به پیک (در حال ارسال)',
        badgeClass: 'bg-blue-50 text-blue-800 border border-blue-200',
    },
    5: {
        label: 'تحویل داده شده',
        badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    },
};

export function StaffDeliveryPage() {
    const can = useStaffCan('pharmacy');
    const log = useStaffActivityLogger('pharmacy');
    const session = useStaffSession('pharmacy');

    const [orders, setOrders] = useState<DeliveryOrderItem[]>([]);
    const [counts, setCounts] = useState<DeliveryCounts>({
        ready: 0,
        delivering: 0,
        delivered_today: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<TabKey>('active');
    const [search, setSearch] = useState<string>('');

    const [courierForms, setCourierForms] = useState<
        Record<number, { name: string; phone: string }>
    >({});

    const [submittingCourierId, setSubmittingCourierId] = useState<number | null>(null);
    const [deliveringId, setDeliveringId] = useState<number | null>(null);

    // تنظیم هدر بر اساس توکن فعال
    const requestHeaders = useMemo(() => {
        const token = `Bearer ${session.token}`;
        return {
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    }, [session?.token]);

    const fetchDeliveries = useCallback(async () => {
        setLoading(true);

        try {
            const url = new URL(`${API_BASE}/staff/pharmacy/deliveries`);
            url.searchParams.append('tab', activeTab);
            if (search.trim()) url.searchParams.append('search', search.trim());
            url.searchParams.append('per_page', '50');

            const res = await fetch(url.toString(), {
                method: 'GET',
                headers: requestHeaders,
            });

            const result = await res.json();

            if (res.ok && (result.status === 'success' || result.success)) {
                const list: DeliveryOrderItem[] = result.data || [];
                setOrders(list);

                if (result.counts) {
                    setCounts(result.counts);
                }

                const forms: Record<number, { name: string; phone: string }> = {};
                list.forEach((item) => {
                    forms[item.id] = {
                        name: item.courier_name || '',
                        phone: item.courier_phone || '',
                    };
                });
                setCourierForms((prev) => ({ ...forms, ...prev }));
            } else {
                showProviderError(result.message || 'خطا در دریافت لیست سفارش‌های ارسالی');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط با سرور');
        } finally {
            setLoading(false);
        }
    }, [activeTab, search, requestHeaders]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDeliveries();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchDeliveries]);

    const handleFieldChange = (orderId: number, field: 'name' | 'phone', val: string) => {
        setCourierForms((prev) => ({
            ...prev,
            [orderId]: {
                ...(prev[orderId] || { name: '', phone: '' }),
                [field]: val,
            },
        }));
    };

    const handleAssignCourier = async (order: DeliveryOrderItem) => {


        const form = courierForms[order.id] || { name: '', phone: '' };
        const cName = form.name.trim();
        const cPhone = toEnglishDigits(form.phone.trim());

        if (!cName) {
            showProviderError('لطفاً نام پیک را وارد یا انتخاب کنید');
            return;
        }

        setSubmittingCourierId(order.id);

        try {
            const res = await fetch(`${API_BASE}/staff/pharmacy/requests/${order.id}/assign-courier`, {
                method: 'POST',
                headers: requestHeaders,
                body: JSON.stringify({
                    courier_name: cName,
                    courier_phone: cPhone || null,
                }),
            });

            const result = await res.json();

            if (res.ok && (result.status === 'success' || result.success)) {
                showProviderSuccess(result.message || 'مشخصات پیک با موفقیت ثبت شد');
                log('تعیین پیک', `#${order.prescription_code || order.id} — ${cName}`);

                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === order.id
                            ? { ...o, status: 4, courier_name: cName, courier_phone: cPhone }
                            : o
                    )
                );
                fetchDeliveries();
            } else {
                showProviderError(result.message || 'خطا در ثبت اطلاعات پیک');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط با سرور');
        } finally {
            setSubmittingCourierId(null);
        }
    };

    const handleMarkDelivered = async (order: DeliveryOrderItem) => {



        setDeliveringId(order.id);

        try {
            const res = await fetch(`${API_BASE}/staff/pharmacy/requests/${order.id}/mark-delivered`, {
                method: 'POST',
                headers: requestHeaders,
            });

            const result = await res.json();

            if (res.ok && (result.status === 'success' || result.success)) {
                showProviderSuccess(result.message || 'سفارش به عنوان تحویل‌شده ثبت شد');
                log('ثبت تحویل نهایی', `#${order.prescription_code || order.id}`);

                setOrders((prev) =>
                    prev.map((o) =>
                        o.id === order.id
                            ? { ...o, status: 5, delivered_at: new Date().toISOString() }
                            : o
                    )
                );
                fetchDeliveries();
            } else {
                showProviderError(result.message || 'خطا در تغییر وضعیت به تحویل‌شده');
            }
        } catch {
            showProviderError('خطا در برقراری ارتباط با سرور');
        } finally {
            setDeliveringId(null);
        }
    };

    const tabs: { key: TabKey; label: string; badge?: number }[] = [
        { key: 'active', label: 'در جریان ارسال', badge: (counts.ready || 0) + (counts.delivering || 0) },
        { key: 'ready', label: 'آماده ارسال', badge: counts.ready },
        { key: 'delivering', label: 'در حال ارسال (دست پیک)', badge: counts.delivering },
        { key: 'delivered', label: 'تحویل داده شده امروز', badge: counts.delivered_today },
        { key: 'all', label: 'همه' },
    ];

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <PageHeader
                    title="ارسال و تحویل با پیک"
                    subtitle="مدیریت، تخصیص پیک و ثبت تحویل نهایی سفارش‌های داروخانه"
                />

                <button
                    type="button"
                    onClick={fetchDeliveries}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
                    به‌روزرسانی
                </button>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
                <div className="flex flex-wrap items-center gap-2">
                    {tabs.map((t) => {
                        const isActive = activeTab === t.key;
                        return (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setActiveTab(t.key)}
                                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                    isActive
                                        ? 'bg-teal-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span>{t.label}</span>
                                {typeof t.badge === 'number' && (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-white text-slate-700'
                                        }`}
                                    >
                                        {formatFaNumber(t.badge)}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="relative min-w-[280px]">
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="جستجوی نام بیمار، کد پیگیری یا مشخصات پیک..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-9 pl-3 text-xs text-slate-800 outline-none transition focus:border-teal-500 focus:bg-white"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-16 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                    <span className="text-sm font-medium">در حال دریافت لیست سفارش‌های ارسالی...</span>
                </div>
            ) : orders.length === 0 ? (
                <EmptyState
                    title="سفارشی یافت نشد"
                    description="هیچ سفارش ارسالی مطابق با فیلتر یا جستجوی کنونی وجود ندارد."
                />
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {orders.map((order) => {
                        const statusConfig = STATUS_CONFIG[order.status] || {
                            label: 'نامشخص',
                            badgeClass: 'bg-slate-100 text-slate-600',
                        };

                        const form = courierForms[order.id] || {
                            name: order.courier_name || '',
                            phone: order.courier_phone || '',
                        };

                        const patientName = order.user_name || `کاربر #${order.user_id}`;
                        const patientPhone = order.user_mobile || '—';
                        const address = order.address_name || 'آدرس ثبت نشده است';
                        const code = order.prescription_code || `RX-${order.id}`;

                        const isAssigning = submittingCourierId === order.id;
                        const isDelivering = deliveringId === order.id;

                        return (
                            <div
                                key={order.id}
                                className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-800">{patientName}</p>
                                            <p className="font-mono text-xs text-slate-400">کد نسخه: {code}</p>
                                        </div>
                                        <span
                                            className={`rounded-xl px-2.5 py-1 text-xs font-bold ${statusConfig.badgeClass}`}
                                        >
                                            {statusConfig.label}
                                        </span>
                                    </div>

                                    {/* آدرس دقیق ثبت‌شده از جدول addresses */}
                                    <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                                        <span>{address}</span>
                                    </p>

                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                                        <a
                                            href={`tel:${patientPhone}`}
                                            className="inline-flex items-center gap-1.5 font-mono text-slate-700 hover:text-teal-600"
                                            dir="ltr"
                                        >
                                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                                            {patientPhone}
                                        </a>

                                        {order.total_price ? (
                                            <span className="font-medium text-slate-500">
                                                مبلغ فاکتور:{' '}
                                                <strong className="text-slate-800">
                                                    {formatFaNumber(order.total_price)}
                                                </strong>{' '}
                                                تومان
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                {order.status === 3 || order.status === 4 ? (
                                    <div className="space-y-3 border-t border-slate-100 pt-3">
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <div>
                                                <input
                                                    list={`couriers-${order.id}`}
                                                    type="text"
                                                    value={form.name}
                                                    onChange={(e) =>
                                                        handleFieldChange(order.id, 'name', e.target.value)
                                                    }
                                                    placeholder="نام پیک (انتخاب یا تایپ)"
                                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-teal-500"
                                                />
                                                <datalist id={`couriers-${order.id}`}>
                                                    {mockStaffCouriers.map((c) => (
                                                        <option key={c} value={c} />
                                                    ))}
                                                </datalist>
                                            </div>

                                            <input
                                                type="tel"
                                                dir="ltr"
                                                value={form.phone}
                                                onChange={(e) =>
                                                    handleFieldChange(order.id, 'phone', e.target.value)
                                                }
                                                placeholder="شماره تماس پیک"
                                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left font-mono text-xs outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                                                <button
                                                    type="button"
                                                    disabled={isAssigning || !form.name.trim()}
                                                    onClick={() => handleAssignCourier(order)}
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-teal-600 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                                >
                                                    {isAssigning ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Truck className="h-3.5 w-3.5" />
                                                    )}
                                                    {order.status === 4 ? 'به‌روزرسانی پیک' : 'ثبت پیک و ارسال'}
                                                </button>

                                                <button
                                                    type="button"
                                                    disabled={isDelivering || !order.courier_name}
                                                    onClick={() => handleMarkDelivered(order)}
                                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                                                >
                                                    {isDelivering ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    )}
                                                    تحویل داده شد
                                                </button>
                                            </div>

                                    </div>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <User className="h-4 w-4 text-slate-400" />
                                            <span>
                                                تحویل‌دهنده:{' '}
                                                <strong className="text-slate-700">
                                                    {order.courier_name || '—'}
                                                </strong>
                                            </span>
                                            {order.courier_phone && (
                                                <span className="font-mono text-slate-400" dir="ltr">
                                                    ({order.courier_phone})
                                                </span>
                                            )}
                                        </div>

                                        {order.delivered_at && (
                                            <div className="flex items-center gap-1 font-medium text-emerald-600">
                                                <PackageCheck className="h-4 w-4" />
                                                <span>تحویل نهایی ثبت شده</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
