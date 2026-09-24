export const getInitials = (name: string) => {
    if (!name) return 'کاربر';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
    return name.substring(0, 2);
};

export const renderLastMessage = (msg: string | null) => {
    if (!msg) return 'هنوز پیامی ارسال نشده';
    if (msg.startsWith('http://') || msg.startsWith('https://')) return '📎 فایل ارسال شده';
    return msg;
};