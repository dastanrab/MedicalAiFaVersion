import React, { useState, useMemo, useEffect } from 'react';

// --- Types ---
type Unit = 'گرم' | 'کیلوگرم' | 'عدد' | 'لیتر' | 'میلی‌لیتر' | 'قاشق غذاخوری' | 'قاشق چای‌خوری' | 'پیمانه' | 'بسته' | 'ورقه' | 'شاخه' | 'حبه';

interface Ingredient {
    id: string;
    name: string;
    emoji: string;
    unit: Unit;
    pricePerUnit: number;
}

interface RecipeItem {
    ingredientId: string;
    amount: number;
}

interface Cake {
    id: string;
    name: string;
    recipe: RecipeItem[];
    baseWeightKg: number;
}

// --- Emoji List ---
const defaultEmojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🥚', '🥛', '🧈', '🧀', '🍯', '🍞', '🌰', '🍪', '🌿', '🫒', '🌾', '🧂', '🍫', '🌻', '🍶', '🌸', '⬜'];

// --- Initial Data ---
const initialIngredients: Ingredient[] = [
    { id: '1', name: 'آرد', emoji: '🌾', unit: 'گرم', pricePerUnit: 30 },
    { id: '2', name: 'شکر', emoji: '🧂', unit: 'گرم', pricePerUnit: 40 },
    { id: '3', name: 'تخم مرغ', emoji: '🥚', unit: 'عدد', pricePerUnit: 5000 },
    { id: '4', name: 'شیر', emoji: '🥛', unit: 'میلی‌لیتر', pricePerUnit: 35 },
    { id: '5', name: 'پودر کاکائو', emoji: '🍫', unit: 'گرم', pricePerUnit: 300 },
    { id: '6', name: 'روغن', emoji: '🌻', unit: 'گرم', pricePerUnit: 60 },
    { id: '7', name: 'خامه', emoji: '🍶', unit: 'میلی‌لیتر', pricePerUnit: 100 },
    { id: '8', name: 'وانیل', emoji: '🌸', unit: 'قاشق چای‌خوری', pricePerUnit: 5000 },
    { id: '9', name: 'بیکینگ پودر', emoji: '⬜', unit: 'قاشق چای‌خوری', pricePerUnit: 2000 },
];

const PROFIT_MARGIN = 1.4;

