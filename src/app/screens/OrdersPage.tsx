import { useMemo, useState } from 'react';
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
import {
  formatOrderPrice,
  matchesStatusGroup,
  mockUserRequestOrders,
  requestStatusLabels,
  requestStatusStyles,
  serviceTypeLabels,
  statusGroupLabels,
  type UserRequestOrder,
  type UserRequestServiceType,
  type UserRequestStatusGroup,
} from '../data/userOrdersMockData';

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

const statusGroups: UserRequestStatusGroup[] = [
  'all',
  'active',
  'completed',
  'cancelled',
];

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

export function OrdersPage() {
  const navigate = useNavigate();
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
  const [statusGroup, setStatusGroup] = useState<UserRequestStatusGroup>('all');
  const [selected, setSelected] = useState<UserRequestOrder | null>(null);

  const filtered = useMemo(() => {
    return mockUserRequestOrders.filter((order) => {
      const typeOk =
        serviceFilter === 'all' || order.serviceType === serviceFilter;
      const statusOk = matchesStatusGroup(order.status, statusGroup);
      return typeOk && statusOk;
    });
  }, [serviceFilter, statusGroup]);

  const activeCount = useMemo(
    () =>
      mockUserRequestOrders.filter((o) =>
        matchesStatusGroup(o.status, 'active')
      ).length,
    []
  );

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

function OrderCard({
  order,
  onOpen,
}: {
  order: UserRequestOrder;
  onOpen: () => void;
}) {
  const Icon = serviceIcons[order.serviceType];

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
                className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${requestStatusStyles[order.status]}`}
              >
                {requestStatusLabels[order.status]}
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

function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: {
  order: UserRequestOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!order) return null;

  const Icon = serviceIcons[order.serviceType];

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
                  className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${requestStatusStyles[order.status]}`}
                >
                  {requestStatusLabels[order.status]}
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
          {order.summary && (
            <DetailRow label="خلاصه درخواست" value={order.summary} />
          )}
          <DetailRow label="کد پیگیری" value={order.code} />
          <DetailRow label="تاریخ ثبت" value={order.createdAt} />
          {order.scheduledAt && (
            <DetailRow label="زمان برنامه‌ریزی‌شده" value={order.scheduledAt} />
          )}
          {order.updatedAt && (
            <DetailRow label="آخرین به‌روزرسانی" value={order.updatedAt} />
          )}
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-gray-50 px-3 py-2.5">
      <span className="shrink-0 text-[11px] font-medium text-gray-500">
        {label}
      </span>
      <span className="text-left text-sm text-gray-800">{value}</span>
    </div>
  );
}

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
