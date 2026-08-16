import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface InsightModalProps {
    insight: any;
    onClose: () => void;
}

export default function InsightModal({ insight, onClose }: InsightModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center" onClick={onClose}>
            <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl duration-200" onClick={(e) => e.stopPropagation()}>
                <div className={`relative overflow-hidden bg-gradient-to-br px-6 pb-8 pt-6 ${insight.headerGradient}`}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="relative z-10 mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                            {React.cloneElement(insight.icon as React.ReactElement, { className: 'h-8 w-8 text-white' })}
                        </div>
                        <h3 className="text-xl font-bold text-white">{insight.title}</h3>
                    </div>
                </div>
                <div className="space-y-5 px-6 py-6">
                    <p className="text-sm leading-relaxed text-gray-600">{insight.details}</p>
                    <ul className="space-y-2.5">
                        {insight.tips.map((tip: string) => (
                            <li key={tip} className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-600 ring-1 ${insight.dialogTheme.tipsItemBg} ${insight.dialogTheme.tipsItemRing}`}>
                                <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${insight.dialogTheme.tipsDot}`} />
                                <span className="leading-relaxed">{tip}</span>
                            </li>
                        ))}
                    </ul>
                    <Button className={insight.dialogTheme.button} onClick={onClose}>
                        متوجه شدم
                    </Button>
                </div>
            </div>
        </div>
    );
}