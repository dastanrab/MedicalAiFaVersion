import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    MapPin, Phone, Star, ShoppingBag, Plus, Minus,
    CheckCircle, ShieldCheck, AlertCircle,
    Building2, Sparkles, CreditCard, ChevronRight, Loader2
} from 'lucide-react';

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';
import { useAuthStore } from '../store/authStore';
import { Pharmacy, DrugItem, CartItem } from '../types/types';

export function PharmacyDrugDetails() {
    const { pharmacyId, drugName } = useParams<{ pharmacyId: string; drugName: string }>();
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
    const [mainDrug, setMainDrug] = useState<DrugItem | null>(null);
    const [similarDrugs, setSimilarDrugs] = useState<DrugItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await new Promise((r) => setTimeout(r, 600));

            const decodedDrugName = decodeURIComponent(drugName || 'استامینوفن');

            setPharmacy({
                id: pharmacyId || '1',
                name: 'داروخانه شبانه‌روزی دکتر حسینی',
                address: 'تهران، خیابان ولیعصر، نرسیده به توانیر، پلاک ۲۴',
                phone: '۰۲۱-۸۸۷۶۵۴۳۲',
                city: 'تهران',
                rating: 4.8,
                reviews_count: 142,
                is_open: true,
                image_url: 'https://placehold.co/128x128/e0e7ff/1d4ed8?text=Pharmacy'
            });

            const initialDrug: DrugItem = {
                id: 'drug-main-1',
                name: decodedDrugName,
                generic_name: 'Acetaminophen 500mg',
                brand: 'داروسازی دکتر عبیدی',
                dosage: 'بسته ۳۰ عددی قرص',
                price: 45000,
                in_stock: true,
            };

            setMainDrug(initialDrug);
            setCart([{ ...initialDrug, quantity: 1 }]);

            setSimilarDrugs([
                {
                    id: 'sim-1',
                    name: 'ژلوفن ۴۰۰',
                    generic_name: 'Ibuprofen Softgel',
                    brand: 'داروسازی دانا',
                    dosage: 'ورق ۱۰ عددی',
                    price: 52000,
                    in_stock: true,
                },
                {
                    id: 'sim-2',
                    name: 'نوافن',
                    generic_name: 'Acetaminophen + Cafein + Ibuprofen',
                    brand: 'الحاوی',
                    dosage: 'بسته ۲۰ عددی',
                    price: 68000,
                    in_stock: true,
                },
                {
                    id: 'sim-3',
                    name: 'شیاف استامینوفن ۱۲۵',
                    generic_name: 'Acetaminophen Suppository',
                    brand: 'تهران شیمی',
                    dosage: 'بسته ۱۰ عددی',
                    price: 38000,
                    in_stock: true,
                },
            ]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات داروخانه');
        } finally {
            setLoading(false);
        }
    }, [pharmacyId, drugName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddToCart = (drug: DrugItem) => {
        setCart((prev) => {
            const exists = prev.find((item) => item.id === drug.id);
            if (exists) {
                return prev.map((item) =>
                    item.id === drug.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...drug, quantity: 1 }];
        });
    };

    const handleRemoveFromCart = (drugId: string | number) => {
        setCart((prev) =>
            prev
                .map((item) => (item.id === drugId ? { ...item, quantity: item.quantity - 1 } : item))
                .filter((item) => item.quantity > 0)
        );
    };

    const cartTotalAmount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [cart]);

    const cartTotalCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    const handleProceedToPayment = async () => {
        if (!accessToken) {
            alert('لطفاً ابتدا وارد حساب کاربری خود شوید');
            return;
        }

        if (cart.length === 0) {
            alert('سبد خرید شما خالی است');
            return;
        }

        setIsPaying(true);
        try {
            const response = await fetch('https://api.mediraai.com/api/user/pharmacy/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    pharmacy_id: pharmacyId,
                    items: cart.map((item) => ({ drug_id: item.id, quantity: item.quantity })),
                    total_price: cartTotalAmount,
                }),
            });

            const resData = await response.json();
            if (!response.ok || !resData.success) {
                throw new Error(resData.message || 'خطا در ایجاد فاکتور');
            }

            if (resData.data?.payment_url) {
                window.location.href = resData.data.payment_url;
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'خطای ارتباط با درگاه پرداخت');
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-full flex items-center justify-center bg-[#f8f9fa]">
                <PageLoader showAppBar={true} backTo="/pharmacies" />
            </div>
        );
    }

    if (error || !pharmacy || !mainDrug) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4 font-[YekanBakhFaNum] " dir="rtl">
                <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                <p className="text-gray-800 font-bold mb-3 text-sm">{error ?? 'دارو یا داروخانه مورد نظر یافت نشد'}</p>
                <Button onClick={() => navigate(-1)} className="bg-blue-600 text-white rounded-xl text-xs h-9">
                    بازگشت به صفحه قبل
                </Button>
            </div>
        );
    }

    const mainDrugInCart = cart.find((i) => i.id === mainDrug.id);

    return (
        <div className="min-h-screen bg-[#f8f9fa] text-gray-800 pb-10 font-[YekanBakhFaNum] mb-20 mt-5" dir="rtl">
            <AppBar backTo="/pharmacies" />

            <main className="pt-16 px-3.5 max-w-lg mx-auto space-y-3">
                {/* ── ۱. اطلاعات داروخانه (فشرده و کم‌ارتفاع) ── */}
                <Card className="bg-white p-3 shadow-xs border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                                <h1 className="text-sm font-black text-gray-900 truncate">
                                    {pharmacy.name}
                                </h1>
                                {pharmacy.is_open && (
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200 flex-shrink-0">
                                        باز
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5 truncate">
                                <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{pharmacy.address}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-x-reverse border border-gray-100 rounded-lg py-1.5 px-1 bg-gray-50/70 mt-2 text-center text-[10px]">
                        <div className="flex items-center justify-center gap-1 font-bold text-amber-500">
                            <span>{new Intl.NumberFormat('fa-IR').format(pharmacy.rating || 5)}</span>
                            <Star className="w-3 h-3 fill-amber-400" />
                        </div>
                        <div className="flex items-center justify-center gap-1 font-bold text-emerald-600">
                            <ShieldCheck className="w-3 h-3" />
                            <span>مجوز رسمی</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 font-bold text-blue-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>اصالت دارو</span>
                        </div>
                    </div>
                </Card>

                {/* ── ۲. داروی انتخابی ── */}
                <Card className="bg-white p-3 shadow-xs border border-blue-100 rounded-xl relative">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                                    انتخابی
                                </span>
                                <h2 className="text-sm font-black text-gray-900 truncate">{mainDrug.name}</h2>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate" dir="ltr">{mainDrug.generic_name}</p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-500">
                                <span className="bg-gray-100 px-1.5 py-0.2 rounded">{mainDrug.brand}</span>
                                <span className="bg-gray-100 px-1.5 py-0.2 rounded">{mainDrug.dosage}</span>
                            </div>
                        </div>

                        <div className="text-left flex-shrink-0 flex flex-col items-end justify-between self-stretch">
                            <div>
                                <span className="text-[9px] text-gray-400 block text-right">قیمت:</span>
                                <span className="text-xs font-black text-blue-700">
                                    {new Intl.NumberFormat('fa-IR').format(mainDrug.price)}{' '}
                                    <span className="text-[9px] font-normal text-gray-500">تومان</span>
                                </span>
                            </div>

                            {/* کنترلر تعداد */}
                            {mainDrugInCart ? (
                                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg p-0.5 mt-1">
                                    <button
                                        onClick={() => handleAddToCart(mainDrug)}
                                        className="w-6 h-6 bg-white rounded flex items-center justify-center text-blue-600 shadow-2xs active:scale-95"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold text-blue-900 min-w-[16px] text-center">
                                        {new Intl.NumberFormat('fa-IR').format(mainDrugInCart.quantity)}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveFromCart(mainDrug.id)}
                                        className="w-6 h-6 bg-white rounded flex items-center justify-center text-red-500 shadow-2xs active:scale-95"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => handleAddToCart(mainDrug)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold h-7 px-2.5 mt-1"
                                >
                                    <Plus className="w-3 h-3 ml-1" />
                                    افزودن
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* ── ۳. فاکتور و دکمه پرداخت (ترکیب‌شده درون همین کارت) ── */}
                <Card className="bg-white p-3.5 shadow-xs border border-gray-100 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                            <h3 className="font-bold text-xs text-gray-900">صورت‌حساب سفارش</h3>
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md">
                            {new Intl.NumberFormat('fa-IR').format(cartTotalCount)} قلم
                        </span>
                    </div>

                    {/* لیست آیتم‌های سبد به صورت خطی و فشرده */}
                    {cart.length > 0 ? (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5 text-xs">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between py-0.5">
                                    <span className="text-gray-700 truncate max-w-[190px]">
                                        {item.name} <span className="text-[10px] text-gray-400">({new Intl.NumberFormat('fa-IR').format(item.quantity)}×)</span>
                                    </span>
                                    <span className="font-bold text-gray-800 text-[11px]">
                                        {new Intl.NumberFormat('fa-IR').format(item.price * item.quantity)} تومان
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-2 text-xs text-gray-400">سبد خرید شما خالی است</p>
                    )}

                    <div className="border-t border-dashed border-gray-200 pt-2 space-y-1 text-xs">
                        <div className="flex justify-between items-center text-gray-500 text-[11px]">
                            <span>هزینه بسته‌بندی و ارسال:</span>
                            <span className="text-emerald-600 font-bold">رایگان</span>
                        </div>
                        <div className="flex justify-between items-center font-black text-gray-900 pt-1">
                            <span>مبلغ نهایی:</span>
                            <span className="text-blue-700 text-sm">
                                {new Intl.NumberFormat('fa-IR').format(cartTotalAmount)}{' '}
                                <span className="text-[10px] font-normal text-gray-500">تومان</span>
                            </span>
                        </div>
                    </div>

                    {/* دکمه پرداخت - مستقیم در انتهای کارت بدون Sticky بودن */}
                    <Button
                        onClick={handleProceedToPayment}
                        disabled={isPaying || cart.length === 0}
                        className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 mt-2"
                    >
                        {isPaying ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>در حال انتقال به درگاه...</span>
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                <span>تکمیل سفارش و پرداخت آنلاین</span>
                                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                            </>
                        )}
                    </Button>
                </Card>

                {/* ── ۴. داروهای مشابه و جایگزین (زیر پرداخت) ── */}
                <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between px-0.5">
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <h3 className="font-bold text-xs text-gray-900">سایر داروهای پیشنهادی</h3>
                        </div>
                        <span className="text-[10px] text-gray-400">موجود در همین داروخانه</span>
                    </div>

                    {/* اسکرول افقی جمع‌وجور */}
                    <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {similarDrugs.map((drug) => {
                            const itemInCart = cart.find((i) => i.id === drug.id);
                            return (
                                <Card
                                    key={drug.id}
                                    className="bg-white p-2.5 shadow-2xs border border-gray-100 rounded-xl flex flex-col justify-between min-w-[145px] max-w-[155px] flex-shrink-0"
                                >
                                    <div>
                                        <h4 className="font-bold text-xs text-gray-900 truncate">{drug.name}</h4>
                                        <p className="text-[9px] text-gray-400 truncate" dir="ltr">{drug.generic_name}</p>
                                        <span className="text-[9px] text-gray-500 block mt-1 truncate">{drug.brand}</span>
                                        <div className="mt-1 font-black text-xs text-blue-700">
                                            {new Intl.NumberFormat('fa-IR').format(drug.price)}{' '}
                                            <span className="text-[8px] font-normal text-gray-500">تومان</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-1.5 border-t border-gray-50">
                                        {itemInCart ? (
                                            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md p-0.5">
                                                <button
                                                    onClick={() => handleAddToCart(drug)}
                                                    className="w-5 h-5 bg-white rounded flex items-center justify-center text-blue-600 shadow-2xs"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                                <span className="text-[11px] font-bold text-blue-900">
                                                    {new Intl.NumberFormat('fa-IR').format(itemInCart.quantity)}
                                                </span>
                                                <button
                                                    onClick={() => handleRemoveFromCart(drug.id)}
                                                    className="w-5 h-5 bg-white rounded flex items-center justify-center text-red-500 shadow-2xs"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleAddToCart(drug)}
                                                variant="outline"
                                                className="w-full h-7 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-[10px] font-bold p-0"
                                            >
                                                <Plus className="w-3 h-3 ml-1" />
                                                افزودن
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
