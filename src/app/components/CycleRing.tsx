import React from 'react';

interface CycleRingProps {
    daysUntil: number;
    cycleLength: number;
}

export default function CycleRing({ daysUntil, cycleLength }: CycleRingProps) {
    const cycleProgress = (cycleLength - daysUntil) / cycleLength;
    const ringRadius = 108;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringOffset = ringCircumference * (1 - (isNaN(cycleProgress) ? 0.7 : cycleProgress));

    return (
        <div className="relative">
            <svg className="-rotate-90" width="248" height="248" viewBox="0 0 248 248" aria-hidden>
                <circle cx="124" cy="124" r={ringRadius} fill="none" stroke="#fce7f3" strokeWidth="10" />
                <circle
                    cx="124" cy="124" r={ringRadius} fill="none"
                    stroke="url(#cycleGradient)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-700 ease-out"
                />
                <defs>
                    <linearGradient id="cycleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#fb7185" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="mb-1 rounded-full bg-pink-50 px-3 py-1 text-[11px] font-medium text-pink-500">
                    فاز لوتئال
                </span>
                <span className="text-xs text-gray-400">پریود در</span>
                <span className="bg-gradient-to-b from-pink-500 to-rose-500 bg-clip-text text-6xl font-light leading-none text-transparent">
                    {daysUntil}
                </span>
                <span className="text-sm text-gray-500">روز دیگر</span>
            </div>
        </div>
    );
}