import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MapPin, ChevronDown, Check, ArrowLeft, Loader2, X } from "lucide-react";

// Neshan Map Imports
import Map from "@neshan-maps-platform/ol/Map";
import View from "@neshan-maps-platform/ol/View";
import { fromLonLat, toLonLat } from "@neshan-maps-platform/ol/proj";

const API_BASE_URL = "https://api.mediraai.com";

export type UserAddress = {
    id: number;
    title: string;
    address: string;
    lat: number | null;
    lng: number | null;
    created_at: string;
};

interface AddressSelectorProps {
    selectedAddressId: number | null;
    onSelect: (id: number | null) => void;
}

type ViewState = 'dropdown' | 'map' | 'form';

export function AddressSelector({ selectedAddressId, onSelect }: AddressSelectorProps) {
    const { accessToken } = useAuthStore();
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [addressesOpen, setAddressesOpen] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // View State Management
    const [viewState, setViewState] = useState<ViewState>('dropdown');

    // Map & Form States
    const [mapLat, setMapLat] = useState<number>(35.699739);
    const [mapLng, setMapLng] = useState<number>(51.338097);
    const [newAddressTitle, setNewAddressTitle] = useState("");
    const [newAddressDetails, setNewAddressDetails] = useState("");
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const mapRef = useRef<HTMLDivElement>(null);
    const addressDropdownRef = useRef<HTMLDivElement>(null);

    const selectedAddress = addresses.find((item) => item.id === selectedAddressId) ?? null;

    // بستن منوی بازشو در صورت کلیک بیرون از آن
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                addressDropdownRef.current &&
                !addressDropdownRef.current.contains(event.target as Node)
            ) {
                setAddressesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // دریافت لیست آدرس‌ها
    const fetchAddressesList = async () => {
        try {
            setLoadingAddresses(true);
            const res = await fetch(`${API_BASE_URL}/api/user/addresses`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                setAddresses([]);
                onSelect(null);
                return;
            }
            const list: UserAddress[] = Array.isArray(json?.data?.addresses)
                ? json.data.addresses
                : [];
            setAddresses(list);

            if (list.length > 0 && !selectedAddressId) {
                onSelect(list[0]?.id ?? null);
            }
        } catch {
            setAddresses([]);
            onSelect(null);
        } finally {
            setLoadingAddresses(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchAddressesList();
        }
    }, [accessToken]);

    // راه‌اندازی نقشه
    const isMapVisible = viewState !== 'dropdown';
    useEffect(() => {
        let map: Map | null = null;

        if (isMapVisible && mapRef.current) {
            map = new Map({
                mapType: "neshan",
                target: mapRef.current,
                key: "web.7f11b5c6971d4917a6e9272a522d8b9e",
                poi: true,
                traffic: false,
                view: new View({
                    center: fromLonLat([mapLng, mapLat]),
                    zoom: 14,
                }),
            });

            map.on('moveend', () => {
                const center = map?.getView().getCenter();
                if (center) {
                    const lonLat = toLonLat(center);
                    setMapLng(lonLat[0]);
                    setMapLat(lonLat[1]);
                }
            });
        }

        return () => {
            if (map) {
                map.setTarget(undefined);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMapVisible]);

    // ذخیره آدرس جدید
    const handleSaveAddress = async () => {
        if (!newAddressDetails.trim()) {
            setApiError("لطفاً نشانی کامل را وارد کنید.");
            return;
        }

        try {
            setIsSavingAddress(true);
            setApiError(null);

            const res = await fetch(`${API_BASE_URL}/api/user/addresses`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: newAddressTitle.trim() || "آدرس جدید",
                    address: newAddressDetails.trim(),
                    lat: mapLat,
                    lng: mapLng,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                const err = json?.errors ? Object.values(json.errors).flat().join(" - ") : json?.message;
                setApiError(err || "خطا در ثبت آدرس");
                return;
            }

            await fetchAddressesList();
            if (json?.data?.address?.id) {
                onSelect(json.data.address.id);
            }

            setViewState('dropdown');
            setNewAddressTitle("");
            setNewAddressDetails("");
        } catch (error) {
            setApiError("خطا در ارتباط با سرور برای ثبت آدرس");
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleBackClick = () => {
        if (viewState === 'form') {
            setViewState('map');
        } else {
            setViewState('dropdown');
        }
    };

    // 1️⃣ نمای نقشه و فرم
    if (isMapVisible) {
        return (
            <div className="fixed inset-y-0 left-1/2 z-[100] flex h-[100dvh] w-full max-w-[550px] -translate-x-1/2 flex-col bg-slate-50 text-right font-[YekanBakhFaNum] shadow-2xl sm:border-x sm:border-slate-200" dir="rtl">

                {/* هدر */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-4 shadow-sm z-50">
                    <button
                        onClick={handleBackClick}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-base font-bold text-slate-800">
                        {viewState === 'map' ? 'انتخاب موقعیت روی نقشه' : 'تکمیل اطلاعات آدرس'}
                    </h1>
                    <div className="h-10 w-10" />
                </div>

                {/* کانتینر نقشه */}
                <div className="relative w-full flex-1 overflow-hidden">
                    <div ref={mapRef} className="absolute inset-0 h-full w-full" />

                    {/* نشانگر مرکز نقشه */}
                    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                        <div className="relative -top-8 transition-transform duration-200">
                            <MapPin className="h-10 w-10 text-red-500 drop-shadow-md" fill="currentColor" />
                            <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black/20 blur-[2px]"></div>
                        </div>
                    </div>

                    {/* فرم که در مرحله دوم روی نقشه ظاهر می‌شود */}
                    {viewState === 'form' && (
                        <div className="absolute inset-0 z-20 flex flex-col justify-end animate-in fade-in duration-300">
                            {/* Backdrop */}
                            <div
                                className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
                                onClick={() => setViewState('map')}
                            />

                            {/* باکس فرم */}
                            <div className="relative rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                                <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200" />

                                <div className="mb-4 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">عنوان آدرس</label>
                                    <Input
                                        value={newAddressTitle}
                                        onChange={(e) => setNewAddressTitle(e.target.value)}
                                        placeholder="مثلاً منزل، محل کار"
                                        className="h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-6 space-y-2">
                                    <label className="text-sm font-bold text-slate-700">نشانی کامل <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={newAddressDetails}
                                        onChange={(e) => setNewAddressDetails(e.target.value)}
                                        rows={3}
                                        placeholder="استان، شهر، خیابان، کوچه، پلاک..."
                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>

                                {apiError && (
                                    <div className="mb-4 flex items-center justify-between rounded-2xl bg-red-50 p-3 text-sm text-red-600">
                                        <span>{apiError}</span>
                                        <button onClick={() => setApiError(null)}>
                                            <X className="h-4 w-4 text-red-400" />
                                        </button>
                                    </div>
                                )}

                                <Button
                                    onClick={handleSaveAddress}
                                    disabled={isSavingAddress || !newAddressDetails.trim()}
                                    className="h-14 w-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-50"
                                >
                                    {isSavingAddress ? (
                                        <>
                                            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                            در حال ثبت...
                                        </>
                                    ) : (
                                        "ثبت نهایی آدرس"
                                    )}
                                </Button>

                                {/* فاصله ایمن (Spacer) برای جلوگیری از تداخل با Navbar */}
                                <div className="h-24 w-full shrink-0" />
                            </div>
                        </div>
                    )}
                </div>

                {/* فوتر (فقط در حالت انتخاب روی نقشه) */}
                {viewState === 'map' && (
                    <div className="flex shrink-0 flex-col border-t border-slate-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
                        <div className="flex items-center gap-3 p-4">
                            <Button
                                variant="outline"
                                onClick={() => setViewState('dropdown')}
                                className="h-14 flex-1 rounded-full border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 hover:bg-slate-100"
                            >
                                لغو
                            </Button>
                            <Button
                                onClick={() => setViewState('form')}
                                className="h-14 flex-[2] rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/20"
                            >
                                تأیید موقعیت
                            </Button>
                        </div>
                        {/* فاصله ایمن (Spacer) برای جلوگیری از تداخل با Navbar */}
                        <div className="h-24 w-full shrink-0" />
                    </div>
                )}
            </div>
        );
    }

    // 2️⃣ نمای پیش‌فرض (منوی بازشو انتخاب آدرس در صفحه درخواست)
    return (
        <div className="mb-2 flex justify-center">
            <div ref={addressDropdownRef} className="relative w-full max-w-md">
                {loadingAddresses ? (
                    <div className="text-center text-sm text-slate-500">
                        در حال دریافت آدرس‌ها...
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="text-center">
                        <p className="text-sm font-bold text-amber-700">آدرسی ثبت نشده است</p>
                        <button
                            type="button"
                            onClick={() => setViewState('map')}
                            className="mt-2 text-sm font-bold text-blue-600"
                        >
                            اضافه کردن آدرس
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => setAddressesOpen((prev) => !prev)}
                            className="mx-auto flex min-h-10 items-center justify-center gap-1.5 text-center"
                        >
                            <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
                            <span className="max-w-[220px] truncate text-sm font-bold text-slate-800">
                                {selectedAddress ? (selectedAddress.title || "آدرس") : "انتخاب آدرس"}
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
                                    addressesOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        <p className="mt-1 text-center text-xs text-slate-500">
                            {selectedAddress ? (selectedAddress.address || "-") : "آدرسی انتخاب نشده است"}
                        </p>

                        {addressesOpen && (
                            <div className="absolute left-0 right-0 top-full z-30 mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60">
                                <div className="flex flex-col gap-2">
                                    {addresses.map((item) => {
                                        const isSelected = item.id === selectedAddressId;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    onSelect(item.id);
                                                    setAddressesOpen(false);
                                                }}
                                                className={`rounded-2xl px-3 py-3 text-center transition-all ${
                                                    isSelected
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "bg-white text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                                    <span className="text-sm font-bold">
                                                        {item.title || "آدرس"}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs leading-6 text-slate-500">
                                                    {item.address || "-"}
                                                </p>
                                            </button>
                                        );
                                    })}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddressesOpen(false);
                                            setViewState('map');
                                        }}
                                        className="mt-1 text-sm font-bold text-blue-600"
                                    >
                                        اضافه کردن آدرس
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}