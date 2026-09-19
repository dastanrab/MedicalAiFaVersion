import { AppBar } from './AppBar';
import { Skeleton } from './ui/skeleton';
import { cn } from './ui/utils';

export type PageSkeletonVariant =
  | 'default'
  | 'list'
  | 'cards'
  | 'form'
  | 'chat'
  | 'home'
  | 'diagnosis'
  | 'doctors'
  | 'doctor-profile'
  | 'profile'
  | 'orders'
  | 'plans';

type PageSkeletonProps = {
  className?: string;
  variant?: PageSkeletonVariant;
  showAppBar?: boolean;
  showChat?: boolean;
  backTo?: string;
};

function Bone({ className }: { className?: string }) {
  return <Skeleton className={cn('bg-slate-200/70', className)} />;
}

function SectionHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      <Bone className="h-5 w-36" />
      <Bone className="h-3 w-16" />
    </div>
  );
}

export function HorizontalCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="relative -mx-4">
      <div className="flex gap-4 overflow-hidden px-4 pb-6">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-[260px] flex-none rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <Bone className="h-10 w-10 rounded-xl" />
              <Bone className="h-6 w-12 rounded-full" />
            </div>
            <Bone className="mt-4 h-3 w-16" />
            <Bone className="mt-2 h-4 w-40" />
            <Bone className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <Bone className="mb-3 h-11 w-11 rounded-xl" />
          <Bone className="h-4 w-24" />
          <Bone className="mt-2 h-3 w-full" />
          <Bone className="mt-3 h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

export function ListRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4"
        >
          <Bone className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-4 w-2/3" />
            <Bone className="h-3 w-1/2" />
          </div>
          <Bone className="h-4 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Bone className={cn('h-4', j === 0 ? 'w-28' : 'w-16')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function MedicalServicesSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('px-4 pb-8 pt-24', className)}
      aria-busy="true"
      aria-label="در حال بارگذاری خدمات درمانی"
    >
      <div className="mb-8 space-y-3">
        <Bone className="h-8 w-56" />
        <Bone className="h-4 w-full max-w-md" />
        <Bone className="h-4 w-3/4 max-w-sm" />
      </div>

      <div className="mb-10">
        <CardGridSkeleton count={4} />
      </div>

      <SectionHeaderSkeleton />
      <HorizontalCardsSkeleton />
      <SectionHeaderSkeleton className="mt-6" />
      <HorizontalCardsSkeleton />
    </div>
  );
}

export function DialogSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-5 p-5', className)} aria-busy="true" aria-label="در حال بارگذاری جزئیات">
      <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
        <Bone className="h-4 w-24" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Bone className="h-20 rounded-2xl" />
        <Bone className="h-20 rounded-2xl" />
      </div>
      <Bone className="h-40 rounded-2xl" />
      <div className="space-y-2">
        <Bone className="h-4 w-28" />
        <Bone className="h-12 w-full rounded-xl" />
        <Bone className="h-12 w-full rounded-xl" />
        <Bone className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function PanelPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="در حال بارگذاری">
      <div className="flex items-center gap-4">
        <Bone className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Bone className="h-6 w-36" />
          <Bone className="h-4 w-52" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Bone className="mb-2 h-3 w-16" />
            <Bone className="h-7 w-12" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <Bone className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function DefaultSkeletonBody() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Bone className="h-7 w-48" />
        <Bone className="h-4 w-full max-w-sm" />
      </div>
      <CardGridSkeleton count={4} />
      <ListRowsSkeleton rows={4} />
    </div>
  );
}

