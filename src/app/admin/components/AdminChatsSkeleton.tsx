import { Skeleton } from '../../components/ui/skeleton';

const TABLE_ROWS = 8;

function FilterSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-4 w-28 bg-slate-200/80" />
                <Skeleton className="h-3 w-20 bg-slate-200/60" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="mb-1.5 h-3 w-24 bg-slate-200/60" />
                        <Skeleton className="h-11 w-full rounded-xl bg-slate-200/60" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function KpiCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <Skeleton className="mb-2 h-3 w-20 bg-slate-200/60" />
                    <Skeleton className="h-8 w-10 bg-slate-200/80" />
                </div>
            ))}
        </div>
    );
}

export function AdminChatsTableSkeleton({ rows = TABLE_ROWS }: { rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-6 bg-slate-200/60" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="mb-1.5 h-4 w-24 bg-slate-200/70" />
                        <Skeleton className="h-3 w-20 bg-slate-200/50" />
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <Skeleton className="h-4 w-28 bg-slate-200/70" />
                            <Skeleton className="h-5 w-20 shrink-0 rounded-full bg-slate-200/60" />
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-4 w-40 bg-slate-200/60" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-3 w-24 bg-slate-200/50" />
                    </td>
                    <td className="px-4 py-3">
                        <Skeleton className="h-6 w-14 rounded-full bg-slate-200/60" />
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex gap-1">
                            <Skeleton className="h-9 w-9 rounded-lg bg-slate-200/60" />
                            <Skeleton className="h-9 w-9 rounded-lg bg-slate-200/60" />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}

export function AdminChatsSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری گفتگوها">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-2xl bg-slate-200/80" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-24 bg-slate-200/80" />
                        <Skeleton className="h-4 w-56 bg-slate-200/60" />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-11 w-28 rounded-xl bg-slate-200/80" />
                    <Skeleton className="h-11 w-24 rounded-xl bg-slate-200/80" />
                </div>
            </div>

            <KpiCardsSkeleton />
            <FilterSkeleton />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex gap-4">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Skeleton key={i} className="h-3 w-16 bg-slate-200/60" />
                        ))}
                    </div>
                </div>
                <table className="w-full">
                    <tbody>
                        <AdminChatsTableSkeleton rows={TABLE_ROWS} />
                    </tbody>
                </table>
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                    <Skeleton className="h-3 w-32 bg-slate-200/60" />
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-8 w-8 rounded-lg bg-slate-200/60" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
