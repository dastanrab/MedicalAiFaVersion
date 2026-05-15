
import React, { useState, useCallback, useEffect, useMemo } from 'react';

// ---------- انواع داده (Types) ----------
interface Ingredient {
    id: string;
    name: string;
    emoji: string;
    unit: string;
    pricePerUnit: number; // قیمت به تومان برای هر واحد
}

interface RecipeItem {
    ingredientId: string;
    quantity: number; // مقدار مصرفی در کیک (بر حسب واحد ماده)
}

interface SaleRecord {
    id: string;
    cakeName: string;
    totalCost: number;
    sellingPrice: number;
    profit: number;
    timestamp: Date;
}

// داده‌های اولیه مواد اولیه
const INITIAL_INGREDIENTS: Ingredient[] = [
    { id: "1", name: "آرد سفید", emoji: "🌾", unit: "کیلوگرم", pricePerUnit: 32000 },
    { id: "2", name: "شکر", emoji: "🍬", unit: "کیلوگرم", pricePerUnit: 26000 },
    { id: "3", name: "تخم‌مرغ", emoji: "🥚", unit: "عدد", pricePerUnit: 5500 },
    { id: "4", name: "کره", emoji: "🧈", unit: "کیلوگرم", pricePerUnit: 145000 },
    { id: "5", name: "وانیل", emoji: "🍦", unit: "قاشق چای‌خوری", pricePerUnit: 2100 },
    { id: "6", name: "شیر تازه", emoji: "🥛", unit: "لیتر", pricePerUnit: 18000 },
    { id: "7", name: "بیکینگ پودر", emoji: "🧁", unit: "قاشق غذاخوری", pricePerUnit: 3200 },
];