export function HomePageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-full bg-[#F6F8FC] px-5 pb-8 pt-24 sm:px-6', className)}
      aria-busy="true"
      aria-label="در حال بارگذاری خانه"
    >
      <div className="relative mb-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 px-5 pb-14 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Bone className="h-12 w-12 shrink-0 rounded-full bg-white/25" />
              <div className="space-y-2">
                <Bone className="h-3 w-20 bg-white/25" />
                <Bone className="h-6 w-32 bg-white/35" />
                <Bone className="h-3 w-24 bg-white/20" />
              </div>
            </div>
            <Bone className="h-10 w-10 shrink-0 rounded-full bg-white/20" />
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 p-2.5 pr-3.5 ring-1 ring-white/15">
            <Bone className="h-14 w-14 shrink-0 rounded-full bg-white/20" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-4 w-40 bg-white/30" />
              <Bone className="h-3 w-52 bg-white/20" />
            </div>
          </div>
        </div>
        <div className="relative z-10 -mt-8 grid grid-cols-3 gap-2 px-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl bg-white px-2 py-3 shadow-[0_8px_28px_-8px_rgba(15,23,42,0.15)] ring-1 ring-gray-100"
            >
              <Bone className="mb-1.5 h-9 w-9 rounded-xl" />
              <Bone className="h-5 w-8" />
              <Bone className="mt-1 h-2.5 w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-blue-600 to-blue-400 p-5">
        <Bone className="h-14 w-14 shrink-0 rounded-2xl bg-white/25" />
        <div className="min-w-0 flex-1 space-y-2">
          <Bone className="h-3 w-16 bg-white/25" />
          <Bone className="h-5 w-40 bg-white/35" />
          <Bone className="h-3 w-48 bg-white/20" />
        </div>
        <Bone className="h-9 w-9 shrink-0 rounded-full bg-white/20" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Bone className="h-5 w-28" />
        <Bone className="h-3 w-16" />
      </div>
      <div className="mb-8 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_2px_16px_rgba(15,23,42,0.06)]"
          >
            <Bone className="mb-4 h-12 w-12 rounded-2xl" />
            <Bone className="h-4 w-24" />
            <Bone className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Bone className="h-5 w-5 rounded-md" />
        <Bone className="h-5 w-32" />
      </div>
      <div className="mb-8 space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 items-center justify-between rounded-2xl border border-gray-100 bg-white p-3.5">
              <div className="space-y-2">
                <Bone className="h-4 w-28" />
                <Bone className="h-3 w-24" />
              </div>
              <Bone className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Bone className="h-5 w-36" />
        <Bone className="h-3 w-10" />
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-[0_10px_30px_-8px_rgba(15,23,42,0.14)]">
        <Bone className="h-48 w-full rounded-none" />
        <div className="space-y-2 p-4">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function DiagnosisPageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-full bg-gradient-to-b from-blue-50 to-white px-6 pb-32 pt-24', className)}
      aria-busy="true"
      aria-label="در حال بارگذاری تشخیص هوشمند"
    >
      <div className="relative mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 px-5 pb-11 pt-5">
          <div className="flex items-center gap-4">
            <Bone className="h-14 w-14 shrink-0 rounded-2xl bg-white/25" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-5 w-44 bg-white/35" />
              <Bone className="h-3.5 w-56 bg-white/20" />
            </div>
          </div>
        </div>
        <div className="relative z-10 -mt-[1.625rem] px-1">
          <div className="flex h-12 gap-1 rounded-full bg-white px-1 py-1 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
            <Bone className="h-full flex-1 rounded-full" />
            <Bone className="h-full flex-1 rounded-full bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-gradient-to-l from-blue-50 to-indigo-50 p-4">
          <Bone className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="space-y-2">
            <Bone className="h-4 w-32" />
            <Bone className="h-3 w-48" />
          </div>
        </div>
        <Bone className="mb-2 h-4 w-36" />
        <Bone className="h-36 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function DoctorListSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-full bg-gradient-to-b from-blue-50 to-white px-6 pb-8 pt-24', className)}
      aria-busy="true"
      aria-label="در حال بارگذاری لیست پزشکان"
    >
      <div className="relative mb-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 px-5 pb-14 pt-5">
          <div className="flex items-center gap-4">
            <Bone className="h-14 w-14 shrink-0 rounded-2xl bg-white/25" />
            <div className="min-w-0 flex-1 space-y-2">
              <Bone className="h-5 w-36 bg-white/35" />
              <Bone className="h-3.5 w-52 bg-white/20" />
            </div>
          </div>
        </div>
        <div className="relative z-10 -mt-9 flex gap-2.5 px-1">
          <Bone className="h-12 flex-1 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]" />
          <Bone className="h-12 w-12 shrink-0 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]" />
        </div>
      </div>

      <div className="-mx-6 mb-5 flex gap-2.5 overflow-hidden px-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start gap-3">
              <Bone className="h-14 w-14 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Bone className="h-4 w-36" />
                <Bone className="h-3 w-20" />
              </div>
              <Bone className="h-8 w-8 shrink-0 rounded-full" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 px-2 py-2">
              <Bone className="mx-auto h-8 w-12" />
              <Bone className="mx-auto h-8 w-12" />
              <Bone className="mx-auto h-8 w-12" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
              <div className="space-y-1.5">
                <Bone className="h-3 w-36" />
                <Bone className="h-3 w-24" />
              </div>
              <Bone className="h-9 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DoctorProfileSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 font-[YekanBakhFaNum]',
        className
      )}
      dir="rtl"
      aria-busy="true"
      aria-label="در حال بارگذاری صفحه پزشک"
    >
      <div className="mx-auto max-w-3xl px-4 pt-24 sm:px-6">
        <div className="mb-6 rounded-xl bg-white p-6 shadow-xl">
          <div className="mb-6 flex items-start gap-4">
            <Bone className="h-20 w-20 shrink-0 rounded-2xl sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <Bone className="h-5 w-40" />
              <Bone className="h-3.5 w-24" />
              <div className="flex items-center gap-2 pt-1">
                <Bone className="h-3.5 w-16" />
                <Bone className="h-3 w-3 rounded-full" />
                <Bone className="h-3.5 w-20" />
              </div>
            </div>
            <Bone className="h-9 w-9 shrink-0 rounded-full" />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <Bone className="mx-auto mb-1 h-5 w-5 rounded-md bg-blue-200/70" />
              <Bone className="mx-auto mb-1 h-2.5 w-10 bg-blue-200/50" />
              <Bone className="mx-auto h-3.5 w-12 bg-blue-200/80" />
            </div>
            <div className="rounded-xl bg-green-50 p-3">
              <Bone className="mx-auto mb-1 h-5 w-5 rounded-md bg-green-200/70" />
              <Bone className="mx-auto mb-1 h-2.5 w-10 bg-green-200/50" />
              <Bone className="mx-auto h-3.5 w-12 bg-green-200/80" />
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <Bone className="mx-auto mb-1 h-5 w-5 rounded-md bg-purple-200/70" />
              <Bone className="mx-auto mb-1 h-2.5 w-10 bg-purple-200/50" />
              <Bone className="mx-auto h-3.5 w-12 bg-purple-200/80" />
            </div>
          </div>

          <div className="space-y-2.5 border-t border-gray-100 pt-4">
            <div className="flex items-start gap-2">
              <Bone className="mt-0.5 h-5 w-5 shrink-0 rounded-md" />
              <Bone className="h-4 flex-1" />
            </div>
            <div className="flex items-center gap-2">
              <Bone className="h-5 w-5 shrink-0 rounded-md" />
              <Bone className="h-4 w-2/3" />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-white p-5 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <Bone className="h-5 w-5 rounded-md" />
            <Bone className="h-5 w-48" />
          </div>
          <Bone className="mb-2 h-3.5 w-20" />
          <div className="mb-4 flex gap-2 overflow-hidden pb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone
                key={i}
                className={`h-9 w-[4.5rem] shrink-0 rounded-xl ${i === 0 ? 'bg-blue-200/80' : ''}`}
              />
            ))}
          </div>
          <Bone className="mb-2 h-3.5 w-28" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <div className="grid h-9 grid-cols-2 gap-[3px] rounded-xl bg-slate-100 p-[3px]">
            <Bone className="h-full rounded-lg bg-white" />
            <Bone className="h-full rounded-lg bg-transparent" />
          </div>
          <div className="mt-4 rounded-xl bg-white p-5 shadow-lg">
            <Bone className="mb-3 h-4 w-24" />
            <div className="mb-4 space-y-1.5">
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-2/3" />
            </div>
            <Bone className="mb-2 h-4 w-20" />
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <Bone className="h-1.5 w-1.5 rounded-full" />
                <Bone className="h-3 w-3/4" />
              </div>
              <div className="flex items-center gap-2">
                <Bone className="h-1.5 w-1.5 rounded-full" />
                <Bone className="h-3 w-2/3" />
              </div>
            </div>
            <Bone className="mb-2 h-4 w-28" />
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Bone className="mt-0.5 h-4 w-4 shrink-0 rounded-md" />
                <Bone className="h-3 w-1/2" />
              </div>
              <div className="flex items-start gap-2">
                <Bone className="mt-0.5 h-4 w-4 shrink-0 rounded-md" />
                <Bone className="h-3 w-2/5" />
              </div>
              <div className="flex items-start gap-2">
                <Bone className="mt-0.5 h-4 w-4 shrink-0 rounded-md" />
                <Bone className="h-3 w-1/3" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <Bone className="h-12 rounded-md" />
          <Bone className="h-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function FieldBone() {
  return (
    <div>
      <Bone className="mb-1.5 h-3.5 w-16" />
      <Bone className="h-11 w-full rounded-xl" />
    </div>
  );
}

