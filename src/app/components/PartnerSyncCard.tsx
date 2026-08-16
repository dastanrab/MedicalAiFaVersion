import React, { useMemo } from 'react';
import { Share2, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface PartnerSyncCardProps {
    trackerSettings: any;
    copiedCode: boolean;
    copiedLink: boolean;
    onCopyCode: () => void;
    onCopyLink: () => void;
}

export default function PartnerSyncCard({ trackerSettings, copiedCode, copiedLink, onCopyCode, onCopyLink }: PartnerSyncCardProps) {
    if (!trackerSettings?.partner_code) return null;

    const inviteLink = useMemo(() => {
        if (!trackerSettings?.partner_code) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/invite/${trackerSettings.partner_code}`;
    }, [trackerSettings]);

    return (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-pink-50">
            <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100">
                    <Share2 className="h-3.5 w-3.5 text-pink-500" />
                </div>
                <h2 className="text-base font-bold text-gray-800">همگام‌سازی با پارتنر</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
                با اشتراک‌گذاری این کد یا لینک، پارتنر شما می‌تواند بدون دیدن جزئیات حساس، از وضعیت کلی سیکل و حالات روحی شما برای حمایت بهتر مطلع شود.
            </p>
            <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-pink-50/50 p-3 ring-1 ring-pink-100">
                    <span className="text-xs font-bold text-gray-500">کد اختصاصی:</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-pink-600 tracking-wider">{trackerSettings.partner_code}</span>
                        <button onClick={onCopyCode} className="p-1.5 rounded-lg hover:bg-pink-100 transition-colors text-pink-600" title="کپی کردن کد">
                            {copiedCode ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <Button
                    onClick={onCopyLink}
                    variant="outline"
                    className="w-full h-11 rounded-2xl border-pink-200 bg-white text-xs text-pink-600 hover:bg-pink-50 flex items-center justify-center gap-2"
                >
                    {copiedLink ? (
                        <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            لینک دعوت کپی شد!
                        </>
                    ) : (
                        <>
                            <Share2 className="h-4 w-4" />
                            کپی لینک دعوت مستقیم پارتنر
                        </>
                    )}
                </Button>
            </div>
        </section>
    );
}