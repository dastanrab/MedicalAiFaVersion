import { cn } from './ui/utils';

/** اسپینر یکسان برند برای همه حالت‌های بارگذاری */
export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500',
        className,
      )}
      role="status"
      aria-label="در حال بارگذاری"
    />
  );
}

/** لودر تمام‌صفحه بدون متن — برای حالت بارگذاری اولیه صفحات */
export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-[50vh] h-full items-center justify-center', className)}>
      <Spinner />
    </div>
  );
}
