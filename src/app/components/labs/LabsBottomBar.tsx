import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
    step: number;
    setStep: (s: number) => void;
    submitting: boolean;
    disabledNext: boolean;
    disabledSubmit: boolean;
    handleNextStep: () => void;
    submitLabRequest: () => void;
    requestType: 1 | 2 | 3 | null;
}

export function LabsBottomBar({ step, setStep, submitting, disabledNext, disabledSubmit, handleNextStep, submitLabRequest, requestType }: Props) {
    return (
        <div className="sticky bottom-0 z-10 mt-auto bg-gradient-to-t from-white via-white/95 to-transparent pb-2 pt-6">
            <div className="flex items-center justify-center gap-3">
                {step > 1 && (
                    <Button variant="outline" className="h-12 w-12 shrink-0 rounded-full border-blue-100 bg-white p-0 text-blue-600 shadow-md shadow-blue-100/80 hover:bg-blue-50 hover:text-blue-700" onClick={() => setStep(step - 1)} disabled={submitting}>
                        <ArrowLeft className="h-5 w-5 rotate-180" />
                    </Button>
                )}

                {step === 1 && (
                    <Button className="h-12 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40" disabled={disabledNext} onClick={handleNextStep}>
                        {submitting ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />در حال ثبت...</> : requestType === 1 ? <>مرحله بعد<ArrowLeft className="mr-2 h-4 w-4" /></> : "ثبت درخواست"}
                    </Button>
                )}

                {step === 2 && (
                    <Button className="h-12 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-10 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40" disabled={disabledSubmit} onClick={submitLabRequest}>
                        {submitting ? <><Loader2 className="ml-2 h-4 w-4 animate-spin" />در حال ثبت...</> : "ثبت نهایی درخواست"}
                    </Button>
                )}
            </div>
        </div>
    );
}