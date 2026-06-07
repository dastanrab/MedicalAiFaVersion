import { useState } from 'react';
import {
    X,
    User,
    Phone,
    MessageSquare,
    Shield,
    Eye,
    EyeOff,
    AlertTriangle,
    Lock,
} from 'lucide-react';
import {
    chatStatusLabels,
    chatStatusStyles,
    counterpartyTypeLabels,
    counterpartyTypeStyles,
    chatFlagLabels,
    chatFlagStyles,
    maskPhone,
    maskSensitiveText,
    type AdminChatRow,
} from '../config/chatOptions';

interface ChatDetailsModalProps {
    chat: AdminChatRow;
    onClose: () => void;
}

function formatDateTime(iso: string) {
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

function formatTime(iso: string) {
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export function ChatDetailsModal({ chat, onClose }: ChatDetailsModalProps) {
    const [revealSensitive, setRevealSensitive] = useState(false);

    const hasSensitiveMessages = chat.messages.some((m) => m.isSensitive);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div
                className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
                role="dialog"
                aria-labelledby="chat-details-title"
            >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                    <h3 id="chat-details-title" className="text-lg font-semibold text-slate-800">
                        محتوای گفتگو
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div className="text-xs leading-relaxed text-amber-800">
                            <p className="font-medium">دسترسی نظارتی ادمین</p>
                            <p className="mt-1 text-amber-700/90">
                                محتوای حساس به‌صورت پیش‌فرض ماسک شده است. نمایش کامل فقط برای
                                رسیدگی به تخلف یا پشتیبانی مجاز است.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${chatStatusStyles[chat.status]}`}
                        >
                            {chatStatusLabels[chat.status]}
                        </span>
                        <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${counterpartyTypeStyles[chat.counterpartyType]}`}
                        >
                            {counterpartyTypeLabels[chat.counterpartyType]}
                        </span>
                        {chat.flag !== 'none' && (
                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${chatFlagStyles[chat.flag]}`}
                            >
                                {chatFlagLabels[chat.flag]}
                            </span>
                        )}
                        <span className="text-xs text-slate-400" dir="ltr">
                            اتاق #{chat.roomId}
                        </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <User className="h-4 w-4 text-indigo-500" />
                                کاربر
                            </div>
                            <p className="font-medium text-slate-800">{chat.patientName}</p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600" dir="ltr">
                                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                <span className="w-full text-right">
                                    {revealSensitive ? chat.patientPhone : maskPhone(chat.patientPhone)}
                                </span>
                            </p>
                        </section>

                        <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <MessageSquare className="h-4 w-4 text-indigo-500" />
                                طرف مقابل
                            </div>
                            <p className="font-medium text-slate-800">{chat.counterpartyName}</p>
                            <p className="mt-1 text-xs text-slate-500">
                                {counterpartyTypeLabels[chat.counterpartyType]}
                            </p>
                        </section>
                    </div>

                    {hasSensitiveMessages && (
                        <button
                            type="button"
                            onClick={() => setRevealSensitive((v) => !v)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                            {revealSensitive ? (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    مخفی‌سازی محتوای حساس
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    نمایش محتوای حساس (نیاز به مجوز)
                                </>
                            )}
                        </button>
                    )}

                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-700">
                                پیام‌ها ({chat.messageCount})
                            </p>
                            <p className="text-xs text-slate-400">
                                آخرین: {formatDateTime(chat.lastMessageAt)}
                            </p>
                        </div>

                        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/30 p-4">
                            {chat.messages.length === 0 ? (
                                <p className="py-6 text-center text-sm text-slate-400">
                                    پیامی برای نمایش وجود ندارد
                                </p>
                            ) : (
                                chat.messages.map((msg) => {
                                    const isUser = msg.sender === 'user';
                                    const isSystem = msg.sender === 'system';
                                    const isMasked = msg.isSensitive && !revealSensitive;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                                                    isSystem
                                                        ? 'bg-slate-200/60 text-slate-600'
                                                        : isUser
                                                          ? 'bg-white text-slate-800 ring-1 ring-slate-200'
                                                          : 'bg-indigo-600 text-white'
                                                }`}
                                            >
                                                {!isSystem && (
                                                    <p
                                                        className={`mb-1 text-xs font-medium ${
                                                            isUser ? 'text-slate-500' : 'text-indigo-200'
                                                        }`}
                                                    >
                                                        {msg.senderName}
                                                    </p>
                                                )}
                                                <p className="text-sm leading-relaxed">
                                                    {isMasked ? (
                                                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                                                            <Lock className="h-3.5 w-3.5" />
                                                            {maskSensitiveText(msg.message, false)}
                                                        </span>
                                                    ) : (
                                                        msg.message
                                                    )}
                                                </p>
                                                {msg.isSensitive && !isMasked && (
                                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        اطلاعات حساس
                                                    </p>
                                                )}
                                                <p
                                                    className={`mt-1 text-[10px] ${
                                                        isUser || isSystem
                                                            ? 'text-slate-400'
                                                            : 'text-indigo-200'
                                                    }`}
                                                >
                                                    {formatTime(msg.sentAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                </div>

                <div className="shrink-0 border-t border-slate-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 w-full rounded-xl bg-slate-100 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                        بستن
                    </button>
                </div>
            </div>
        </div>
    );
}