export function ProfilePageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mx-auto h-full w-full max-w-lg bg-gradient-to-b from-blue-50 to-white px-3 pb-6 pt-24 font-[YekanBakhFaNum] sm:px-4',
        className
      )}
      dir="rtl"
      aria-busy="true"
      aria-label="در حال بارگذاری پروفایل"
    >
      <div className="relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-4 py-5 shadow-[0_12px_40px_rgba(79,70,229,0.35)] sm:px-5">
        <div className="pointer-events-none absolute -top-14 -left-14 h-44 w-44 rounded-full bg-white/10 blur-sm" />
        <div className="pointer-events-none absolute -bottom-12 -right-10 h-36 w-36 rounded-full bg-violet-400/25 blur-sm" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative shrink-0">
            <Bone className="h-16 w-16 rounded-2xl bg-white/25 ring-2 ring-white/40" />
            <Bone className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-full bg-white/40" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-5 w-24 rounded-full bg-white/20" />
            <Bone className="h-4 w-28 bg-white/35" />
            <Bone className="h-3 w-52 bg-white/20" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-5">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldBone />
            <FieldBone />
          </div>
          <div>
            <Bone className="mb-1.5 h-3.5 w-12" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-100 bg-gray-50/80 px-2 py-3"
                >
                  <Bone className="h-10 w-10 rounded-xl" />
                  <Bone className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <FieldBone />
            <FieldBone />
            <FieldBone />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldBone />
            <FieldBone />
          </div>
          <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
            <Bone className="h-7 w-7 rounded-lg" />
            <Bone className="h-4 w-36" />
          </div>
          <FieldBone />
          <div className="grid grid-cols-2 gap-3">
            <FieldBone />
            <FieldBone />
          </div>
        </div>
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-2.5 rounded-full border border-blue-100/90 bg-white py-1.5 pl-1.5 pr-4">
            <Bone className="h-3.5 w-24" />
            <Bone className="h-7 w-7 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bone className="h-7 w-7 rounded-lg" />
            <Bone className="h-4 w-28" />
          </div>
          <Bone className="h-7 w-24 rounded-full" />
        </div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Bone className="h-3.5 w-16" />
                    {i === 0 && <Bone className="h-4 w-14 rounded-full" />}
                  </div>
                  <Bone className="h-3 w-full" />
                  <Bone className="h-3 w-2/3" />
                </div>
                <Bone className="h-7 w-7 shrink-0 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OrdersPageSkeleton({ className }: { className?: string }) {
  const chipWidths = ['w-12', 'w-14', 'w-16', 'w-12', 'w-20', 'w-16'];

  return (
    <div
      className={cn(
        'mx-auto h-full w-full max-w-lg bg-gradient-to-b from-blue-50 to-white px-3 pb-6 pt-24 font-[YekanBakhFaNum] sm:px-4',
        className
      )}
      dir="rtl"
      aria-busy="true"
      aria-label="در حال بارگذاری سفارش‌ها"
    >
      <header className="mb-4 px-1">
        <div className="flex items-center gap-2">
          <Bone className="h-10 w-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Bone className="h-5 w-20" />
            <Bone className="h-3 w-52" />
          </div>
        </div>
        <div className="mt-3 rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-gray-100">
          <Bone className="h-3.5 w-48" />
        </div>
      </header>

      <div className="mb-3 flex gap-2 overflow-hidden pb-1">
        {chipWidths.map((width, i) => (
          <Bone
            key={i}
            className={cn('h-8 shrink-0 rounded-xl', i === 0 ? 'bg-blue-200/70' : '', width)}
          />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className={cn('h-8 rounded-xl', i === 0 && 'bg-blue-200/70')} />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-start gap-3">
              <Bone className="h-11 w-11 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Bone className="h-5 w-12 rounded-lg" />
                  <Bone className="h-5 w-16 rounded-lg" />
                </div>
                <Bone className="mt-2 h-4 w-40" />
                <Bone className="mt-1 h-3 w-32" />
                <Bone className="mt-1 h-3 w-24" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Bone className="h-4 w-16" />
                <Bone className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-gray-50 pt-3">
              <Bone className="h-3 w-20" />
              <Bone className="h-3 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlansPageSkeleton({ className }: { className?: string }) {
  const plans = [
    { features: 3, cardClass: 'border-gray-100 bg-white', popular: false },
    {
      features: 5,
      cardClass: 'border-blue-200 bg-gradient-to-br from-blue-50 to-white',
      popular: true,
    },
    {
      features: 6,
      cardClass: 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white',
      popular: false,
    },
  ];

  return (
    <div
      className={cn(
        'w-full px-6 pb-8 pt-24 font-[YekanBakhFaNum]',
        className
      )}
      dir="rtl"
      aria-busy="true"
      aria-label="در حال بارگذاری پلن‌ها"
    >
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 px-5 py-5 shadow-[0_8px_32px_rgba(245,158,11,0.28)]">
        <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center gap-4">
          <Bone className="h-14 w-14 shrink-0 rounded-2xl bg-white/25 ring-1 ring-white/30" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-6 w-20 bg-white/40" />
            <Bone className="h-4 w-48 bg-white/25" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={cn(
              'relative rounded-2xl border p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]',
              plan.cardClass
            )}
          >
            {plan.popular && (
              <Bone className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/70" />
            )}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bone className="h-10 w-10 rounded-xl" />
                <Bone className="h-5 w-16" />
              </div>
              <Bone className="h-4 w-28" />
            </div>
            <ul className="mb-4 space-y-2">
              {Array.from({ length: plan.features }).map((_, j) => (
                <li key={j} className="flex items-start gap-2">
                  <Bone className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />
                  <Bone className={cn('h-4', j % 2 === 0 ? 'w-40' : 'w-32')} />
                </li>
              ))}
            </ul>
            <Bone className="h-10 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 pt-4">
        <Bone className="h-3.5 w-3.5 rounded-full" />
        <Bone className="h-3 w-36" />
      </div>
    </div>
  );
}

function FormSkeletonBody() {
  return (
    <div className="space-y-4">
      <Bone className="h-28 w-full rounded-3xl" />
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-11 w-full rounded-xl" />
          </div>
        ))}
        <Bone className="mx-auto h-11 w-40 rounded-xl" />
      </div>
    </div>
  );
}

