import React from 'react';
import {iranCitiesByProvince, iranProvinces} from "../data/iranLocations";

interface ProvinceCitySelectorProps {
    provinceId: number | '';
    cityId: number | '';
    onProvinceChange: (id: number | '') => void;
    onCityChange: (id: number | '') => void;
}

export const ProvinceCitySelector: React.FC<ProvinceCitySelectorProps> = ({
                                                                              provinceId,
                                                                              cityId,
                                                                              onProvinceChange,
                                                                              onCityChange,
                                                                          }) => {

    // وقتی استان تغییر می‌کند، شهر باید خالی شود
    const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        onProvinceChange(val ? Number(val) : '');
        //onCityChange(''); // ریست کردن شهر
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        onCityChange(val ? Number(val) : '');
    };

    // گرفتن لیست شهرهای استان انتخاب شده (اگر استانی انتخاب نشده باشد، آرایه خالی برمی‌گردد)
    const availableCities = provinceId && iranCitiesByProvince[provinceId]
        ? iranCitiesByProvince[provinceId]
        : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* انتخاب استان */}
            <div className="flex flex-col gap-2">
                <label htmlFor="province" className="text-sm font-medium text-gray-700">
                    استان
                </label>
                <select
                    id="province"
                    value={provinceId}
                    onChange={handleProvinceChange}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">انتخاب کنید...</option>
                    {iranProvinces.map((province) => (
                        <option key={province.id} value={province.id}>
                            {province.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* انتخاب شهر */}
            <div className="flex flex-col gap-2">
                <label htmlFor="city" className="text-sm font-medium text-gray-700">
                    شهر
                </label>
                <select
                    id="city"
                    value={cityId}
                    onChange={handleCityChange}
                    disabled={!provinceId} // تا استان انتخاب نشود، شهر غیرفعال است
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                >
                    <option value="">
                        {!provinceId ? 'ابتدا استان را انتخاب کنید' : 'انتخاب کنید...'}
                    </option>
                    {availableCities.map((city) => (
                        <option key={city.id} value={city.id}>
                            {city.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};
