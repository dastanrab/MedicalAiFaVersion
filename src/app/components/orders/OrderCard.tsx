import React from 'react';
import { ChevronLeft, CalendarClock, Building2 } from 'lucide-react';
import { Card } from '../ui/card';
import { UserRequestOrder, formatOrderPrice, serviceTypeLabels } from '../../data/userOrdersMockData';
import { serviceIcons, serviceIconStyles, getStatusClass } from './utils';

interface OrderCardProps {
    order: UserRequestOrder;
    onOpen: () => void;
}

export function OrderCard({ order, onOpen }: OrderCardProps) {
    const Icon = serviceIcons[order.serviceType];
    const statusClass = getStatusClass(order.status);

    return (
        <button type="button" onClick={onOpen} className="block w-full text-right">
            <Card
                dir="rtl"
                className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
                <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${serviceIconStyles[order.serviceType]}`}>
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                                {serviceTypeLabels[order.serviceType]}
                            </span>
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${statusClass}`}>
                                {order.status_label}
                            </span>
                        </div>

                        <h3 className="mt-2 text-sm font-bold leading-snug text-gray-900">
                            {order.title}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Building2 className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{order.providerName}</span>
                        </p>
                        {order.summary && (
                            <p className="mt-1 line-clamp-1 text-[11px] text-gray-400">
                                {order.summary}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                        {order.amount != null && (
                            <p className="text-sm font-bold text-gray-900">
                                {formatOrderPrice(order.amount)} ت
                            </p>
                        )}
                        <ChevronLeft className="h-4 w-4 text-gray-300" />
                    </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-gray-50 pt-3 text-[11px] text-gray-500">
                    <span>کد: {order.code}</span>
                    {order.scheduledAt ? (
                        <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" />
                            {order.scheduledAt}
                        </span>
                    ) : (
                        <span>{order.createdAt}</span>
                    )}
                </div>
            </Card>
        </button>
    );
}