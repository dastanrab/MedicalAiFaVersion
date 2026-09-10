import { useState } from 'react';
import { Download, Loader2, AlertCircle } from 'lucide-react';

interface SecureFileLinkProps {
    filePath: string;
    requestId: number;
    token: string;
    baseUrl: string;
}

export function SecureFileLink({ filePath, requestId, token, baseUrl }: SecureFileLinkProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    // استخراج نام فایل خالص (حذف عبارت prescriptions/ در صورت وجود)
    const fileName = filePath.split('/').pop() || '';

    const handleDownloadAndOpen = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        setError(false);
console.log('file name',fileName,requestId,baseUrl)
        try {
            // ساخت آدرس بر اساس روتی که در لاراول تعریف کردید
            const url = `${baseUrl}/${requestId}/prescription/${fileName}`;
            console.log('file name',fileName,requestId,baseUrl,url)
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('عدم دسترسی به فایل');
            }

            // تبدیل پاسخ به فایل باینری (Blob)
            const blob = await response.blob();

            // ساخت یک آدرس موقت در حافظه مرورگر برای فایل
            const objectUrl = window.URL.createObjectURL(blob);

            // باز کردن فایل در تب جدید (مرورگر خودش تشخیص میده عکس رو نشون بده یا دانلود کنه)
            window.open(objectUrl, '_blank');

            // آزاد کردن حافظه بعد از ۱ دقیقه
            setTimeout(() => {
                window.URL.revokeObjectURL(objectUrl);
            }, 60000);

        } catch (err) {
            console.error('Error fetching secure file:', err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownloadAndOpen}
            disabled={isLoading}
            className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 hover:underline bg-teal-50 px-2 py-1 rounded transition-colors"
        >
            {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : error ? (
                <AlertCircle className="w-3 h-3 text-red-500" />
            ) : (
                <Download className="w-3 h-3" />
            )}
            <span dir="ltr" className="truncate max-w-[150px]">
                {error ? 'خطا در دریافت' : fileName}
            </span>
        </button>
    );
}
