import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Flame, Check } from 'lucide-react';
import { AppBar } from '../components/AppBar';

interface FoodItem {
  name: string;
  calories: number;
}

const breakfastSuggestions: FoodItem[] = [
  { name: 'White bread', calories: 80 },
  { name: 'Fruit puree', calories: 80 },
  { name: 'Apple baked bagel', calories: 80 },
];

const breakfastOptions: FoodItem[] = [
  { name: 'Banana', calories: 89 },
  { name: 'Orange', calories: 47 },
  { name: 'Low-fat milk', calories: 42 },
  { name: 'Fruit smoothie', calories: 75 },
  { name: 'Porridge', calories: 71 },
  { name: 'Plain waffle', calories: 82 },
  { name: 'Plain pancake', calories: 86 },
  { name: 'Toast', calories: 79 },
  { name: 'White bread', calories: 80 },
  { name: 'Tea with honey', calories: 40 },
];

const lunchOptions: FoodItem[] = [
  { name: 'Grilled chicken', calories: 165 },
  { name: 'Brown rice', calories: 112 },
  { name: 'Mixed salad', calories: 33 },
  { name: 'Vegetable soup', calories: 67 },
  { name: 'Tuna sandwich', calories: 145 },
  { name: 'Pasta', calories: 131 },
];

const dinnerOptions: FoodItem[] = [
  { name: 'Salmon', calories: 206 },
  { name: 'Roasted vegetables', calories: 75 },
  { name: 'Quinoa', calories: 120 },
  { name: 'Chicken soup', calories: 86 },
  { name: 'Turkey breast', calories: 135 },
  { name: 'Steamed broccoli', calories: 35 },
];