export default function CakeShopManager() {
    const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
        const saved = localStorage.getItem('bakery_ingredients');
        return saved ? JSON.parse(saved) : initialIngredients;
    });

    const [cakes, setCakes] = useState<Cake[]>(() => {
        const saved = localStorage.getItem('bakery_cakes');
        return saved ? JSON.parse(saved) : [];
    });

    const [newCakeName, setNewCakeName] = useState('');
    const [newCakeWeight, setNewCakeWeight] = useState(1);
    const [currentRecipe, setCurrentRecipe] = useState<RecipeItem[]>([]);
    const [nlpText, setNlpText] = useState('');

    const [showAddIngredient, setShowAddIngredient] = useState(false);
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        emoji: defaultEmojis[0],
        unit: 'گرم' as Unit,
        pricePerUnit: 0
    });

    useEffect(() => {
        localStorage.setItem('bakery_ingredients', JSON.stringify(ingredients));
    }, [ingredients]);

    useEffect(() => {
        localStorage.setItem('bakery_cakes', JSON.stringify(cakes));
    }, [cakes]);

    const handleIngredientChange = (id: string, field: keyof Ingredient, value: string | number) => {
        setIngredients(prev =>
            prev.map(ing => (ing.id === id ? { ...ing, [field]: value } : ing))
        );
    };

    const handleDeleteIngredient = (id: string) => {
        const isUsedInCake = cakes.some(cake => cake.recipe.some(item => item.ingredientId === id));
        const isUsedInCurrentRecipe = currentRecipe.some(item => item.ingredientId === id);

        if (isUsedInCake || isUsedInCurrentRecipe) {
            alert('⚠️ این ماده در یک یا چند کیک استفاده شده است.');
            return;
        }
        setIngredients(prev => prev.filter(ing => ing.id !== id));
    };

    const handleAddIngredient = () => {
        if (!newIngredient.name || !newIngredient.emoji || newIngredient.pricePerUnit <= 0) {
            alert('لطفاً تمام فیلدها را پر کنید.');
            return;
        }
        const ingredient: Ingredient = { id: Date.now().toString(), ...newIngredient };
        setIngredients([...ingredients, ingredient]);
        setNewIngredient({ name: '', emoji: defaultEmojis[0], unit: 'گرم', pricePerUnit: 0 });
        setShowAddIngredient(false);
    };

    const addIngredientToRecipe = (ingredientId: string) => {
        if (!currentRecipe.find(item => item.ingredientId === ingredientId)) {
            setCurrentRecipe([...currentRecipe, { ingredientId, amount: 0 }]);
        }
    };

    const updateRecipeAmount = (ingredientId: string, amount: number) => {
        setCurrentRecipe(prev => prev.map(item => (item.ingredientId === ingredientId ? { ...item, amount } : item)));
    };

    const removeFromRecipe = (ingredientId: string) => {
        setCurrentRecipe(prev => prev.filter(item => item.ingredientId !== ingredientId));
    };

    const saveCake = () => {
        if (!newCakeName) return alert('نام کیک را وارد کنید.');
        if (currentRecipe.length === 0) return alert('حداقل یک ماده اولیه اضافه کنید.');
        setCakes([...cakes, { id: Date.now().toString(), name: newCakeName, recipe: currentRecipe, baseWeightKg: newCakeWeight }]);
        setNewCakeName('');
        setCurrentRecipe([]);
    };

    const deleteCake = (cakeId: string) => {
        setCakes(prev => prev.filter(cake => cake.id !== cakeId));
    };

    const calculateCakeCost = (recipe: RecipeItem[]) => {
        return recipe.reduce((total, item) => {
            const ing = ingredients.find(i => i.id === item.ingredientId);
            return total + (ing ? ing.pricePerUnit * item.amount : 0);
        }, 0);
    };

    // --- NLP Regex Logic ---
    const parseTextAndCalculate = useMemo(() => {
        if (!nlpText.trim() || cakes.length === 0) return null;

        // تبدیل اعداد فارسی و عربی به انگلیسی و حذف نیم‌فاصله‌ها
        const normalizeText = (str: string) => {
            const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
            const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            let res = str.replace(/[۰-۹]/g, w => persian.indexOf(w).toString());
            res = res.replace(/[٠-٩]/g, w => arabic.indexOf(w).toString());
            res = res.replace(/\u200c/g, ' '); // تبدیل نیم‌فاصله به فاصله
            return res;
        };

        const normalizedText = normalizeText(nlpText);
        let totalCost = 0, totalPrice = 0;
        const foundItems: string[] = [];

        cakes.forEach(cake => {
            // فرار (Escape) دادن نام کیک برای جلوگیری از خطای Regex
            const safeCakeName = cake.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            // Regex پیشرفته:
            // تشخیص عدد + فاصله اختیاری + واحد (کیلو/گرم) + فاصله اختیاری + کلمه اختیاری (کیک/از) + نام کیک
            const regex = new RegExp(`([\\d\\.]+)\\s*(?:کیلوگرم|کیلو|kg|گرم)\\s*(?:کیک\\s+)?(?:از\\s+)?${safeCakeName}`, 'gi');

            let match;
            while ((match = regex.exec(normalizedText)) !== null) {
                let weight = parseFloat(match[1]);

                // اگر واحد گرم بود، به کیلوگرم تبدیل می‌شود
                if (match[0].includes('گرم') && !match[0].includes('کیلو')) {
                    weight = weight / 1000;
                }

                if (!isNaN(weight)) {
                    const costForBaseWeight = calculateCakeCost(cake.recipe);
                    const costPerKg = costForBaseWeight / cake.baseWeightKg;
                    const itemCost = costPerKg * weight;
                    const itemPrice = itemCost * PROFIT_MARGIN;
                    totalCost += itemCost;
                    totalPrice += itemPrice;
                    foundItems.push(`${weight} کیلو ${cake.name}`);
                }
            }
        });
        return { totalCost, totalPrice, foundItems };
    }, [nlpText, cakes, ingredients]);

    const getUnitLabel = (unit: Unit): string => {
        const labels: Record<Unit, string> = {
            'گرم': 'گرم', 'کیلوگرم': 'کیلوگرم', 'عدد': 'عدد', 'لیتر': 'لیتر', 'میلی‌لیتر': 'میلی‌لیتر',
            'قاشق غذاخوری': 'ق.غ', 'قاشق چای‌خوری': 'ق.چ', 'پیمانه': 'پیمانه', 'بسته': 'بسته',
            'ورقه': 'ورقه', 'شاخه': 'شاخه', 'حبه': 'حبه',
        };
        return labels[unit] || unit;
    };

    // --- Styles ---
    const inputClasses = "w-full bg-transparent border-b border-pink-200 py-2 text-sm focus:outline-none focus:border-rose-400 transition-colors text-pink-950 placeholder-pink-300";
    const cardClasses = "bg-white p-5 md:p-7 rounded-2xl border border-pink-100 shadow-sm shadow-pink-100/50";
    const btnPrimaryClasses = "py-2 bg-rose-400 text-white text-sm rounded-lg hover:bg-rose-500 transition shadow-sm shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="min-h-screen bg-pink-50 text-pink-900 font-[YekanBakhFaNum] p-4 md:p-8 dir-rtl text-right selection:bg-rose-200" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">

                <h1 className="text-2xl md:text-3xl font-light tracking-tight text-center text-rose-900">
                    مدیریت قنادی
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Ingredients Section */}
                    <div className={cardClasses}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium text-pink-900">مواد اولیه <span className="text-sm text-pink-400 font-light">({ingredients.length})</span></h2>
                            <button
                                onClick={() => {
                                    setNewIngredient({ name: '', emoji: defaultEmojis[0], unit: 'گرم', pricePerUnit: 0 });
                                    setShowAddIngredient(!showAddIngredient);
                                }}
                                className="text-xs px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition border border-rose-100"
                            >
                                + افزودن
                            </button>
                        </div>

                        {showAddIngredient && (
                            <div className="mb-6 p-4 border border-pink-100 rounded-xl bg-pink-50/50 space-y-4">
                                <div className="flex gap-3 items-end">
                                    <select
                                        value={newIngredient.emoji}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, emoji: e.target.value })}
                                        className="w-12 py-2 text-lg bg-transparent border-b border-pink-200 focus:outline-none focus:border-rose-400 text-center cursor-pointer appearance-none"
                                    >
                                        {defaultEmojis.map((emoji, idx) => <option key={idx} value={emoji}>{emoji}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="نام ماده..."
                                        value={newIngredient.name}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                                <div className="flex gap-3 items-end">
                                    <input
                                        type="number"
                                        placeholder="قیمت هر واحد"
                                        value={newIngredient.pricePerUnit || ''}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, pricePerUnit: Number(e.target.value) })}
                                        className={inputClasses}
                                    />
                                    <select
                                        value={newIngredient.unit}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as Unit })}
                                        className={inputClasses + " cursor-pointer text-pink-700"}
                                    >
                                        <option value="گرم">گرم</option><option value="کیلوگرم">کیلوگرم</option><option value="عدد">عدد</option>
                                        <option value="لیتر">لیتر</option><option value="میلی‌لیتر">میلی‌لیتر</option><option value="قاشق غذاخوری">قاشق غذاخوری</option>
                                        <option value="قاشق چای‌خوری">قاشق چای‌خوری</option><option value="پیمانه">پیمانه</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button onClick={handleAddIngredient} className={`flex-1 ${btnPrimaryClasses}`}>ذخیره</button>
                                    <button onClick={() => setShowAddIngredient(false)} className="px-4 py-2 text-sm text-pink-500 hover:text-pink-800 transition">انصراف</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                            {ingredients.map(ing => (
                                <div key={ing.id} className="flex flex-wrap sm:flex-nowrap items-center justify-between py-2 border-b border-pink-50 group hover:bg-pink-50/50 rounded-lg px-2 transition-colors">
                                    <div className="flex items-center gap-3 w-full sm:w-auto mb-2 sm:mb-0">
                                        <span className="text-xl">{ing.emoji}</span>
                                        <input
                                            type="text"
                                            value={ing.name}
                                            onChange={(e) => handleIngredientChange(ing.id, 'name', e.target.value)}
                                            className="bg-transparent focus:outline-none w-24 text-sm font-medium text-pink-900"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-pink-600">
                                        <input
                                            type="number"
                                            value={ing.pricePerUnit}
                                            onChange={(e) => handleIngredientChange(ing.id, 'pricePerUnit', Number(e.target.value))}
                                            className="w-16 p-1 text-center bg-transparent border-b border-dashed border-pink-300 focus:outline-none focus:border-rose-400"
                                        />
                                        <span>تومان /</span>
                                        <select
                                            value={ing.unit}
                                            onChange={(e) => handleIngredientChange(ing.id, 'unit', e.target.value)}
                                            className="bg-transparent focus:outline-none cursor-pointer w-14 text-pink-700"
                                        >
                                            <option value="گرم">گرم</option><option value="کیلوگرم">کیلو</option><option value="عدد">عدد</option>
                                            <option value="لیتر">لیتر</option><option value="میلی‌لیتر">میلی‌لیتر</option><option value="قاشق غذاخوری">ق.غ</option>
                                            <option value="قاشق چای‌خوری">ق.چ</option><option value="پیمانه">پیمانه</option>
                                        </select>
                                        <button onClick={() => handleDeleteIngredient(ing.id)} className="text-pink-300 hover:text-red-500 text-lg sm:opacity-0 group-hover:opacity-100 transition mr-2">&times;</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cake Builder Section */}
                    <div className={cardClasses}>
                        <h2 className="text-lg font-medium text-pink-900 mb-6">کیک جدید</h2>

                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <input
                                type="text"
                                placeholder="نام کیک (مثلا: شکلاتی)"
                                value={newCakeName}
                                onChange={(e) => setNewCakeName(e.target.value)}
                                className={inputClasses}
                            />
                            <div className="flex items-end gap-2 w-full sm:w-1/3">
                                <input
                                    type="number"
                                    placeholder="وزن"
                                    value={newCakeWeight || ''}
                                    onChange={(e) => setNewCakeWeight(Number(e.target.value))}
                                    className={inputClasses}
                                />
                                <span className="text-xs text-pink-400 pb-2">کیلوگرم</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-xs text-pink-500 mb-3">مواد لازم را انتخاب کنید:</p>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {ingredients.map(ing => {
                                    const isAdded = currentRecipe.some(item => item.ingredientId === ing.id);
                                    return (
                                        <button
                                            key={ing.id}
                                            onClick={() => addIngredientToRecipe(ing.id)}
                                            disabled={isAdded}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition border ${
                                                isAdded ? 'bg-pink-50 text-pink-300 border-transparent cursor-not-allowed' : 'bg-white text-pink-700 border-pink-200 hover:border-rose-400 shadow-sm'
                                            }`}
                                        >
                                            {ing.emoji} {ing.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {currentRecipe.length > 0 && (
                            <div className="mb-6 space-y-2">
                                {currentRecipe.map(item => {
                                    const ing = ingredients.find(i => i.id === item.ingredientId)!;
                                    return (
                                        <div key={item.ingredientId} className="flex justify-between items-center text-sm p-2 bg-pink-50/50 rounded-lg border border-pink-100">
                                            <span className="text-pink-800">{ing.emoji} {ing.name}</span>
                                            <div className="flex items-center gap-2 text-xs text-pink-600">
                                                <input
                                                    type="number"
                                                    value={item.amount || ''}
                                                    onChange={(e) => updateRecipeAmount(item.ingredientId, Number(e.target.value))}
                                                    placeholder="مقدار"
                                                    className="w-16 p-1 text-center bg-transparent border-b border-pink-300 focus:outline-none focus:border-rose-400"
                                                />
                                                <span className="w-8 text-right">{getUnitLabel(ing.unit)}</span>
                                                <button onClick={() => removeFromRecipe(item.ingredientId)} className="text-pink-400 hover:text-red-500 text-lg transition px-1">&times;</button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="pt-4 mt-4 border-t border-pink-100 space-y-2">
                                    <div className="flex justify-between text-xs text-pink-600">
                                        <span>هزینه کل مواد:</span>
                                        <span>{calculateCakeCost(currentRecipe).toLocaleString()} تومان</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-pink-600">
                                        <span>هزینه هر کیلو:</span>
                                        <span>{Math.round(calculateCakeCost(currentRecipe) / newCakeWeight).toLocaleString()} تومان</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-rose-900 mt-2 bg-rose-50 p-2 rounded-md">
                                        <span>قیمت فروش (۴۰٪ سود):</span>
                                        <span>{Math.round(calculateCakeCost(currentRecipe) * PROFIT_MARGIN).toLocaleString()} تومان</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={saveCake}
                            disabled={currentRecipe.length === 0}
                            className={`w-full ${btnPrimaryClasses}`}
                        >
                            ثبت کیک
                        </button>
                    </div>
                </div>

                {/* Cakes Menu */}
                {cakes.length > 0 && (
                    <div className={cardClasses}>
                        <h2 className="text-lg font-medium text-pink-900 mb-6">منوی کیک‌ها</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {cakes.map(cake => {
                                const cost = calculateCakeCost(cake.recipe);
                                const price = cost * PROFIT_MARGIN;
                                return (
                                    <div key={cake.id} className="border border-pink-200 p-5 rounded-xl bg-pink-50/50 relative group hover:shadow-md transition shadow-sm">
                                        <button onClick={() => deleteCake(cake.id)} className="absolute top-3 left-3 text-pink-300 hover:text-red-500 text-lg sm:opacity-0 group-hover:opacity-100 transition">&times;</button>
                                        <h3 className="font-medium text-rose-900 mb-1">{cake.name}</h3>
                                        <p className="text-xs text-pink-500 mb-4">وزن پایه: {cake.baseWeightKg} کیلوگرم</p>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between text-pink-600">
                                                <span>هزینه/کیلو:</span>
                                                <span>{Math.round(cost/cake.baseWeightKg).toLocaleString()} تومان</span>
                                            </div>
                                            <div className="flex justify-between font-medium text-pink-900">
                                                <span>فروش/کیلو:</span>
                                                <span>{Math.round(price/cake.baseWeightKg).toLocaleString()} تومان</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* NLP Section */}
                <div className="bg-rose-100/70 border border-rose-200 p-5 md:p-7 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-medium mb-2 text-rose-900">سفارش‌گیر هوشمند</h2>
                    <p className="text-xs text-rose-600 mb-4">متن سفارش را وارد کنید. (مثال: «۲ کیلو کیک شکلاتی» یا «۵۰۰ گرم وانیلی»)</p>
                    <textarea
                        value={nlpText}
                        onChange={(e) => setNlpText(e.target.value)}
                        placeholder="متن سفارش خود را اینجا بنویسید..."
                        className="w-full h-24 p-4 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none text-rose-950 placeholder-rose-300 transition-all"
                    />

                    {parseTextAndCalculate && parseTextAndCalculate.foundItems.length > 0 && (
                        <div className="mt-4 p-4 bg-white rounded-xl border border-rose-100 shadow-sm">
                            <ul className="list-disc list-inside text-rose-800 text-sm mb-4 space-y-1">
                                {parseTextAndCalculate.foundItems.map((item, idx) => <li key={idx}>{item}</li>)}
                            </ul>
                            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center pt-3 border-t border-rose-100 gap-2">
                                <span className="text-xs text-rose-600">هزینه مواد: {Math.round(parseTextAndCalculate.totalCost).toLocaleString()} تومان</span>
                                <span className="text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg">
                                    مبلغ قابل پرداخت: {Math.round(parseTextAndCalculate.totalPrice).toLocaleString()} تومان
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
