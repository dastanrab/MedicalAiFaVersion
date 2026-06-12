import { Skeleton } from '../../components/ui/skeleton';

const TAB_COUNT = 6;

function SettingsPanelSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <Skeleton className="h-10 w-10 rounded-xl bg-slate-200/80" />
                <Skeleton className="h-5 w-36 bg-slate-200/80" />
            </div>
            <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <Skeleton className="mb-2 h-4 w-28 bg-slate-200/70" />
                        <Skeleton className="h-11 w-full rounded-xl bg-slate-200/60" />
                    </div>
                ))}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl bg-slate-200/50" />
                    ))}
                </div>
                <Skeleton className="h-11 w-36 rounded-xl bg-slate-200/80" />
            </div>
        </div>
    );
}

export function AdminSettingsSkeleton() {
    return (
        <div className="space-y-6" aria-busy="true" aria-label="در حال بارگذاری تنظیمات">
            <div>
                <Skeleton className="mb-2 h-7 w-40 bg-slate-200/80" />
                <Skeleton className="h-4 w-72 bg-slate-200/60" />
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 lg:w-56 lg:flex-col">
                    {Array.from({ length: TAB_COUNT }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-xl bg-slate-200/60 lg:w-full" />
                    ))}
                </nav>

                <div className="min-w-0 flex-1">
                    <SettingsPanelSkeleton />
                </div>
            </div>
        </div>
    );
}
