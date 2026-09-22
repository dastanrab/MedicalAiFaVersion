import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ClipboardList, Loader2, PackageOpen } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { useAuthStore } from '../store/authStore';
import { UserRequestOrder, UserRequestStatusGroup, statusGroupLabels, serviceTypeLabels } from '../data/userOrdersMockData';

// Imports from the newly created files
import { ApiOrdersResponse, ServiceFilter } from '../components/orders/types';
import { serviceTypeMap, mapToStatusGroup, doctorStatusLabelMap, toJalaliDate } from '../components/orders/utils';
import { OrderCard } from '../components/orders/OrderCard';
import { OrderDetailSheet } from '../components/orders/OrderDetailSheet'

const pageClass = 'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';
const statusGroups: UserRequestStatusGroup[] = ['all', 'active', 'completed', 'cancelled'];
const serviceFilters: { key: ServiceFilter; label: string }[] = [
    { key: 'all', label: 'همه' },
    { key: 'chat', label: 'چت آنلاین' },
    { key: 'consultation', label: 'نوبت' },
    { key: 'lab', label: 'آزمایش' },
    { key: 'pharmacy', label: 'دارو' },
    { key: 'radiology', label: 'رادیولوژی' },
    { key: 'nurse', label: 'پرستاری' },
];

function EmptyOrders({ onBrowse }: { onBrowse: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                <PackageOpen className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">سفارشی یافت نشد</h3>
            <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-gray-500">
                با فیلترهای فعلی چیزی نمایش داده نمی‌شود. می‌توانید از خدمات درمانی درخواست جدید ثبت کنید.
            </p>
            <button
                type="button" onClick={onBrowse}
                className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
                مشاهده خدمات درمانی
            </button>
        </div>
    );
}

export function OrdersPageV1() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
    const [statusGroup, setStatusGroup] = useState<UserRequestStatusGroup>('all');
    const [selected, setSelected] = useState<UserRequestOrder | null>(null);

    const [orders, setOrders] = useState<UserRequestOrder[]>([]);
    const [counts, setCounts] = useState({ doctor: 0, lab: 0, pharmacy: 0, nurse: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        if (!accessToken) {
            setLoading(false); setError('توکن احراز هویت موجود نیست.'); return;
        }
        setLoading(true); setError(null);
        try {
            const res = await fetch('https://api.mediraai.com/api/user/orders', {
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('خطا در دریافت داده‌ها. ممکن است توکن منقضی شده باشد.');
            const json: ApiOrdersResponse = await res.json();
            if (!json.success) throw new Error('پاسخ API نامعتبر است.');

            const mapped: UserRequestOrder[] = json.data.orders.map((item) => {
                const serviceType = serviceTypeMap[item.type] ?? 'lab';
                const group = mapToStatusGroup(item.type, item.status);

                let finalStatusLabel = item.status_label;
                if (item.type === 'doctor') {
                    const rawStatus = String(item.status).toLowerCase();
                    finalStatusLabel = doctorStatusLabelMap[rawStatus] ?? item.status_label;
                }

                return {
                    order_id: item.order_id, id: item.id, serviceType, status: group,
                    rawStatus: item.status, status_label: finalStatusLabel,
                    title: serviceType !== 'consultation' ? serviceTypeLabels[serviceType] : `نوبت دکتر ${item.detail}`,
                    providerName: item.name, summary: item.detail !== '-' ? item.detail : '',
                    amount: item.price, code: `#ORD-${item.id}`,
                    scheduledAt: null, createdAt: toJalaliDate(item.created_at),
                    updatedAt: null, address: null, details: [],
                };
            });

            setOrders(mapped);
            setCounts({
                doctor: json.data.count_doctor, lab: json.data.count_lab,
                pharmacy: json.data.count_pharmacy, nurse: json.data.count_nurse,
            });
        } catch (err: any) { setError(err.message); } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [accessToken]);

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
                    <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm max-w-sm text-center">{error}</div>
                    <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 text-sm font-medium hover:underline">
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
                            <p className="text-xs text-gray-500">تاریخچه درخواست‌ها به مراکز درمانی و وضعیت آن‌ها</p>
                        </div>
                    </div>
                    {activeCount > 0 && (
                        <div className="mt-3 rounded-2xl bg-white px-3 py-2.5 text-xs text-gray-600 shadow-sm ring-1 ring-gray-100">
                            <span className="font-semibold text-blue-600">{activeCount.toLocaleString('fa-IR')}</span> درخواست فعال در حال پیگیری دارید
                        </div>
                    )}
                </header>

                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {serviceFilters.map((item) => (
                        <button
                            key={item.key} type="button" onClick={() => setServiceFilter(item.key)}
                            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                                serviceFilter === item.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 ring-1 ring-gray-100 hover:bg-gray-50'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
                    {statusGroups.map((group) => (
                        <button
                            key={group} type="button" onClick={() => setStatusGroup(group)}
                            className={`rounded-xl py-2 text-xs font-medium transition-colors ${
                                statusGroup === group ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {statusGroupLabels[group]}
                        </button>
                    ))}
                </div>

                {filtered.length === 0 ? (
                    <EmptyOrders onBrowse={() => navigate('/services')} />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((order) => (
                            <OrderCard
                                key={`${order.id}-${order.serviceType}`}
                                order={order}
                                onOpen={() => {
                                    // اگر سفارش از نوع چت بود، بدون باز کردن مودال مستقیم برو به صفحه چت
                                    if (order.serviceType === 'chat') {
                                        // order.id در اینجا به خاطر کوئری جدید بک‌اند، معادل room_id است
                                        navigate(`/consultation/${order.id}`);
                                    } else {
                                        // در غیر این صورت Sheet جزئیات رو باز کن
                                        setSelected(order);
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <OrderDetailSheet
                order={selected} open={selected !== null}
                onOpenChange={(open) => { if (!open) setSelected(null); }}
                onOrderUpdate={(updatedOrder) => {
                    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
                }}
                refreshOrders={fetchOrders}
            />
        </div>
    );
}