export function MealPlan() {
  const navigate = useNavigate();
  const dailyCalories = 2800;
  const breakfastMax = 850;
  const lunchMax = 950;
  const dinnerMax = 1000;

  const [selectedBreakfast, setSelectedBreakfast] = useState<string[]>([]);
  const [selectedLunch, setSelectedLunch] = useState<string[]>([]);
  const [selectedDinner, setSelectedDinner] = useState<string[]>([]);

  const calculateTotal = (selected: string[], options: FoodItem[]) => {
    return selected.reduce((total, itemName) => {
      const item = options.find((opt) => opt.name === itemName);
      return total + (item?.calories || 0);
    }, 0);
  };

  const toggleSelection = (
    itemName: string,
    meal: 'breakfast' | 'lunch' | 'dinner'
  ) => {
    if (meal === 'breakfast') {
      setSelectedBreakfast((prev) =>
        prev.includes(itemName)
          ? prev.filter((name) => name !== itemName)
          : [...prev, itemName]
      );
    } else if (meal === 'lunch') {
      setSelectedLunch((prev) =>
        prev.includes(itemName)
          ? prev.filter((name) => name !== itemName)
          : [...prev, itemName]
      );
    } else {
      setSelectedDinner((prev) =>
        prev.includes(itemName)
          ? prev.filter((name) => name !== itemName)
          : [...prev, itemName]
      );
    }
  };

  const breakfastTotal = calculateTotal(selectedBreakfast, breakfastOptions);
  const lunchTotal = calculateTotal(selectedLunch, lunchOptions);
  const dinnerTotal = calculateTotal(selectedDinner, dinnerOptions);

  return (
    <div className="h-full bg-gradient-to-b from-orange-50 to-white overflow-y-auto pb-24">
      <AppBar backTo="/body-measurement" />

      <div className="px-6 pt-24 py-8 pb-8">
        {/* Daily Calories Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-[14px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] p-6 mb-6 text-center">
          <Flame className="w-12 h-12 text-white mx-auto mb-3" />
          <h2 className="text-white font-['Inter:SemiBold',sans-serif] font-semibold text-[16px] mb-2">
            Your Daily Calorie Target
          </h2>
          <p className="text-white font-['Inter:Bold',sans-serif] font-bold text-[36px]">
            {dailyCalories}
          </p>
          <p className="text-orange-100 text-[14px]">calories per day</p>
        </div>

        {/* Breakfast Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Inter:SemiBold',sans-serif] font-semibold text-[18px] text-gray-900">
              Breakfast 🍳
            </h3>
            <span className="text-[14px] text-gray-600">
              (maximum {breakfastMax} kcal)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[12px] text-gray-600 mb-1">
              <span>Selected: {breakfastTotal} kcal</span>
              <span>{breakfastMax - breakfastTotal} kcal remaining</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                style={{
                  width: `${Math.min((breakfastTotal / breakfastMax) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Suggestions */}
          <div className="mb-4">
            <p className="text-[14px] font-['Inter:Medium',sans-serif] font-medium text-gray-700 mb-3">
              Suggestions
            </p>
            <div className="grid grid-cols-3 gap-3">
              {breakfastSuggestions.map((item, index) => (
                <div
                  key={index}
                  className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center"
                >
                  <p className="text-[12px] font-['Inter:Medium',sans-serif] font-medium text-gray-900 mb-1">
                    Suggestion {index + 1}
                  </p>
                  <p className="text-[11px] text-gray-700 mb-1">{item.name}</p>
                  <p className="text-[11px] text-orange-600 font-['Inter:SemiBold',sans-serif] font-semibold">
                    {item.calories} kcal
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Food Options */}
          <div>
            <p className="text-[14px] font-['Inter:Medium',sans-serif] font-medium text-gray-700 mb-3">
              Choose your items
            </p>
            <div className="grid grid-cols-2 gap-3">
              {breakfastOptions.map((item) => {
                const isSelected = selectedBreakfast.includes(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => toggleSelection(item.name, 'breakfast')}
                    className={`relative bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <p className="text-[13px] font-['Inter:Medium',sans-serif] font-medium text-gray-900 mb-1">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-orange-600 font-['Inter:SemiBold',sans-serif] font-semibold">
                      {item.calories} kcal
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lunch Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Inter:SemiBold',sans-serif] font-semibold text-[18px] text-gray-900">
              Lunch 🍽️
            </h3>
            <span className="text-[14px] text-gray-600">
              (maximum {lunchMax} kcal)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[12px] text-gray-600 mb-1">
              <span>Selected: {lunchTotal} kcal</span>
              <span>{lunchMax - lunchTotal} kcal remaining</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                style={{
                  width: `${Math.min((lunchTotal / lunchMax) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Food Options */}
          <div>
            <p className="text-[14px] font-['Inter:Medium',sans-serif] font-medium text-gray-700 mb-3">
              Choose your items
            </p>
            <div className="grid grid-cols-2 gap-3">
              {lunchOptions.map((item) => {
                const isSelected = selectedLunch.includes(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => toggleSelection(item.name, 'lunch')}
                    className={`relative bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <p className="text-[13px] font-['Inter:Medium',sans-serif] font-medium text-gray-900 mb-1">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-green-600 font-['Inter:SemiBold',sans-serif] font-semibold">
                      {item.calories} kcal
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dinner Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Inter:SemiBold',sans-serif] font-semibold text-[18px] text-gray-900">
              Dinner 🍴
            </h3>
            <span className="text-[14px] text-gray-600">
              (maximum {dinnerMax} kcal)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[12px] text-gray-600 mb-1">
              <span>Selected: {dinnerTotal} kcal</span>
              <span>{dinnerMax - dinnerTotal} kcal remaining</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all"
                style={{
                  width: `${Math.min((dinnerTotal / dinnerMax) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Food Options */}
          <div>
            <p className="text-[14px] font-['Inter:Medium',sans-serif] font-medium text-gray-700 mb-3">
              Choose your items
            </p>
            <div className="grid grid-cols-2 gap-3">
              {dinnerOptions.map((item) => {
                const isSelected = selectedDinner.includes(item.name);
                return (
                  <div
                    key={item.name}
                    onClick={() => toggleSelection(item.name, 'dinner')}
                    className={`relative bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <p className="text-[13px] font-['Inter:Medium',sans-serif] font-medium text-gray-900 mb-1">
                      {item.name}
                    </p>
                    <p className="text-[12px] text-purple-600 font-['Inter:SemiBold',sans-serif] font-semibold">
                      {item.calories} kcal
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={() => navigate('/home')}
          className="w-full h-[48px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-[8px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] font-['Inter:Medium',sans-serif] font-medium text-[18px] tracking-[-0.4395px] transition-colors"
        >
          Save Meal Plan
        </button>
      </div>
    </div>
  );
}
