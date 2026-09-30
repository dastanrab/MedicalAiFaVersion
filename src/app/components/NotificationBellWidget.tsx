import React, { useEffect, useRef } from 'react';
import {
    NovuProvider,
    PopoverNotificationCenter,
    NotificationBell,
    useNotifications,
} from '@novu/notification-center';
import { Info } from 'lucide-react';
// import { useUserStore } from '@/store/useUserStore';

// ================= کامپوننت آپدیت عنوان تب =================
const TabTitleUpdater = () => {
    const { unseenCount } = useNotifications();
    const originalTitle = useRef(document.title);

    useEffect(() => {
        if (unseenCount > 0) {
            document.title = `(${unseenCount}) اعلان جدید - ${originalTitle.current}`;
        } else {
            document.title = originalTitle.current;
        }
    }, [unseenCount]);

    return null;
};

// ================= کامپوننت آیتم سفارشی آپدیت‌شده =================
const NotificationItem = ({
                              notification,
                              handleNotificationClick,
                          }) => {
    const { markAsRead } = useNotifications();
    const isRead = notification?.read === true;

    // استخراج دیتای سفارشی از payload
    const payload = notification?.payload || {};
    const title = payload.title || '';
    const msg = payload.msg || '';

    // دریافت لینک (اولویت با payload و سپس cta نوو)
    const actionLink = payload.link || notification?.cta?.data?.url;
    const avatarUrl = notification?.avatar;

    const handleClick = () => {
        handleNotificationClick?.(notification);
        if (markAsRead && !isRead) {
            const messageId = notification._id || notification.id;
            markAsRead(messageId);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`relative cursor-pointer p-4 transition-all duration-200 border-b border-gray-100 last:border-0 hover:bg-slate-50 ${
                isRead ? 'bg-white opacity-80' : 'bg-blue-50/40'
            }`}
        >
            {/* نشانگر خوانده نشدن */}
            {!isRead && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 shadow-sm" />
            )}

            <div className="flex gap-3 items-start mr-3">
                {/* آیکون یا آواتار اعلان */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 overflow-hidden">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="notification icon" className="w-full h-full object-cover" />
                    ) : (
                        <Info size={20} strokeWidth={2} />
                    )}
                </div>

                {/* محتوای اعلان */}
                <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                        {/* عنوان اعلان از payload.title */}
                        {title && (
                            <h4 className="text-sm font-semibold text-slate-800 m-0">
                                {title}
                            </h4>
                        )}

                        {/* تاریخ */}
                        <span className="text-[11px] font-medium text-slate-400 mr-auto shrink-0 mt-0.5">
                            {notification?.createdAt
                                ? new Date(notification.createdAt).toLocaleDateString('fa-IR', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                                : 'اکنون'}
                        </span>
                    </div>

                    {/* متن پیام از payload.msg */}
                    {msg && (
                        <p className="text-sm leading-6 text-slate-600 m-0">
                            {msg}
                        </p>
                    )}

                    {/* لینک اکشن (در صورت وجود) */}
                    {actionLink && (
                        <div className="pt-2">
                            <a
                                href={actionLink}
                                onClick={(e) => e.stopPropagation()}
                                target={notification?.cta?.data?.target || '_blank'}
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                مشاهده جزئیات
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ================= کامپوننت اصلی زنگوله =================
const NotificationBellWidget = ({
                                    subscriberId = "8a9dc60c-d6a1-42d6-8d6b-9e763c75ccc8",
                                    applicationIdentifier = "m-_DUfjoPvc4",
                                    backendUrl = "https://novu.mediraai.com",
                                    socketUrl  = "https://ws-novu.mediraai.com"

                                }) => {
    // const subscriberId = useUserStore((state) => state.user?.novu_subscriber_id

    if (!subscriberId) return null;

    return (
        <div dir="rtl" className="relative">
            <style>{`
                a[href*="novu.co"] { display: none !important; }
                .nc-popover-container { border-radius: 0.75rem !important; overflow: hidden; }
            `}</style>

            <NovuProvider
                subscriberId={subscriberId}
                applicationIdentifier={applicationIdentifier}
                backendUrl={backendUrl}
                socketUrl={socketUrl}
            >
                <TabTitleUpdater />

                <PopoverNotificationCenter
                    colorScheme="light"
                    position="bottom-end"
                    offset={15}
                    showUserPreferences={false}
                    footer={() => null}
                    listItem={(notification, _, handleNotificationClick) => (
                        <NotificationItem
                            notification={notification}
                            handleNotificationClick={handleNotificationClick}
                        />
                    )}
                >
                    {({ unseenCount }) => (
                        <div className="cursor-pointer flex items-center justify-center p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all relative">
                            <NotificationBell unseenCount={unseenCount} />
                        </div>
                    )}
                </PopoverNotificationCenter>
            </NovuProvider>
        </div>
    );
};

export default NotificationBellWidget;