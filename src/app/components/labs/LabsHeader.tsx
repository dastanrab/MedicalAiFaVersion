import { TestTube, Check } from "lucide-react";
import { stepsData } from "./labs.types";

export function LabsHeader({ step }: { step: number }) {
    return (
        <div className="mb-8 mt-6 shrink-0">
            <div className="mb-6 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 shadow-lg shadow-blue-200">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                    <TestTube className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="truncate text-lg font-black tracking-tight text-white">درخواست آزمایش</h1>
                    <p className="mt-0.5 text-[11px] text-white/80">
                        مرحله {step} از {stepsData.length} · {stepsData[step - 1].title}
                    </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-black text-white ring-1 ring-white/25">
                    {step}/{stepsData.length}
                </div>
            </div>

            <div className="relative flex items-center justify-between px-2">
                <div className="absolute left-6 right-6 top-5 -z-10 h-1 overflow-hidden rounded-full bg-blue-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-l from-sky-500 to-blue-600 transition-all duration-500 ease-out"
                        style={{ width: `${((step - 1) / (stepsData.length - 1)) * 100}%`, marginRight: "auto" }}
                    />
                </div>
                {stepsData.map((s) => {
                    const isCompleted = step > s.id;
                    const isCurrent = step === s.id;
                    const StepIcon = isCompleted ? Check : s.icon;
                    return (
                        <div key={s.id} className="z-10 flex flex-col items-center gap-2 bg-transparent">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-500 ${isCompleted ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200" : isCurrent ? "scale-110 border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-white" : "border-blue-200 bg-white text-blue-300 ring-4 ring-white"}`}>
                                <StepIcon className={`h-5 w-5 ${isCompleted ? "animate-in zoom-in duration-300" : ""}`} />
                            </div>
                            <span className={`text-[11px] font-bold transition-colors duration-300 ${isCompleted ? "text-emerald-600" : isCurrent ? "text-blue-700" : "text-slate-400"}`}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}