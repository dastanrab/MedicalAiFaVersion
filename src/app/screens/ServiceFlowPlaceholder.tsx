import { useNavigate } from 'react-router';
import { ArrowRight, Construction } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppBar } from '../components/AppBar';

interface ServiceFlowPlaceholderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
}

export function ServiceFlowPlaceholder({
    title,
    description,
    icon: Icon,
    gradient,
}: ServiceFlowPlaceholderProps) {
    const navigate = useNavigate();

    return (
        <div
            className="flex h-full min-h-[60vh] flex-col bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]"
            dir="rtl"
        >
            <AppBar />

            <div className="flex flex-1 flex-col items-center justify-center px-6 pt-24">
                <div
                    className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${gradient} shadow-lg`}
                >
                    <Icon className="h-10 w-10 text-white" />
                </div>

                <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
                <p className="mb-8 max-w-sm text-center text-sm text-gray-600">{description}</p>

                <div className="mb-8 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <Construction className="h-4 w-4 shrink-0" />
                    <span>این بخش به‌زودی راه‌اندازی می‌شود.</span>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/services')}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
                >
                    <ArrowRight className="h-4 w-4" />
                    بازگشت به خدمات
                </button>
            </div>
        </div>
    );
}
