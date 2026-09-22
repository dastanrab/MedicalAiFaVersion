import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuthStore } from "../store/authStore";
import { clearPendingAddressId, peekPendingAddressId } from "../lib/pendingAddress";
import { MapPin, ChevronDown, Check } from "lucide-react";

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

export function AddressSelector({ selectedAddressId, onSelect }: AddressSelectorProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { accessToken } = useAuthStore();
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [addressesOpen, setAddressesOpen] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    const addressDropdownRef = useRef<HTMLDivElement>(null);
    const onSelectRef = useRef(onSelect);
    const selectedAddressIdRef = useRef(selectedAddressId);
    onSelectRef.current = onSelect;
    selectedAddressIdRef.current = selectedAddressId;

    const selectedAddress = addresses.find((item) => item.id === selectedAddressId) ?? null;

    const openAddressPage = () => {
        const from = `${location.pathname}${location.search}`;
        setAddressesOpen(false);
        navigate("/addresses", { state: { from, openForm: true } });
    };

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

    useEffect(() => {
        if (!accessToken) return;

        let cancelled = false;

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
                if (cancelled) return;

                if (!res.ok || !json.success) {
                    setAddresses([]);
                    onSelectRef.current(null);
                    return;
                }

                const list: UserAddress[] = Array.isArray(json?.data?.addresses)
                    ? json.data.addresses
                    : [];
                setAddresses(list);

                const pendingId = peekPendingAddressId();
                const pendingMatch = pendingId != null
                    ? list.find((item) => item.id === pendingId)
                    : undefined;

                if (pendingMatch) {
                    onSelectRef.current(pendingMatch.id);
                    clearPendingAddressId();
                    return;
                }

                if (list.length === 0) {
                    onSelectRef.current(null);
                    return;
                }

                const stillSelected = list.some((item) => item.id === selectedAddressIdRef.current);
                if (!stillSelected) {
                    onSelectRef.current(list[0]?.id ?? null);
                }
            } catch {
                if (!cancelled) {
                    setAddresses([]);
                    onSelectRef.current(null);
                }
            } finally {
                if (!cancelled) setLoadingAddresses(false);
            }
        };

        void fetchAddressesList();

        return () => {
            cancelled = true;
        };
    }, [accessToken]);

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
                            onClick={openAddressPage}
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
                                        onClick={openAddressPage}
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
