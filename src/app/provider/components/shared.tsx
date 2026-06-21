import type { ReactNode } from 'react';

interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: 'default' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'blue';
}

const tones = {
    default: 'border-slate-200 bg-white text-slate-800',
    emerald: 'border-emerald-100 bg-emerald-50/50 text-emerald-800',
    amber: 'border-amber-100 bg-amber-50/50 text-amber-800',
    indigo: 'border-indigo-100 bg-indigo-50/50 text-indigo-800',
    rose: 'border-rose-100 bg-rose-50/50 text-rose-800',
    blue: 'border-blue-100 bg-blue-50/50 text-blue-800',
};

const iconTones = {
    default: 'bg-slate-100 text-slate-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    rose: 'bg-rose-100 text-rose-600',
    blue: 'bg-blue-100 text-blue-600',
};

export function KpiCard({ label, value, sub, icon: Icon, tone = 'default' }: KpiCardProps) {
    return (
        <div className={`rounded-2xl border px-4 py-4 ${tones[tone]}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-semibold">{value}</p>
                    {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
                </div>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconTones[tone]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </div>
    );
}

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

interface StatusBadgeProps {
    label: string;
    className: string;
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
    return (
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${className}`}>
            {label}
        </span>
    );
}

interface FilterSelectProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}

export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

interface SearchInputProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'جستجو...' }: SearchInputProps) {
    return (
        <input
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-400 md:min-w-[220px]"
        />
    );
}

interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}

interface TimelineProps {
    entries: { at: string; label: string }[];
}

export function Timeline({ entries }: TimelineProps) {
    return (
        <ol className="space-y-3">
            {entries.map((e, i) => (
                <li key={i} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                    <div>
                        <p className="font-medium text-slate-700">{e.label}</p>
                        <p className="text-xs text-slate-400">{e.at}</p>
                    </div>
                </li>
            ))}
        </ol>
    );
}

export function formatPrice(n: number) {
    return n.toLocaleString('fa-IR');
}

export function formatFaNumber(n: number) {
    return n.toLocaleString('fa-IR');
}
