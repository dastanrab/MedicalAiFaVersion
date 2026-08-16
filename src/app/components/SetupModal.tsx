import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import PersianDateInput from './PersianDateInput';
import { toGregorianString } from '../utils/persianDate';

interface SetupModalProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
}

export default function SetupModal({ open, loading, onClose, onSave }: SetupModalProps) {
    const [lastPeriodStart, setLastPeriodStart] = useState<Date>(new Date());
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);

    useEffect(() => {
        if (open) {
            setLastPeriodStart(new Date());
            setCycleLength(28);
            setPeriodLength(5);
        }
    }, [open]);

    if (!open) return null;

    const handleSave = () => {
        onSave({
            last_period_start_date: toGregorianString(lastPeriodStart),
            cycle_length: cycleLength,
            period_length: periodLength,
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
            <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
                        <Sparkles className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">خوش آمدید!</h3>
                    <p className="mt-2 text-sm text-gray-500">برای شروع، اطلاعات سیکل خود را وارد کنید</p>
                </div>

                <div className="space-y-5">
                    <PersianDateInput
                        label="تاریخ شروع آخرین پریود"
                        value={lastPeriodStart}
                        onChange={setLastPeriodStart}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 text-right">
                            <label className="text-xs font-bold text-gray-400 mr-2">میانگین سیکل (روز)</label>
                            <input
                                type="number"
                                placeholder="مثلاً ۲۸"
                                className="w-full rounded-2xl bg-gray-50 p-4 text-center text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                value={cycleLength}
                                onChange={(e) => setCycleLength(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2 text-right">
                            <label className="text-xs font-bold text-gray-400 mr-2">مدت پریود (روز)</label>
                            <input
                                type="number"
                                placeholder="مثلاً ۵"
                                className="w-full rounded-2xl bg-gray-50 p-4 text-center text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-pink-200 text-gray-700"
                                value={periodLength}
                                onChange={(e) => setPeriodLength(parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                </div>

                <Button
                    disabled={loading}
                    className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-l from-pink-500 to-rose-500 text-lg font-bold text-white shadow-lg shadow-pink-200/50"
                    onClick={handleSave}
                >
                    {loading ? 'در حال ثبت...' : 'شروع استفاده'}
                </Button>
            </div>
        </div>
    );
}