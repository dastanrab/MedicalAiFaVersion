import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

// ─── Validation & Format Helpers ───
export function isValidNationalCode(code: string): boolean {
    if (!/^\d{10}$/.test(code)) return false;
    if (/^(\d)\1{9}$/.test(code)) return false;
    const digits = code.split('').map(Number);
    const check = digits[9];
    const sum = digits.slice(0, 9).reduce((acc, d, i) => acc + d * (10 - i), 0);
    const remainder = sum % 11;
    return remainder < 2 ? check === remainder : check === 11 - remainder;
}

export function isValidIranPhone(phone: string): boolean {
    return /^09[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

export const formatPrice = (price: number) =>
    `${new Intl.NumberFormat('fa-IR').format(price)} تومان`;

export const formatDate = (dateString: string) => {
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            weekday: 'long', day: 'numeric', month: 'long',
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
};

export const getShortDay = (dateString: string) => {
    try {
        return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' })
            .format(new Date(dateString));
    } catch {
        return '';
    }
};

export const getShortDate = (dateString: string) => {
    try {
        return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' })
            .format(new Date(dateString));
    } catch {
        return dateString;
    }
};

// ─── Shared Components ───

type BubbleState = 'done' | 'active' | 'pending';
function StepBubble({ label, state, number }: { label: string; state: BubbleState; number?: string }) {
    const bg = state === 'pending' ? 'bg-white border-2 border-gray-300' : 'bg-blue-600';
    const text = state === 'pending' ? 'text-gray-400' : 'text-white';
    return (
        <div className="flex flex-col items-center bg-[#f8f9fa] px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 shadow-sm font-bold text-xs ${bg} ${text}`}>
                {state === 'done' ? <Check className="w-4 h-4" /> : number}
            </div>
            <span className={`text-xs font-semibold ${state === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>
                {label}
            </span>
        </div>
    );
}

export function Stepper({ step }: { step: 2 | 3 }) {
    return (
        <div className="max-w-2xl mx-auto mb-8 px-4">
            <div className="flex items-center justify-between relative">
                <div className="absolute inset-x-0 top-4 h-0.5 bg-gray-200 -z-10" />
                <div
                    className="absolute right-0 top-4 h-0.5 bg-blue-600 -z-10 transition-all duration-300"
                    style={{ width: step === 2 ? '50%' : '100%' }}
                />
                <StepBubble label="ثبت نوبت" state="done" />
                <StepBubble label="اطلاعات مراجعه‌کننده" state={step >= 2 ? (step > 2 ? 'done' : 'active') : 'pending'} number="۲" />
                <StepBubble label="ایجاد حساب / پرداخت" state={step === 3 ? 'active' : 'pending'} number="۳" />
            </div>
        </div>
    );
}

export function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string, onExpire: () => void }) {
    const [timeLeft, setTimeLeft] = useState('...');
    const hasExpired = useRef(false);

    useEffect(() => {
        let safeExpiresAt = expiresAt.replace(' ', 'T');
        if (!safeExpiresAt.endsWith('Z') && !safeExpiresAt.includes('+')) {
            safeExpiresAt += 'Z';
        }
        const targetTime = new Date(safeExpiresAt).getTime();

        const calculate = () => {
            const now = new Date().getTime();
            const diff = targetTime - now;

            if (isNaN(diff)) {
                setTimeLeft('--:--');
                return;
            }

            if (diff <= 0) {
                setTimeLeft('00:00');
                if (!hasExpired.current) {
                    hasExpired.current = true;
                    setTimeout(onExpire, 500);
                }
                return;
            }

            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        calculate();
        const timer = setInterval(calculate, 1000);
        return () => clearInterval(timer);
    }, [expiresAt, onExpire]);

    return <span className="font-mono font-bold mx-1 text-red-600" dir="ltr">{timeLeft}</span>;
}