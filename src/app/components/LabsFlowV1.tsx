import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { AppBar } from "../components/AppBar";
import { AddressSelector } from "../components/AddressSelector";
import { X, AlertTriangle, ReceiptText, ArrowLeft } from "lucide-react"; // اضافه شدن آیکون‌های پاپ‌آپ


// Components
import { LabsSuccess } from "../components/labs/LabsSuccess";
import { LabsHeader } from "../components/labs/LabsHeader";
import { LabsStepOne } from "../components/labs/LabsStepOne";
import { LabsStepTwo } from "../components/labs/LabsStepTwo";
import { LabsBottomBar } from "../components/labs/LabsBottomBar";
import { LabDetailsModal } from "../components/labs/LabDetailsModal";

// Types and Utils
import { TestPack, LabCenter, LabDetails, RequestType, LABS_DRAFT_KEY, loadLabsDraft, clearLabsDraft, getLabDetails, getServicePrice } from "../components/labs/labs.types";
import { LabsStepVisitType } from "./labs/LabsStepVisitType";
import {Button} from "./ui/button";

const API_BASE_URL = "https://api.mediraai.com";

export function LabsFlowV1() {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [initialDraft] = useState(loadLabsDraft);
    const [step, setStep] = useState(initialDraft?.step ?? 1);
    const [submitted, setSubmitted] = useState(false);
    const [visitType, setVisitType] = useState<number>(initialDraft?.visitType ?? 0); // 0 = در منزل, 1 = حضوری

    // Step 1 State
    const [digitalCode, setDigitalCode] = useState(initialDraft?.digitalCode ?? "");
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
    const [openSection, setOpenSection] = useState<"code" | "upload" | null>(initialDraft?.openSection ?? null);
    const [testPacks, setTestPacks] = useState<TestPack[]>([]);
    const [selectedTests, setSelectedTests] = useState<number[]>(initialDraft?.selectedTests ?? []);

    // Step 2 State
    const [labs, setLabs] = useState<LabCenter[]>([]);
    const [selectedLab, setSelectedLab] = useState<number | null>(initialDraft?.selectedLab ?? null);
    const [labDetails, setLabDetails] = useState<LabDetails | null>(null);
    const [shiftType, setShiftType] = useState<number>(initialDraft?.shiftType ?? 1);

    // Modal State
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // General State
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(initialDraft?.selectedAddressId ?? null);
    const [loadingTests, setLoadingTests] = useState(true);
    const [loadingLabs, setLoadingLabs] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("درخواست شما با موفقیت ثبت شد.");

    // --- استیت‌های جدید برای پاپ‌آپ خطای تعیین تکلیف ---
    const [hasPendingRequestModal, setHasPendingRequestModal] = useState(false);
    const [pendingModalMessage, setPendingModalMessage] = useState("");

    const getSelectedMode = (): RequestType | null => {
        const activeModes = [selectedTests.length > 0, digitalCode.trim().length > 0, !!prescriptionFile].filter(Boolean).length;
        if (activeModes !== 1) return null;
        if (selectedTests.length > 0) return 1;
        if (digitalCode.trim().length > 0) return 2;
        if (prescriptionFile) return 3;
        return null;
    };

    const isMixedSelection = useMemo(() => {
        return [selectedTests.length > 0, digitalCode.trim().length > 0, !!prescriptionFile].filter(Boolean).length > 1;
    }, [selectedTests, digitalCode, prescriptionFile]);

    useEffect(() => {
        const fetchTestPacks = async () => {
            try {
                setLoadingTests(true);
                const res = await fetch(`${API_BASE_URL}/api/user/labs/test-packs`, { headers: { Authorization: `Bearer ${accessToken}` } });
                const json = await res.json();
                if (json.success) setTestPacks(json.data || []);
                else setApiError(json.message);
            } catch {
                setApiError("خطا در ارتباط با سرور");
            } finally {
                setLoadingTests(false);
            }
        };
        if (accessToken) fetchTestPacks();
    }, [accessToken]);

    const fetchLabs = async (testPackIds: number[] = selectedTests, options?: { preserveSelection?: boolean }) => {
        try {
            setLoadingLabs(true);
            setApiError(null);
            if (!options?.preserveSelection) setSelectedLab(null);

            const res = await fetch(`${API_BASE_URL}/api/user/labs/search-centers`, {
                method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ test_pack_ids: testPackIds,visit_type: visitType }),
            });
            const json = await res.json();
            if (json.success) {
                setLabs(json.data || []);
                if (options?.preserveSelection) setSelectedLab(c => c != null && (json.data || []).some((l: LabCenter) => l.id === c) ? c : null);
                return true;
            }
            setApiError(json.message);
            return false;
        } catch {
            setApiError("خطا در ارتباط با سرور");
            return false;
        } finally {
            setLoadingLabs(false);
        }
    };

    const restoredLabsSearch = useRef(false);
    useEffect(() => {
        if (restoredLabsSearch.current || !accessToken || !initialDraft) return;
        if (initialDraft.step !== 2 || initialDraft.selectedTests.length === 0) return;
        restoredLabsSearch.current = true;
        void fetchLabs(initialDraft.selectedTests, { preserveSelection: true });
    }, [accessToken]);

    useEffect(() => {
        if (submitted) return;
        sessionStorage.setItem(LABS_DRAFT_KEY, JSON.stringify({ step, digitalCode, openSection, selectedTests, selectedLab, selectedAddressId, shiftType, visitType }));
    }, [submitted, step, digitalCode, openSection, selectedTests, selectedLab, selectedAddressId, shiftType, visitType]);

    const submitLabRequest = async () => {
        const requestType = getSelectedMode();
        if (!selectedAddressId) { setApiError("لطفاً آدرس نمونه‌گیری را انتخاب کنید."); return false; }
        if (!requestType) { setApiError("لطفاً یک روش ثبت درخواست را انتخاب کنید."); return false; }

        try {
            setSubmitting(true);
            setApiError(null);
            let res: Response;

            if (requestType === 1) {
                if (!selectedLab) { setApiError("آزمایشگاه انتخاب نشده است."); return false; }
                if (!shiftType) { setApiError("لطفاً شیفت زمانی مراجعه را انتخاب کنید."); return false; }

                res = await fetch(`${API_BASE_URL}/api/user/labs/requests`, {
                    method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        request_type_id: 1,
                        visit_type: visitType,
                        lab_id: selectedLab,
                        test_pack_ids: selectedTests,
                        user_address_id: selectedAddressId,
                        shift_type: shiftType
                    }),
                });
                setSuccessMessage("درخواست شما ثبت شد.");
            } else if (requestType === 2) {
                res = await fetch(`${API_BASE_URL}/api/user/labs/requests`, {
                    method: "POST", headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ request_type_id: 2, visit_type: visitType, digital_code: digitalCode.trim(), user_address_id: selectedAddressId }),
                });
                setSuccessMessage("نسخه دیجیتال ثبت شد.");
            } else {
                const formData = new FormData();
                formData.append("request_type_id", "3");
                formData.append("visit_type", String(visitType));
                formData.append("user_address_id", String(selectedAddressId));
                if (prescriptionFile) formData.append("files[]", prescriptionFile);
                res = await fetch(`${API_BASE_URL}/api/user/labs/requests`, { method: "POST", headers: { Authorization: `GAPGPTMASKTOKEN26xfvxx24s7X4X` }, body: formData });
                setSuccessMessage("فایل نسخه ثبت شد.");
            }

            const json = await res.json();

            if (!res.ok || !json.success) {
                // بررسی خطای 400 برای درخواست تعیین تکلیف نشده
                if (res.status === 400 && json.message?.includes("در انتظار پرداخت")) {
                    setPendingModalMessage(json.message);
                    setHasPendingRequestModal(true);
                    return false;
                }

                // سایر خطاها
                setApiError(json?.errors ? Object.values(json.errors).flat().join(" - ") : json?.message || "خطا در ثبت درخواست");
                return false;
            }

            clearLabsDraft();
            if (json.data?.payment_url) { window.location.href = json.data.payment_url; return true; }
            setSubmitted(true);
            return true;
        } catch {
            setApiError("خطا در ارتباط با سرور");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handleNextStep = async () => {
        if (!selectedAddressId) { setApiError("لطفاً آدرس نمونه‌گیری را انتخاب کنید."); return; }
        if (isMixedSelection) { setApiError("فقط یکی از حالت‌های انتخاب را استفاده کنید."); return; }
        const requestType = getSelectedMode();
        if (!requestType) { setApiError("حداقل یک آزمایش یا فایل انتخاب کنید."); return; }

        if (step === 1) {
            setStep(2);
            return;
        }

        if (step === 2) {
            if (requestType === 1) {
                const ok = await fetchLabs(selectedTests, { preserveSelection: false });
                if (ok) setStep(3);
                return;
            }
            await submitLabRequest();
        }
    };

    if (submitted) return <LabsSuccess successMessage={successMessage} onBack={() => navigate("/services")} />;

    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
            <AppBar backTo="/services" />
            <div className="relative z-10 px-5 pb-4 pt-24 text-right sm:px-6">

                <AddressSelector selectedAddressId={selectedAddressId} onSelect={setSelectedAddressId} />

                <LabsHeader step={step} />

                {apiError && (
                    <div className="mb-4 flex items-center justify-between rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                        <span>{apiError}</span><button onClick={() => setApiError(null)}><X className="h-4 w-4 text-red-400" /></button>
                    </div>
                )}
                {isMixedSelection && (
                    <div className="mb-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">فقط یکی از روش‌های ثبت درخواست را انتخاب کنید.</div>
                )}

                <div className="flex flex-1 flex-col pb-4">
                    {step === 1 && (
                        <LabsStepOne
                            openSection={openSection} toggleSection={(s) => setOpenSection(p => p === s ? null : s)}
                            digitalCode={digitalCode} setDigitalCode={setDigitalCode}
                            prescriptionFile={prescriptionFile} setPrescriptionFile={setPrescriptionFile}
                            testPacks={testPacks} selectedTests={selectedTests} toggleTest={(id) => setSelectedTests(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id])}
                            loadingTests={loadingTests}
                        />
                    )}
                    {step === 2 && (
                        <LabsStepVisitType visitType={visitType} setVisitType={setVisitType} />
                    )}
                    {step === 3 && (
                        <LabsStepTwo
                            labs={labs} loadingLabs={loadingLabs}
                            selectedLab={selectedLab} setSelectedLab={setSelectedLab}
                            openLabDetails={(lab) => { setReviewRating(0); setReviewText(""); setReviewSubmitted(false); setLabDetails(getLabDetails(lab)); }}
                            selectedTests={selectedTests}
                            shiftType={shiftType}
                            setShiftType={setShiftType}
                            accessToken={accessToken}
                        />
                    )}
                </div>

                <LabsBottomBar
                    step={step} setStep={setStep} submitting={submitting}
                    disabledNext={loadingTests || submitting || !selectedAddressId || (!selectedTests.length && digitalCode.trim().length === 0 && !prescriptionFile)}
                    disabledSubmit={selectedLab === null || loadingLabs || submitting || !selectedAddressId}
                    handleNextStep={handleNextStep} submitLabRequest={submitLabRequest} requestType={getSelectedMode()}
                />
            </div>

            <LabDetailsModal
                labDetails={labDetails} setLabDetails={setLabDetails}
                selectedLabServices={testPacks.filter(t => selectedTests.includes(t.id)).map(t => ({ id: t.id, name: t.name, price: getServicePrice(t) }))}
                reviewRating={reviewRating} setReviewRating={setReviewRating}
                reviewText={reviewText} setReviewText={setReviewText}
                reviewSubmitted={reviewSubmitted} submitReview={() => setReviewSubmitted(true)}
            />

            {/* پاپ‌آپ سفارش تعیین‌تکلیف‌نشده (منتقل شده به کامپوننت اصلی) */}
            {hasPendingRequestModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                            <AlertTriangle className="h-7 w-7" />
                        </div>

                        <h3 className="text-base font-extrabold text-slate-800">
                            درخواست آزمایش تعیین‌تکلیف نشده
                        </h3>

                        <p className="mt-2 text-xs leading-6 text-slate-600">
                            {pendingModalMessage || "شما در حال حاضر یک درخواست ثبت‌شده در انتظار پرداخت دارید. لطفاً ابتدا به بخش سفارشات مراجعه کرده و وضعیت آن را مشخص فرمایید."}
                        </p>

                        <div className="mt-6 flex flex-col gap-2">
                            <Button
                                type="button"
                                onClick={() => {
                                    setHasPendingRequestModal(false);
                                    navigate("/orders"); // استفاده از navigate روتر
                                }}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
                            >
                                <ReceiptText className="h-4 w-4" />
                                رفتن به صفحه سفارشات
                                <ArrowLeft className="h-4 w-4" />
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setHasPendingRequestModal(false)}
                                className="h-10 w-full rounded-2xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                            >
                                بستن
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
