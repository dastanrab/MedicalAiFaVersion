import { Skeleton } from '../../components/ui/skeleton';

function KpiSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20 bg-slate-200/80" />
                    <Skeleton className="h-8 w-16 bg-slate-200/80" />
                    <Skeleton className="h-3 w-24 bg-slate-200/60" />
                </div>
                <Skeleton className="h-10 w-10 shrink-0 rounded-xl bg-slate-200/80" />
            </div>
        </div>
    );
}

function ChartSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-36 bg-slate-200/80" />
                    <Skeleton className="h-3 w-24 bg-slate-200/60" />
                </div>
                <Skeleton className="h-3 w-20 bg-slate-200/60" />
            </div>
            <Skeleton className="h-[260px] w-full rounded-xl bg-slate-200/60" />
        </div>
    );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28 bg-slate-200/80" />
                    <Skeleton className="h-3 w-36 bg-slate-200/60" />
                </div>
                <Skeleton className="h-3 w-16 bg-slate-200/60" />
            </div>
            <div className="space-y-0 px-5 py-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 border-b border-slate-50 py-3 last:border-0"
                    >
                        <Skeleton className="h-4 flex-1 bg-slate-200/70" />
                        <Skeleton className="h-4 w-24 bg-slate-200/60" />
                        <Skeleton className="h-4 w-20 bg-slate-200/60" />
                        <Skeleton className="h-6 w-16 rounded-full bg-slate-200/60" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AdminDashboardSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری داشبورد">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl bg-slate-200/80" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40 bg-slate-200/80" />
                        <Skeleton className="h-4 w-56 bg-slate-200/60" />
                    </div>
                </div>
                <Skeleton className="h-11 w-28 rounded-xl bg-slate-200/80" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <KpiSkeleton key={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <ChartSkeleton key={i} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <TableSkeleton rows={5} />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <Skeleton className="mb-4 h-4 w-24 bg-slate-200/80" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-11 w-full rounded-xl bg-slate-200/60" />
                        ))}
                    </div>
                    <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex justify-between gap-4">
                                <Skeleton className="h-4 w-20 bg-slate-200/60" />
                                <Skeleton className="h-4 w-8 bg-slate-200/60" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <TableSkeleton rows={5} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[72px] rounded-2xl bg-slate-200/60" />
                ))}
            </div>
        </div>
    );
}
