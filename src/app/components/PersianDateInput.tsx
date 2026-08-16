import React, { useState } from 'react';
import { formatPersianDate, toGregorianString } from '../utils/persianDate';
import PersianCalendarModal from './PersianCalendarModal';

interface PersianDateInputProps {
    value: Date;
    onChange: (date: Date) => void;
    label?: string;
    className?: string;
}

export default function PersianDateInput({ value, onChange, label, className = '' }: PersianDateInputProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`space-y-2 text-right ${className}`}>
            {label && <label className="text-xs font-bold text-gray-400 mr-2">{label}</label>}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full rounded-2xl bg-[#FFF9FA] p-4 text-center ring-1 ring-pink-100 transition-colors hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-200"
            >
                <span className="block text-base font-bold text-gray-800">{formatPersianDate(value)}</span>
                <span className="mt-1 block text-xs text-gray-400">{toGregorianString(value)}</span>
            </button>

            <PersianCalendarModal
                open={open}
                selectedDate={value}
                onClose={() => setOpen(false)}
                onSelect={(date) => {
                    onChange(date);
                    setOpen(false);
                }}
            />
        </div>
    );
}