function ChatSkeletonBody() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3">
          <Bone className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-4 w-1/2" />
            <Bone className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CardsSkeletonBody() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Bone className="h-7 w-40" />
        <Bone className="h-4 w-56" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5">
          <Bone className="h-5 w-32" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-2/3" />
          <Bone className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton({
  className,
  variant = 'default',
  showAppBar = false,
  showChat = false,
  backTo,
}: PageSkeletonProps) {
  const customBody =
    variant === 'home' ? (
      <HomePageSkeleton />
    ) : variant === 'diagnosis' ? (
      <DiagnosisPageSkeleton />
    ) : variant === 'doctors' ? (
      <DoctorListSkeleton />
    ) : variant === 'doctor-profile' ? (
      <DoctorProfileSkeleton />
    ) : variant === 'profile' ? (
      <ProfilePageSkeleton />
    ) : variant === 'orders' ? (
      <OrdersPageSkeleton />
    ) : variant === 'plans' ? (
      <PlansPageSkeleton />
    ) : null;

  const body =
    customBody ??
    (variant === 'list' ? (
      <ListRowsSkeleton rows={7} />
    ) : variant === 'form' ? (
      <FormSkeletonBody />
    ) : variant === 'chat' ? (
      <ChatSkeletonBody />
    ) : variant === 'cards' ? (
      <CardsSkeletonBody />
    ) : (
      <DefaultSkeletonBody />
    ));

  return (
    <div
      className={cn('relative h-full w-full overflow-y-auto', className)}
      aria-busy="true"
      aria-label="در حال بارگذاری"
    >
      {showAppBar && <AppBar backTo={backTo} showChat={showChat || variant === 'home'} />}
      {customBody ? body : <div className={cn('px-4 pb-8', showAppBar ? 'pt-24' : 'pt-6')}>{body}</div>}
    </div>
  );
}
