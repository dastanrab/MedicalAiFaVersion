import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ArrowRight, FileText, CheckSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { AppBar } from '../components/AppBar';
import {useAuthStore} from "../store/authStore";

const symptoms = [
  { id: 'headache', label: 'سردرد', category: 'سر' },
  { id: 'fever', label: 'تب', category: 'عمومی' },
  { id: 'cough', label: 'سرفه', category: 'تنفسی' },
  { id: 'sore-throat', label: 'گلودرد', category: 'تنفسی' },
  { id: 'fatigue', label: 'خستگی', category: 'عمومی' },
  { id: 'nausea', label: 'حالت تهوع', category: 'گوارشی' },
  { id: 'dizziness', label: 'سرگیجه', category: 'سر' },
  { id: 'body-ache', label: 'درد بدن', category: 'عمومی' },
  { id: 'runny-nose', label: 'آبریزش بینی', category: 'تنفسی' },
  { id: 'chest-pain', label: 'درد قفسه سینه', category: 'قفسه سینه' },
  { id: 'shortness-breath', label: 'تنگی نفس', category: 'تنفسی' },
  { id: 'stomach-pain', label: 'درد شکم', category: 'گوارشی' },
];

type InputMode = 'select' | 'text';

export function SymptomSelection() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<InputMode>('text');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // برای حالت توضیح آزاد
  const [freeText, setFreeText] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleSymptom = (id: string) => {
    // @ts-ignore
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const filteredSymptoms = symptoms.filter((symptom) =>
      symptom.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinueWithSelection = () => {
    navigate('/questionnairev1', { state: { selectedSymptoms } });
  };

  const handleSubmitFreeText = () => {
    if (!freeText.trim()) {
      setError('لطفاً علائم خود را شرح دهید');
      return;
    }

    const payload: any = { symptoms: freeText };
    if (age) payload.age = Number(age);
    if (gender) payload.gender = gender;
    if (medicalHistory) payload.medical_history = medicalHistory;

    // انتقال به صفحه نتیجه با داده‌ها
    navigate('/diagnosis-result', {
      state: {
        requestPayload: payload,
        isLoading: true
      }
    });
  };

  return (
      <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto relative" dir="rtl">
        <AppBar />

        <div className="px-6 pt-24 pb-32">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl mb-2 text-gray-900">علائم خود را وارد کنید</h1>
            <p className="text-gray-600">یکی از روش‌های زیر را انتخاب کنید</p>
          </div>

          {/* Mode Selector - Minimal */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-full max-w-md mx-auto">
            <button
                onClick={() => setMode('select')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === 'select'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>انتخاب از لیست</span>
            </button>

            <button
                onClick={() => setMode('text')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mode === 'text'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
            >
              <FileText className="w-5 h-5" />
              <span>توضیح آزاد</span>
            </button>
          </div>

          {/* Select Mode */}
          {mode === 'select' && (
              <>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                      placeholder="جستجوی علائم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 h-12 text-right"
                  />
                </div>

                {/* Selected Count */}
                {selectedSymptoms.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-sm text-blue-900 text-right">
                        {selectedSymptoms.length} علامت انتخاب شده
                      </p>
                    </div>
                )}

                {/* Symptoms List */}
                <div className="space-y-3">
                  {filteredSymptoms.map((symptom) => (
                      <Card
                          key={symptom.id}
                          onClick={() => toggleSymptom(symptom.id)}
                          className={`p-4 cursor-pointer border-2 transition-all shadow-md hover:shadow-lg ${
                              // @ts-ignore
                              selectedSymptoms.includes(symptom.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-transparent'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <Checkbox
                                // @ts-ignore
                                checked={selectedSymptoms.includes(symptom.id)}
                                className="ml-3"
                            />
                            <div className="text-right">
                              <p className="text-gray-900">{symptom.label}</p>
                              <p className="text-xs text-gray-500">{symptom.category}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                  ))}
                </div>
              </>
          )}

          {/* Text Mode */}
          {mode === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    علائم خود را شرح دهید *
                  </label>
                  <textarea
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      rows={5}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      placeholder="مثال: از دیروز سردرد شدید دارم و تب کرده‌ام..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      سن
                    </label>
                    <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="text-right"
                        placeholder="مثال: 30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      جنسیت
                    </label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                        className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    >
                      <option value="">انتخاب کنید</option>
                      <option value="male">مرد</option>
                      <option value="female">زن</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    سابقه پزشکی (اختیاری)
                  </label>
                  <textarea
                      value={medicalHistory}
                      onChange={(e) => setMedicalHistory(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                      placeholder="بیماری‌های قبلی، داروهای مصرفی و..."
                  />
                </div>

                {error && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-right">
                      {error}
                    </div>
                )}
              </div>
          )}
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pointer-events-none flex justify-center">
          {mode === 'select' ? (
              <Button
                  onClick={handleContinueWithSelection}
                  disabled={selectedSymptoms.length === 0}
                  className="w-[300px] h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg pointer-events-auto"
              >
                ادامه به سوالات
                <ArrowRight className="mr-2 w-5 h-5" />
              </Button>
          ) : (
              <Button
                  onClick={handleSubmitFreeText}
                  disabled={!freeText.trim()}
                  className="w-[300px] h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg pointer-events-auto"
              >
                دریافت تشخیص
                <ArrowRight className="mr-2 w-5 h-5" />
              </Button>
          )}
        </div>
      </div>
  );
}
