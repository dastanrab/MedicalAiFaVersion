import { Skeleton } from '../../components/ui/skeleton';

export function AdminPageSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-2xl bg-slate-200/80" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-36 bg-slate-200/80" />
                    <Skeleton className="h-4 w-52 bg-slate-200/60" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <Skeleton className="mb-2 h-3 w-16 bg-slate-200/60" />
                        <Skeleton className="h-7 w-12 bg-slate-200/80" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Skeleton className="h-56 rounded-2xl bg-slate-200/60" />
                <Skeleton className="h-56 rounded-2xl bg-slate-200/60" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <Skeleton className="mb-4 h-4 w-32 bg-slate-200/80" />
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full bg-slate-200/60" />
                    ))}
                </div>
            </div>
        </div>
    );
}
