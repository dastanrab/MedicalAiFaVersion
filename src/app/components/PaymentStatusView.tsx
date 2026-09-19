import type { ReactNode } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  XCircle,
} from 'lucide-react';
import { cn } from './ui/utils';

export type PaymentStatusKind = 'loading' | 'success' | 'failed' | 'cancelled';

export type PaymentDetailRow = {
  label: string;
  value: ReactNode;
  mono?: boolean;
  copyValue?: string;
  emphasize?: boolean;
};

type PaymentStatusViewProps = {
  status: PaymentStatusKind;
  title: string;
  subtitle?: string;
  details?: PaymentDetailRow[];
  notice?: string;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  compact?: boolean;
};

const toneByStatus: Record<
  PaymentStatusKind,
  {
    glow: string;
    ring: string;
    iconWrap: string;
    icon: string;
    badge: string;
    badgeText: string;
    title: string;
    accentBar: string;
  }
> = {
  loading: {
    glow: 'from-sky-200/50 via-blue-100/30 to-transparent',
    ring: 'border-sky-100',
    iconWrap: 'bg-gradient-to-br from-sky-50 to-blue-100 text-sky-600',
    icon: 'text-sky-600',
    badge: 'bg-sky-50 text-sky-700 ring-sky-100',
    badgeText: 'در حال پردازش',
    title: 'text-slate-800',
    accentBar: 'from-sky-400 to-blue-500',
  },
  success: {
    glow: 'from-emerald-200/45 via-teal-100/25 to-transparent',
    ring: 'border-emerald-100',
    iconWrap: 'bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-600',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    badgeText: 'تراکنش موفق',
    title: 'text-emerald-950',
    accentBar: 'from-emerald-400 to-teal-500',
  },
  failed: {
    glow: 'from-rose-200/45 via-orange-100/20 to-transparent',
    ring: 'border-rose-100',
    iconWrap: 'bg-gradient-to-br from-rose-50 to-red-100 text-rose-600',
    icon: 'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 ring-rose-100',
    badgeText: 'تراکنش ناموفق',
    title: 'text-rose-950',
    accentBar: 'from-rose-400 to-orange-400',
  },
  cancelled: {
    glow: 'from-amber-200/40 via-orange-100/20 to-transparent',
    ring: 'border-amber-100',
    iconWrap: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600',
    icon: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-800 ring-amber-100',
    badgeText: 'لغو شده',
    title: 'text-amber-950',
    accentBar: 'from-amber-400 to-orange-400',
  },
};

function StatusIcon({ status }: { status: PaymentStatusKind }) {
  const tone = toneByStatus[status];
  if (status === 'loading') {
    return <Loader2 className={cn('h-11 w-11 animate-spin', tone.icon)} strokeWidth={2.2} />;
  }
  if (status === 'success') {
    return <CheckCircle2 className={cn('h-11 w-11', tone.icon)} strokeWidth={2.2} />;
  }
  return <XCircle className={cn('h-11 w-11', tone.icon)} strokeWidth={2.2} />;
}

function DetailRow({
  row,
  isLast,
}: {
  row: PaymentDetailRow;
  isLast: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 py-3 text-sm',
        !isLast && 'border-b border-dashed border-slate-200/80'
      )}
    >
      <span className="shrink-0 text-slate-500">{row.label}</span>
      <div className="flex min-w-0 items-center gap-1.5 text-left" dir="ltr">
        <span
          className={cn(
            'truncate text-slate-800',
            row.mono && 'font-mono text-[13px] tracking-wide',
            row.emphasize && 'text-base font-bold text-slate-900'
          )}
        >
          {row.value}
        </span>
        {row.copyValue ? <CopyButton value={row.copyValue} /> : null}
      </div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      title="کپی"
      className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-600"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          /* ignore */
        }
      }}
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

export function PaymentStatusView({
  status,
  title,
  subtitle,
  details,
  notice,
  primaryAction,
  secondaryAction,
  className,
  compact = false,
}: PaymentStatusViewProps) {
  const tone = toneByStatus[status];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm',
        className
      )}
      dir="rtl"
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b',
          tone.glow
        )}
      />
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-l', tone.accentBar)} />

      <div className={cn('relative px-5 pb-5 pt-7 sm:px-7', compact ? 'sm:pt-6' : 'sm:pt-8')}>
        <div className="flex flex-col items-center text-center">
          <div
            className={cn(
              'relative mb-5 flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full border-4 bg-white shadow-inner',
              tone.ring
            )}
          >
            <div
              className={cn(
                'flex h-[4.1rem] w-[4.1rem] items-center justify-center rounded-full shadow-sm',
                tone.iconWrap
              )}
            >
              <StatusIcon status={status} />
            </div>
            {status === 'success' ? (
              <span className="absolute -bottom-0.5 -left-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-white">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            ) : null}
          </div>

          <span
            className={cn(
              'mb-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset',
              tone.badge
            )}
          >
            {tone.badgeText}
          </span>

          <h1 className={cn('text-xl font-extrabold tracking-tight sm:text-2xl', tone.title)}>
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        {details && details.length > 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-1">
            {details.map((row, index) => (
              <DetailRow key={`${row.label}-${index}`} row={row} isLast={index === details.length - 1} />
            ))}
          </div>
        ) : null}

        {notice ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-3 text-right text-xs leading-5 text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>{notice}</span>
          </div>
        ) : null}

        {(primaryAction || secondaryAction) && (
          <div className={cn('mt-6 flex flex-col gap-2.5', secondaryAction && primaryAction && 'sm:flex-row-reverse')}>
            {primaryAction}
            {secondaryAction}
          </div>
        )}
      </div>
    </div>
  );
}

export const paymentActionClass = {
  primary:
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-500 to-blue-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.8)] transition hover:brightness-105 active:scale-[0.99]',
  success:
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,0.75)] transition hover:brightness-105 active:scale-[0.99]',
  danger:
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-rose-500 to-red-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(244,63,94,0.7)] transition hover:brightness-105 active:scale-[0.99]',
  secondary:
    'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]',
};
