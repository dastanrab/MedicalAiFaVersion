import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card } from './ui/card';

interface InsightCardProps {
    item: any;
    onClick: () => void;
}

export default function InsightCard({ item, onClick }: InsightCardProps) {
    return (
        <Card
            role="button"
            tabIndex={0}
            onClick={onClick}
            className="cursor-pointer overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-sm ring-1 ring-pink-50 transition-all hover:shadow-md hover:ring-pink-100 active:scale-[0.99]"
        >
            <div className="flex">
                <div className={`w-1 shrink-0 bg-gradient-to-b ${item.accent}`} />
                <div className="flex flex-1 items-center gap-3 p-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                        {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.description}</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-gray-300" />
                </div>
            </div>
        </Card>
    );
}