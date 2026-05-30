import { useState } from 'react';

interface EnrichedExerciseItem {
    exercise: string;
    exercise_fa?: string;
    exercise_en?: string;
    duration: string;
    minutes?: number;
    met?: number;
    calories_per_minute?: number;
    total_calories?: number;
    found_in_db: boolean;
    message?: string;
}

interface ExtractionResult {
    items: EnrichedExerciseItem[];
    total_minutes: number;
    total_calories: number;
}

export default function ExerciseExtractor() {
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ExtractionResult | null>(null);
    const [error, setError] = useState('');
    const [translatedText, setTranslatedText] = useState('');

    // ترجمه با استفاده از MyMemory Translation API (رایگان)
    const translateToEnglish = async (text: string): Promise<string> => {
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fa|en`
            );

            if (!response.ok) {
                throw new Error('خطا در ترجمه');
            }

            const data = await response.json();

            if (data.responseStatus === 200 && data.responseData) {
                return data.responseData.translatedText;
            } else {
                throw new Error('ترجمه ناموفق بود');
            }
        } catch (err) {
            console.error('Translation error:', err);
            return text;
        }
    };

    const isPersian = (text: string): boolean => {
        const persianPattern = /[\u0600-\u06FF]/;
        return persianPattern.test(text);
    };

    const handleExtract = async () => {
        if (!inputText.trim()) {
            setError('لطفاً متن فعالیت ورزشی خود را وارد کنید');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);
        setTranslatedText('');

        try {
            let textToProcess = inputText;

            if (isPersian(inputText)) {
                textToProcess = await translateToEnglish(inputText);
                setTranslatedText(textToProcess);
            }

            const response = await fetch('http://127.0.0.1:8000/api/exercise-extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    text: textToProcess,
                }),
            });

            if (!response.ok) {
                throw new Error('خطا در ارتباط با سرور');
            }

            const data = await response.json();

            if (data.success && data.data) {
                setResult(data.data);
            } else {
                throw new Error(data.message || 'فرمت پاسخ نامعتبر است');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'خطای ناشناخته');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setInputText('');
        setResult(null);
        setError('');
        setTranslatedText('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-sky-50 py-4 sm:py-8 md:py-12 px-3 sm:px-4 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8 md:mb-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 px-2">
                        استخراج اطلاعات ورزشی
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 px-2">
                        فعالیت ورزشی خود را به فارسی یا انگلیسی وارد کنید
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-gray-100">
                    <label htmlFor="exercise-input" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        متن فعالیت ورزشی (فارسی یا انگلیسی)
                    </label>
                    <textarea
                        id="exercise-input"
                        rows={5}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base text-gray-900 placeholder-gray-400"
                        placeholder="مثال: سی دقیقه دویدم، بیست دقیقه دوچرخه‌سواری کردم و پانزده دقیقه شنا"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={loading}
                    />

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                        <button
                            onClick={handleExtract}
                            disabled={loading || !inputText.trim()}
                            className="w-full sm:flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    در حال پردازش...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    استخراج اطلاعات
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg sm:rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm sm:text-base"
                        >
                            پاک کردن
                        </button>
                    </div>

                    {/* نمایش متن ترجمه شده */}
                    {translatedText && (
                        <div className="mt-4 sm:mt-6 bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 ml-2 sm:ml-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div className="flex-1">
                                    <p className="text-xs sm:text-sm font-semibold text-blue-700 mb-1">متن ترجمه شده:</p>
                                    <p className="text-xs sm:text-sm text-blue-800 break-words">{translatedText}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 sm:mt-6 bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 ml-2 sm:ml-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs sm:text-sm text-red-700 font-medium break-words">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {result && result.items && result.items.length > 0 && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        {/* Header with totals */}
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                نتایج استخراج شده
                            </h2>
                            <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                                {result.items.length} فعالیت ورزشی شناسایی شد
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                            <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                <div className="text-xs text-gray-500">مجموع زمان</div>
                                <div className="text-lg font-bold text-indigo-600">{result.total_minutes}</div>
                                <div className="text-xs text-gray-400">دقیقه</div>
                            </div>
                            <div className="bg-white p-3 rounded-lg shadow-sm text-center">
                                <div className="text-xs text-gray-500">کالری سوزانده شده</div>
                                <div className="text-lg font-bold text-red-600">{result.total_calories}</div>
                                <div className="text-xs text-gray-400">کیلوکالری</div>
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="block sm:hidden divide-y divide-gray-200">
                            {result.items.map((item, index) => (
                                <div key={index} className={`p-4 hover:bg-indigo-50 transition-colors duration-150 ${!item.found_in_db ? 'bg-yellow-50' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center">
                                            <span className="text-sm font-bold text-indigo-700">{index + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg">🏃</span>
                                                <p className="text-sm font-semibold text-gray-900 break-words">
                                                    {item.exercise_fa || item.exercise}
                                                </p>
                                                {!item.found_in_db && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        ناموجود
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 mb-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                                                    {item.duration}
                                                </span>
                                                {item.minutes && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                        {item.minutes} دقیقه
                                                    </span>
                                                )}
                                            </div>
                                            {item.found_in_db ? (
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">کالری:</span>
                                                        <span className="font-medium">{item.total_calories}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">MET:</span>
                                                        <span className="font-medium">{item.met ?? '—'}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-yellow-700 mt-1">{item.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">ردیف</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">نام فعالیت</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">مدت</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">دقیقه</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">کالری</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">MET</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">وضعیت</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {result.items.map((item, index) => (
                                    <tr key={index} className={`hover:bg-indigo-50 transition-colors duration-150 ${!item.found_in_db ? 'bg-yellow-50' : ''}`}>
                                        <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-lg">
                                                <span className="text-sm font-bold text-indigo-700">{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-lg flex items-center justify-center ml-2 md:ml-3">
                                                    <span className="text-white text-sm">🏃</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm md:text-base font-semibold text-gray-900">
                                                        {item.exercise_fa || item.exercise}
                                                    </div>
                                                    {item.exercise_en && item.exercise_en !== item.exercise && (
                                                        <div className="text-xs text-gray-500">{item.exercise_en}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-4 py-3 text-sm text-gray-900">
                                            {item.duration}
                                        </td>
                                        <td className="px-3 md:px-4 py-3 text-sm text-gray-900">
                                            {item.minutes ? `${item.minutes} دقیقه` : '—'}
                                        </td>
                                        <td className="px-3 md:px-4 py-3 text-sm text-gray-900">
                                            {item.total_calories ?? '—'}
                                        </td>
                                        <td className="px-3 md:px-4 py-3 text-sm text-gray-900">
                                            {item.met ?? '—'}
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            {item.found_in_db ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        موجود
                                                    </span>
                                            ) : (
                                                <div className="relative group">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 cursor-help">
                                                            <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            ناموجود
                                                        </span>
                                                    {item.message && (
                                                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                                            {item.message}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-600 text-center">
                                جمع کل: <span className="font-bold text-gray-900">{result.items.length}</span> فعالیت ورزشی
                                <span className="mx-2">|</span>
                                کالری سوزانده شده: <span className="font-bold text-red-600">{result.total_calories} کیلوکالری</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!result && !loading && !error && (
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-8 sm:p-10 md:p-12 text-center border border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4 sm:mb-6">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">آماده برای استخراج</h3>
                        <p className="text-sm sm:text-base text-gray-600 px-4">فعالیت ورزشی خود را به فارسی یا انگلیسی وارد کنید</p>
                    </div>
                )}
            </div>
        </div>
    );
}
