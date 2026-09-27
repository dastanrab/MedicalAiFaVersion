import { useEffect, useRef, useState } from "react";
import { Loader2, Moon, Sun, Sunset } from "lucide-react";

const API_BASE_URL = "https://api.mediraai.com";

type ShiftData = {
    isActive: boolean;
    start?: string;
    end?: string;
    capacity?: number;
};

const SHIFTS = [
    { id: 1, label: "صبح", icon: Sun },
    { id: 2, label: "ظهر/عصر", icon: Sunset },
    { id: 3, label: "شب", icon: Moon },
] as const;

export function getShiftLabel(id: number | null) {
    return SHIFTS.find((s) => s.id === id)?.label ?? null;
}

/**
 * انتخاب شیفت مراجعه‌ی نمونه‌گیر برای یک آزمایشگاه (`shift_type` در ثبت درخواست).
 * شیفت‌های فعال از `/api/user/labs/{id}/shifts` خوانده می‌شوند؛ اگر دریافت نشد، هر سه شیفت نمایش داده می‌شود.
 */
export function LabShiftPicker({
    labId,
    accessToken,
    value,
    onChange,
}: {
    labId: number;
    accessToken: string | null;
    value: number | null;
    onChange: (shift: number | null) => void;
}) {
    const [shifts, setShifts] = useState<Record<number, ShiftData> | null>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const valueRef = useRef(value);
    valueRef.current = value;
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setFailed(false);
        setShifts(null);

        (async () => {
            let data: Record<number, ShiftData> | null = null;
            try {
                const res = await fetch(`${API_BASE_URL}/api/user/labs/${labId}/shifts`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: "application/json",
                    },
                });
                const json = await res.json();
                if (res.ok && json?.success && json.data && typeof json.data === "object") {
                    data = json.data;
                }
            } catch {
                data = null;
            }
            if (cancelled) return;

            setFailed(data === null);
            setShifts(data);
            setLoading(false);

            const available = SHIFTS.filter((s) => (data ? data[s.id]?.isActive : true)).map((s) => s.id);
            if (!available.includes(valueRef.current as 1 | 2 | 3)) {
                onChangeRef.current(available[0] ?? null);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [labId, accessToken]);

    const visibleShifts = SHIFTS.filter((s) => (shifts ? shifts[s.id]?.isActive : failed));

    return (
        <div>
            <h3 className="mb-3 text-sm font-bold text-slate-800">زمان مراجعه نمونه‌گیر</h3>

            {loading ? (
                <div className="flex h-20 items-center justify-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    در حال دریافت شیفت‌های آزمایشگاه...
                </div>
            ) : visibleShifts.length === 0 ? (
                <div className="rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                    این آزمایشگاه در حال حاضر شیفت فعالی برای نمونه‌گیری در محل ندارد. لطفاً آزمایشگاه دیگری انتخاب کنید.
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {visibleShifts.map((shift) => {
                        const isSelected = value === shift.id;
                        const Icon = shift.icon;
                        const info = shifts?.[shift.id];
                        return (
                            <button
                                key={shift.id}
                                type="button"
                                onClick={() => onChange(shift.id)}
                                className={`flex flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 py-3 transition-all ${
                                    isSelected
                                        ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm"
                                        : "border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:bg-slate-50"
                                }`}
                            >
                                <Icon className={`mb-0.5 h-5 w-5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                                <span className="text-[11px] font-bold">{shift.label}</span>
                                {info?.start && info?.end && (
                                    <span className={`text-[10px] ${isSelected ? "text-blue-600/80" : "text-slate-400"}`} dir="ltr">
                                        {info.start} - {info.end}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
