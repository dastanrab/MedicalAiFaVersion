import type { ReactNode } from 'react';
import { ProviderModal } from '../../components';

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
            <dt className="shrink-0 text-slate-500">{label}</dt>
            <dd className="text-left font-medium text-slate-800">{value}</dd>
        </div>
    );
}

export function ConfirmModal({
    title,
    description,
    note,
    confirmLabel,
    onConfirm,
    onClose,
}: {
    title: string;
    description: string;
    note?: string;
    confirmLabel: string;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <ProviderModal
            open
            onClose={onClose}
            title={title}
            description={description}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                        انصراف
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
                    >
                        {confirmLabel}
                    </button>
                </>
            }
        >
            {note && <p className="text-sm text-slate-500">{note}</p>}
        </ProviderModal>
    );
}
