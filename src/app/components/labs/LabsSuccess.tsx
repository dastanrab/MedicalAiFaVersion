import { PartyPopper } from "lucide-react";
import { Button } from "../ui/button";
import { AppBar } from "../AppBar";

interface Props {
    successMessage: string;
    onBack: () => void;
}

export function LabsSuccess({ successMessage, onBack }: Props) {
    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/services" />
            <div className="flex min-h-[calc(100%-1px)] flex-col items-center justify-center px-6 pt-24">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-200">
                    <PartyPopper className="h-10 w-10 text-white" />
                </div>
                <h1 className="mb-2 text-xl font-black text-slate-800">درخواست شما ثبت شد</h1>
                <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-slate-500">
                    {successMessage}
                </p>
                <Button className="h-12 rounded-2xl bg-blue-600 px-8 text-white hover:bg-blue-700" onClick={onBack}>
                    بازگشت به خدمات
                </Button>
            </div>
        </div>
    );
}