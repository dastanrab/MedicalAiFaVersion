import { PageSkeleton, type PageSkeletonVariant } from './PageSkeleton';
import { Skeleton } from './ui/skeleton';
import { cn } from './ui/utils';

/** اسکلتون فشرده برای جایگزینی اسپینرهای قدیمی */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex w-full flex-col items-center justify-center gap-2 py-2', className)}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <Skeleton className="h-4 w-36 rounded-full bg-slate-200/80" />
      <Skeleton className="h-4 w-24 rounded-full bg-slate-200/60" />
    </div>
  );
}

type PageLoaderProps = {
  className?: string;
  variant?: PageSkeletonVariant;
  showAppBar?: boolean;
  showChat?: boolean;
  backTo?: string;
};

/** اسکلتون تمام‌صفحه برای حالت بارگذاری اولیه صفحات */
export function PageLoader({
  className,
  variant = 'default',
  showAppBar = false,
  showChat = false,
  backTo,
}: PageLoaderProps) {
  return (
    <PageSkeleton
      className={className}
      variant={variant}
      showAppBar={showAppBar}
      showChat={showChat}
      backTo={backTo}
    />
  );
}