export default function CakeManager() {
    // ---------- state‌ها ----------
    const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
    const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
    const [cakeName, setCakeName] = useState<string>("کیک تولدی");
    const [sellingPriceInput, setSellingPriceInput] = useState<string>("");
    const [salesHistory, setSalesHistory] = useState<SaleRecord[]>([]);
    const [notification, setNotification] = useState<string | null>(null);

    // انتخاب ماده و مقدار برای افزودن به دستور
    const [selectedIngredientId, setSelectedIngredientId] = useState<string>(ingredients[0]?.id || "");
    const [newQuantity, setNewQuantity] = useState<number>(1);

    // ---------- توابع کمکی ----------
    const showTemporaryNotif = (msg: string, duration = 2500) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), duration);
    };

    // محاسبه قیمت تمام شده بر اساس مواد انتخابی و قیمت‌های به‌روز
    const totalCost = useMemo(() => {
        let total = 0;
        for (const item of recipeItems) {
            const ingredient = ingredients.find(ing => ing.id === item.ingredientId);
            if (ingredient) {
                total += item.quantity * ingredient.pricePerUnit;
            }
        }
        return Math.round(total * 100) / 100;
    }, [recipeItems, ingredients]);

    // پیشنهاد قیمت فروش (مثلاً 35% سود)
    const suggestedSellingPrice = useMemo(() => Math.round(totalCost * 1.35), [totalCost]);

    // مقداردهی اولیه قیمت فروش پیشنهادی
    useEffect(() => {
        if (!sellingPriceInput || sellingPriceInput === "") {
            setSellingPriceInput(suggestedSellingPrice.toString());
        }
    }, [suggestedSellingPrice, sellingPriceInput]);

    // هرگاه مواد اولیه تغییر کنند، موارد نامعتبر در دستور پخت حذف می‌شوند
    useEffect(() => {
        const validIds = new Set(ingredients.map(i => i.id));
        const filteredRecipe = recipeItems.filter(item => validIds.has(item.ingredientId));
        if (filteredRecipe.length !== recipeItems.length) {
            setRecipeItems(filteredRecipe);
            showTemporaryNotif("🔁 مواد نامعتبر از دستور کیک حذف شدند.", 2000);
        }
    }, [ingredients]);

    // ---------- مدیریت مواد اولیه (ویرایش، حذف، افزودن) ----------
    const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
        setIngredients(prev => prev.map(ing => {
            if (ing.id === id) {
                let newValue: any = value;
                if (field === 'pricePerUnit') newValue = parseFloat(value as string) || 0;
                if (field === 'name' || field === 'emoji' || field === 'unit') newValue = value;
                return { ...ing, [field]: newValue };
            }
            return ing;
        }));
    };

    const deleteIngredient = (id: string) => {
        setIngredients(prev => prev.filter(ing => ing.id !== id));
        showTemporaryNotif("🧾 ماده حذف شد.", 1200);
    };

    const addNewIngredient = () => {
        const newId = Date.now().toString();
        const newIng: Ingredient = {
            id: newId,
            name: "ماده جدید",
            emoji: "✨",
            unit: "واحد",
            pricePerUnit: 1000,
        };
        setIngredients(prev => [...prev, newIng]);
        showTemporaryNotif("➕ ماده جدید اضافه شد. می‌توانید ویرایش کنید.", 2000);
    };

    // ---------- مدیریت دستور پخت (Recipe) ----------
    const addIngredientToRecipe = () => {
        if (!selectedIngredientId) return;
        const ingredientExists = ingredients.some(ing => ing.id === selectedIngredientId);
        if (!ingredientExists) {
            showTemporaryNotif("❌ ماده انتخاب شده نامعتبر است", 1500);
            return;
        }
        if (newQuantity <= 0) {
            showTemporaryNotif("⚠️ مقدار باید بزرگتر از صفر باشد", 1500);
            return;
        }
        setRecipeItems(prev => [...prev, { ingredientId: selectedIngredientId, quantity: newQuantity }]);
        setNewQuantity(1);
        showTemporaryNotif(`➕ ماده به کیک اضافه شد`, 1200);
    };

    const updateRecipeQuantity = (index: number, newQty: number) => {
        if (newQty <= 0) {
            removeRecipeItem(index);
            return;
        }
        setRecipeItems(prev => prev.map((item, idx) => idx === index ? { ...item, quantity: newQty } : item));
    };

    const removeRecipeItem = (index: number) => {
        setRecipeItems(prev => prev.filter((_, idx) => idx !== index));
        showTemporaryNotif("🗑️ ماده از دستور حذف شد", 1000);
    };

    const clearRecipe = () => {
        if (recipeItems.length === 0) return;
        setRecipeItems([]);
        showTemporaryNotif("🧹 دستور کیک پاک شد", 1200);
    };

    // ---------- ثبت فروش ----------
    const handleSell = () => {
        if (recipeItems.length === 0) {
            showTemporaryNotif("❌ ابتدا حداقل یک ماده به کیک اضافه کنید!", 2000);
            return;
        }
        if (!cakeName.trim()) {
            showTemporaryNotif("📛 لطفا نام کیک را وارد کنید", 1500);
            return;
        }
        const sellPrice = parseFloat(sellingPriceInput);
        if (isNaN(sellPrice) || sellPrice < 0) {
            showTemporaryNotif("💰 قیمت فروش معتبر وارد کنید", 1500);
            return;
        }
        const profit = sellPrice - totalCost;
        const newSale: SaleRecord = {
            id: Date.now().toString(),
            cakeName: cakeName.trim(),
            totalCost: totalCost,
            sellingPrice: sellPrice,
            profit: profit,
            timestamp: new Date(),
        };
        setSalesHistory(prev => [newSale, ...prev]);
        showTemporaryNotif(`🎉 فروش موفق! سود: ${profit.toLocaleString()} تومان`, 3000);
    };

    // فرمت زمان برای تاریخچه فروش
    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
    };

    // ---------- رندر ----------
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4 md:p-6 font-[YekanBakhFaNum]" dir="rtl">
        {/* نوتیفیکیشن شناور */}
    {notification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium backdrop-blur-sm bg-opacity-90 animate-bounce">
            {notification}
            </div>
    )}

    <div className="max-w-7xl mx-auto space-y-8">
        {/* هدر */}
        <div className="text-center space-y-2">
    <h1 className="text-4xl font-extrabold text-orange-800 tracking-tight">🍰 نانوای حرفه‌ای 🧁</h1>
    <p className="text-amber-700 max-w-2xl mx-auto">
        مواد اولیه را ویرایش کن، کیک دلخواهت را با مواد و مقدار مشخص بساز، قیمت تمام شده را محاسبه و فروش را ثبت کن!
    </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* بخش راست: جدول مواد قابل ویرایش */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-5">
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
    <h2 className="text-2xl font-bold text-rose-800 flex items-center gap-2">
                🧺 انبار مواد اولیه <span className="text-sm bg-amber-100 px-2 py-0.5 rounded-full">قابل ویرایش</span>
    </h2>
    <button
    onClick={addNewIngredient}
    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-sm font-semibold shadow flex items-center gap-1 transition"
        >
                ➕ افزودن ماده جدید
    </button>
    </div>
    <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
    <thead className="bg-amber-100 rounded-xl">
    <tr className="text-amber-800">
    <th className="p-2 text-right">ایموجی</th>
        <th className="p-2 text-right">نام ماده</th>
    <th className="p-2 text-right">واحد</th>
        <th className="p-2 text-right">قیمت (تومان)</th>
        <th className="p-2 text-center">حذف</th>
        </tr>
        </thead>
        <tbody>
        {ingredients.map((ing) => (
                <tr key={ing.id} className="border-b border-amber-100 hover:bg-amber-50/50 transition">
            <td className="p-2">
            <input
                type="text"
            value={ing.emoji}
            onChange={(e) => updateIngredient(ing.id, 'emoji', e.target.value)}
    className="w-16 bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-center text-xl"
        />
        </td>
        <td className="p-2">
    <input
        type="text"
    value={ing.name}
    onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
    className="w-28 bg-transparent border border-gray-200 rounded-lg px-2 py-1 font-medium"
        />
        </td>
        <td className="p-2">
    <input
        type="text"
    value={ing.unit}
    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
    className="w-24 bg-transparent border border-gray-200 rounded-lg px-2 py-1"
        />
        </td>
        <td className="p-2">
    <input
        type="number"
    step="500"
    value={ing.pricePerUnit}
    onChange={(e) => updateIngredient(ing.id, 'pricePerUnit', e.target.value)}
    className="w-28 bg-transparent border border-gray-200 rounded-lg px-2 py-1 text-left"
        />
        </td>
        <td className="p-2 text-center">
    <button onClick={() => deleteIngredient(ing.id)} className="text-red-500 hover:text-red-700 text-lg px-2">
                          🗑️
                        </button>
                        </td>
                        </tr>
))}
    </tbody>
    </table>
    </div>
    <p className="text-xs text-gray-500 mt-3 italic">✏️ کلیه مقادیر (واحد، قیمت، ایموجی) قابل ویرایش مستقیم هستند.</p>
    </div>

    {/* بخش چپ: تعریف کیک و فروش */}
    <div className="space-y-6">
        {/* بخش تعریف کیک (دستور پخت) */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-amber-200">
    <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">🎂 تعریف کیک جدید</h2>
    <div className="mb-4">
    <label className="block text-amber-800 font-semibold mb-1">نام کیک:</label>
    <input
    type="text"
    value={cakeName}
    onChange={(e) => setCakeName(e.target.value)}
    className="w-full border border-amber-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-400"
    placeholder="مثل: کیک شکلاتی"
        />
        </div>
        <div className="flex flex-wrap gap-3 items-end mb-5">
    <div className="flex-1 min-w-[140px]">
    <label className="block text-amber-800 text-sm">ماده مورد نظر:</label>
    <select
    value={selectedIngredientId}
    onChange={(e) => setSelectedIngredientId(e.target.value)}
    className="w-full border border-amber-300 rounded-xl px-3 py-2 bg-white"
        >
        {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.emoji} {ing.name} ({ing.unit})</option>
))}
    </select>
    </div>
    <div className="w-32">
    <label className="block text-amber-800 text-sm">مقدار:</label>
    <input
    type="number"
    step="0.1"
    value={newQuantity}
    onChange={(e) => setNewQuantity(parseFloat(e.target.value) || 0)}
    className="w-full border border-amber-300 rounded-xl px-3 py-2"
        />
        </div>
        <button
    onClick={addIngredientToRecipe}
    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl shadow font-semibold flex items-center gap-1"
        >
                  ➕ افزودن به دستور
    </button>
    </div>

    {/* لیست مواد تشکیل‌دهنده کیک */}
    <div className="bg-amber-50 rounded-xl p-3">
    <div className="flex justify-between items-center mb-2">
    <h3 className="font-bold text-amber-900">📋 مواد تشکیل‌دهنده کیک</h3>
    {recipeItems.length > 0 && (
        <button onClick={clearRecipe} className="text-xs text-red-600 bg-white px-2 py-1 rounded-lg">
        حذف همه
    </button>
    )}
    </div>
    {recipeItems.length === 0 ? (
        <div className="text-gray-400 text-center py-6 text-sm">هنوز موادی اضافه نشده، از منوی بالا انتخاب کن</div>
    ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
            {recipeItems.map((item, idx) => {
                    const ingredient = ingredients.find(ing => ing.id === item.ingredientId);
                    if (!ingredient) return null;
                    const itemCost = item.quantity * ingredient.pricePerUnit;
                    return (
                        <div key={idx} className="bg-white rounded-lg p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm border">
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                    <span className="text-xl">{ingredient.emoji}</span>
                        <span className="font-medium">{ingredient.name}</span>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
                    <input
                        type="number"
                    step="0.1"
                    value={item.quantity}
                    onChange={(e) => updateRecipeQuantity(idx, parseFloat(e.target.value) || 0)}
                    className="w-16 bg-transparent text-center border-none focus:ring-0 text-sm font-mono"
                    />
                    <span className="text-xs text-gray-600">{ingredient.unit}</span>
                        </div>
                        <span className="text-xs text-gray-500">× {ingredient.pricePerUnit.toLocaleString()} تومان</span>
                    <span className="text-sm font-bold text-emerald-700">{itemCost.toLocaleString()} تومان</span>
                    </div>
                    <button onClick={() => removeRecipeItem(idx)} className="text-red-400 hover:text-red-700 text-lg px-2">
                            ✖
                          </button>
                          </div>
                );
                })}
            </div>
    )}
    <div className="mt-4 flex justify-between items-center border-t pt-3 border-amber-200">
    <span className="font-bold text-gray-700">💰 قیمت تمام شده (هزینه مواد):</span>
    <span className="text-2xl font-black text-emerald-700">{totalCost.toLocaleString()} تومان</span>
    </div>
    </div>
    </div>

    {/* بخش فروش */}
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-xl p-5 border border-amber-300">
    <h2 className="text-xl font-bold flex items-center gap-2 text-amber-800">💰 فروش کیک و سود ناخالص</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
    <div>
        <label className="block text-sm font-semibold text-gray-700">قیمت فروش (تومان)</label>
    <div className="flex items-center gap-2">
    <input
        type="number"
    value={sellingPriceInput}
    onChange={(e) => setSellingPriceInput(e.target.value)}
    className="w-full border border-orange-300 rounded-xl px-3 py-2 bg-white"
    />
    <button
        onClick={() => setSellingPriceInput(suggestedSellingPrice.toString())}
    className="text-xs bg-white border rounded-lg px-2 py-1 whitespace-nowrap"
        >
        پیشنهاد {suggestedSellingPrice.toLocaleString()}
    </button>
    </div>
    </div>
    <div className="flex items-end">
    <button
        onClick={handleSell}
    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl shadow-lg text-lg transition flex items-center justify-center gap-2"
        >
                    ✅ فروش کیک <span>💰</span>
    </button>
    </div>
    </div>
    {recipeItems.length > 0 && (
        <div className="mt-3 text-sm bg-white/60 p-2 rounded-lg text-center">
            سود تخمینی: {(parseFloat(sellingPriceInput || '0') - totalCost).toLocaleString()} تومان
    </div>
    )}
    </div>

    {/* تاریخچه فروش */}
    <div className="bg-white/70 rounded-2xl shadow-md p-4">
    <h3 className="font-bold text-lg text-rose-800 mb-2 flex items-center gap-2">📜 تاریخچه فروش‌ها</h3>
    {salesHistory.length === 0 ? (
        <div className="text-gray-400 text-center py-4">هنوز فروشی ثبت نشده، اولین فروش را انجام بده!</div>
    ) : (
        <div className="max-h-48 overflow-y-auto space-y-2">
            {salesHistory.map(sale => (
                    <div key={sale.id} className="bg-white rounded-xl p-2 border-r-4 border-emerald-500 shadow-sm flex justify-between flex-wrap text-sm">
                <div>
                    <span className="font-bold">{sale.cakeName}</span>
                    <span className="text-gray-500 text-xs mr-2">({formatTime(sale.timestamp)})</span>
    </div>
    <div>هزینه: {sale.totalCost.toLocaleString()}💰</div>
    <div>فروش: {sale.sellingPrice.toLocaleString()}💰</div>
    <div className={`font-semibold ${sale.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
        سود: {sale.profit.toLocaleString()} تومان
    </div>
    </div>
    ))}
        </div>
    )}
    </div>
    </div>
    </div>

    <footer className="text-center text-xs text-amber-600 pt-4 pb-2 border-t border-amber-200">
          🧁 ویرایش لحظه‌ای قیمت مواد | هر تغییری در قیمت‌ها روی هزینه کیک اثر می‌گذارد | سیستم قیمت تمام شده + فروش حرفه‌ای
    </footer>
    </div>
    </div>
);
}