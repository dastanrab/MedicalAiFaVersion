import { useNavigate } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

interface SymptomFlowBackProps {
  to: string;
  label?: string;
  state?: unknown;
  variant?: 'default' | 'onGradient';
  className?: string;
}

export function SymptomFlowBack({
  to,
  label = 'بازگشت',
  state,
  variant = 'default',
  className,
}: SymptomFlowBackProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(to, state !== undefined ? { state } : undefined)}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors active:scale-[0.98]',
        variant === 'onGradient'
          ? 'bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/30'
          : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800',
        className
      )}
    >
      <ChevronRight className="h-5 w-5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
