import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ProviderModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'md' | 'lg';
}

export function ProviderModal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
}: ProviderModalProps) {
    if (!open) return null;

    const maxWidth = size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                type="button"
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-label="بستن"
            />
            <div
                className={`relative w-full ${maxWidth} rounded-2xl border border-slate-200 bg-white shadow-xl`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
                {footer && (
                    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15';

export function ProviderFormField({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs text-slate-500">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export { inputClass };
