import { AlertCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "./ui/alert-dialog";

/** نمایش پیام خطا به‌صورت دیالوگ وسط صفحه. با `message === null` بسته است. */
export function ErrorDialog({
    message,
    onClose,
    title = "خطا در ثبت درخواست",
}: {
    message: string | null;
    onClose: () => void;
    title?: string;
}) {
    return (
        <AlertDialog open={message !== null} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent
                dir="rtl"
                className="max-w-[calc(100%-2.5rem)] gap-0 rounded-3xl border-0 p-6 text-center font-[YekanBakhFaNum] shadow-2xl sm:max-w-sm"
            >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                    <AlertCircle className="h-7 w-7 text-red-500" />
                </div>
                <AlertDialogTitle className="text-base font-bold text-slate-800">{title}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="mt-2 space-y-1 text-sm leading-6 text-slate-600">
                        {message?.split("\n").map((line, i) => (
                            <p key={i} dir="auto">{line}</p>
                        ))}
                    </div>
                </AlertDialogDescription>
                <AlertDialogAction
                    onClick={onClose}
                    className="mt-6 h-12 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25"
                >
                    متوجه شدم
                </AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
    );
}
