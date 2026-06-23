import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toFaDigits } from '../utils/jalali';

interface ProviderPaginationProps {
    page: number;
    totalPages: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export function ProviderPagination({
    page,
    totalPages,
    total,
    pageSize,
    onPageChange,
}: ProviderPaginationProps) {
    if (totalPages <= 1) return null;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    const pages: (number | 'ellipsis')[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== 'ellipsis') {
            pages.push('ellipsis');
        }
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-500">
                نمایش {toFaDigits(start)} تا {toFaDigits(end)} از {toFaDigits(total)} مورد
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="صفحه قبل"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
                {pages.map((p, i) =>
                    p === 'ellipsis' ? (
                        <span key={`e-${i}`} className="px-2 text-slate-400">
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm ${
                                p === page
                                    ? 'bg-rose-600 font-medium text-white'
                                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {toFaDigits(p)}
                        </button>
                    )
                )}
                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    aria-label="صفحه بعد"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
