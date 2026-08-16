import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import PersianDateInput from './PersianDateInput';
import { toGregorianString } from '../utils/persianDate';

interface StartPeriodModalProps {
    open: boolean;
    selectedDate: Date;
    loading: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function StartPeriodModal({ open, selectedDate, loading, onClose, onSave }: StartPeriodModalProps) {
    const [startDate, setStartDate] = useState<Date>(selectedDate);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {
        if (open) {
            setStartDate(selectedDate);
            setEndDate(null);
        }
    }, [open, selectedDate]);

    if (!open) return null;

    const handleSave = () => {
        onSave({
            start_date: toGregorianString(startDate),
            end_date: endDate ? toGregorianString(endDate) : '',
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
            <div className="w-full max-w-sm rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">ثبت شروع دوره جدید</h3>
                    <button type="button" onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-400 hover:bg-gray-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-5">
                    <PersianDateInput
                        label="تاریخ شروع پریود"
                        value={startDate}
                        onChange={setStartDate}
                    />

                    <PersianDateInput
                        label="تاریخ پایان پریود (اختیاری)"
                        value={endDate || startDate}
                        onChange={(date) => setEndDate(date)}
                    />
                    <span className="block text-[10px] text-gray-400 mr-2 leading-relaxed">
                        در صورتی که دوره به اتمام نرسیده است، این بخش را خالی بگذارید.
                    </span>
                </div>

                <Button
                    disabled={loading}
                    className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-base font-bold text-white shadow-lg hover:from-pink-600 hover:to-rose-600"
                    onClick={handleSave}
                >
                    {loading ? 'در حال ثبت...' : 'ثبت شروع دوره جدید'}
                </Button>
            </div>
        </div>
    );
}