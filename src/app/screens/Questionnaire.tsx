// src/pages/Questionnaire.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowRight, Star, AlertCircle, Activity, Dumbbell, Heart, FileText } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AppBar } from '../components/AppBar';

interface Question {
  id: string;
  question: string;
  type: 'select' | 'radio' | 'number' | 'text' | 'multiselect';
  options: string[] | null;
  required: boolean;
  placeholder: string | null;
}

interface Form {
  specialty: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Doctor {
  id: number;
  name: string;
  image_url: string;
  rating: number;
  visit_price: number;
  experience: string;
  is_vip: boolean;
}

interface Lab {
  id: number;
  name: string;
  image_url: string;
  rating: number;
  address?: string;
}

interface DiagnosisResponse {
  specialty: {
    primary: string;
    secondary?: string[];
    recommended_specialist: string;
    specialty_id: number;
    specialty_name_fa: string;
  };
  urgency_level: string;
  diagnosis: string[];
  diagnosis_description?: string;
  red_flags: string[];
  recommended_tests: string[];
  recommended_exercises: string[];
  lifestyle_changes: string[];
  notes: string;
  recommended_doctors: Doctor[];
  recommended_labs: Lab[];
  form: Form;
  user_symptoms: string;
  medical_history?: string;
}

export function Questionnaire() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showFullResult, setShowFullResult] = useState(false);

  const form: Form | undefined = location.state?.form;
  const previousResult: DiagnosisResponse | undefined = location.state?.previousResult;
  const age = location.state?.age || 30;
  const gender = location.state?.gender || 'male';

  useEffect(() => {
    if (!form) {
      navigate('/home');
    }
  }, [form, navigate]);

  const handleChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (fieldErrors[questionId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleMultiSelectChange = (questionId: string, option: string) => {
    const currentValues = answers[questionId] ? answers[questionId].split(',') : [];
    // @ts-ignore
    const newValues = currentValues.includes(option)
        ? currentValues.filter(v => v !== option)
        : [...currentValues, option];

    setAnswers(prev => ({ ...prev, [questionId]: newValues.join(',') }));
    if (fieldErrors[questionId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    form?.questions.forEach(question => {
      if (question.required) {
        const value = answers[question.id];
        if (!value || !value.trim()) {
          newErrors[question.id] = 'این فیلد الزامی است';
        }
      }
    });
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  };

  const handleSkip = () => {
    if (previousResult) {
      setShowFullResult(true);
    } else {
      navigate('/home');
    }
  };

  const renderField = (question: Question) => {
    const value = answers[question.id] || '';
    const error = fieldErrors[question.id];

    switch (question.type) {
      case 'text':
        return (
            <div key={question.id} className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-right">
                {question.question}
                {question.required && <span className="text-red-500 mr-1">*</span>}
              </label>
              <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || ''}
                  className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
            </div>
        );

      case 'number':
        return (
            <div key={question.id} className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-right">
                {question.question}
                {question.required && <span className="text-red-500 mr-1">*</span>}
              </label>
              <input
                  type="number"
                  value={value}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || ''}
                  className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
            </div>
        );

      case 'select':
        return (
            <div key={question.id} className="mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-right">
                {question.question}
                {question.required && <span className="text-red-500 mr-1">*</span>}
              </label>
              <select
                  value={value}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-right focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      error ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">انتخاب کنید</option>
                {question.options?.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                ))}
              </select>
              {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
            </div>
        );

      case 'radio':
        return (
            <div key={question.id} className="mb-6">
              <label className="block text-gray-700 font-medium mb-3 text-right">
                {question.question}
                {question.required && <span className="text-red-500 mr-1">*</span>}
              </label>
              <div className="space-y-2">
                {question.options?.map(option => (
                    <label key={option} className="flex items-center justify-end cursor-pointer">
                      <span className="text-gray-700 mr-3">{option}</span>
                      <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={value === option}
                          onChange={(e) => handleChange(question.id, e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                ))}
              </div>
              {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
            </div>
        );

      case 'multiselect':
        const selectedValues = value ? value.split(',') : [];
        return (
            <div key={question.id} className="mb-6">
              <label className="block text-gray-700 font-medium mb-3 text-right">
                {question.question}
                {question.required && <span className="text-red-500 mr-1">*</span>}
              </label>
              <div className="space-y-2">
                {question.options?.map(option => (
                    <label key={option} className="flex items-center justify-end cursor-pointer">
                      <span className="text-gray-700 mr-3">{option}</span>
                      <input
                          type="checkbox"
                          value={option}
                          // @ts-ignore
                          checked={selectedValues.includes(option)}
                          onChange={() => handleMultiSelectChange(question.id, option)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                ))}
              </div>
              {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
            </div>
        );

      default:
        return null;
    }
  };

  if (!form) {
    return null;
  }

  if (showFullResult && previousResult) {
    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto relative" dir="rtl">
          <AppBar />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-24">
            <Card className="p-4 sm:p-6 mb-4 border-r-4 border-blue-500">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">علائم شما</h2>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{previousResult.user_symptoms}</p>
              {previousResult.medical_history && (
                  <>
                    <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-2">سابقه پزشکی</h3>
                    <p className="text-gray-600 text-sm">{previousResult.medical_history}</p>
                  </>
              )}
            </Card>

            {previousResult.specialty && (
                <Card className="p-4 sm:p-6 mb-4 border-r-4 border-purple-500">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">تخصص پیشنهادی</h2>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">تخصص اصلی:</span> {previousResult.specialty.specialty_name_fa}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">متخصص پیشنهادی:</span> {previousResult.specialty.recommended_specialist}
                    </p>
                    {previousResult.specialty.secondary && previousResult.specialty.secondary.length > 0 && (
                        <p className="text-gray-600 text-sm">
                          <span className="font-semibold">تخصص‌های ثانویه:</span> {previousResult.specialty.secondary.join('، ')}
                        </p>
                    )}
                  </div>
                </Card>
            )}

            {previousResult.urgency_level && (
                <Card className={`p-4 sm:p-6 mb-4 border-r-4 ${
                    previousResult.urgency_level === 'high' ? 'border-red-500' :
                        previousResult.urgency_level === 'medium' ? 'border-yellow-500' : 'border-green-500'
                }`}>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">سطح فوریت</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      previousResult.urgency_level === 'high' ? 'bg-red-100 text-red-700' :
                          previousResult.urgency_level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                                {previousResult.urgency_level === 'high' ? 'فوری' :
                                    previousResult.urgency_level === 'medium' ? 'متوسط' : 'عادی'}
                            </span>
                </Card>
            )}

            {previousResult.diagnosis && previousResult.diagnosis.length > 0 && (
                <Card className="p-4 sm:p-6 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">تشخیص‌های احتمالی</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {previousResult.diagnosis.map((diag, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                        {diag}
                                    </span>
                    ))}
                  </div>
                  {previousResult.diagnosis_description && (
                      <p className="text-gray-700 text-sm leading-relaxed mt-3">
                        {previousResult.diagnosis_description}
                      </p>
                  )}
                </Card>
            )}

            {previousResult.red_flags && previousResult.red_flags.length > 0 && (
                <Card className="p-4 sm:p-6 mb-4 bg-red-50 border-r-4 border-red-500">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-red-900">علائم خطر</h2>
                  </div>
                  <ul className="space-y-2">
                    {previousResult.red_flags.map((flag, index) => (
                        <li key={index} className="text-red-700 text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{flag}</span>
                        </li>
                    ))}
                  </ul>
                </Card>
            )}

            {previousResult.recommended_tests && previousResult.recommended_tests.length > 0 && (
                <Card className="p-4 sm:p-6 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">آزمایش‌های پیشنهادی</h2>
                  </div>
                  <ul className="space-y-2">
                    {previousResult.recommended_tests.map((test, index) => (
                        <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{test}</span>
                        </li>
                    ))}
                  </ul>
                </Card>
            )}

            {previousResult.recommended_exercises && previousResult.recommended_exercises.length > 0 && (
                <Card className="p-4 sm:p-6 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">ورزش‌های توصیه شده</h2>
                  </div>
                  <ul className="space-y-2">
                    {previousResult.recommended_exercises.map((exercise, index) => (
                        <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{exercise}</span>
                        </li>
                    ))}
                  </ul>
                </Card>
            )}

            {previousResult.lifestyle_changes && previousResult.lifestyle_changes.length > 0 && (
                <Card className="p-4 sm:p-6 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">تغییرات سبک زندگی</h2>
                  </div>
                  <ul className="space-y-2">
                    {previousResult.lifestyle_changes.map((change, index) => (
                        <li key={index} className="text-gray-700 text-sm flex items-start gap-2">
                          <span className="text-pink-500 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                    ))}
                  </ul>
                </Card>
            )}

            {previousResult.notes && (
                <Card className="p-4 sm:p-6 mb-4 bg-yellow-50 border-r-4 border-yellow-500">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-yellow-600" />
                    <h2 className="text-lg sm:text-xl font-bold text-yellow-900">یادداشت</h2>
                  </div>
                  <p className="text-yellow-800 text-sm leading-relaxed">{previousResult.notes}</p>
                </Card>
            )}

            {previousResult.recommended_doctors && previousResult.recommended_doctors.length > 0 && (
                <Card className="p-4 sm:p-6 mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">پزشکان پیشنهادی</h2>
                  <div className="flex flex-wrap justify-center gap-6">
                    {previousResult.recommended_doctors.map((doctor) => (
                        <div key={doctor.id} className="flex flex-col items-center text-center w-24">
                          <div className="relative mb-2">
                            <img
                                src={doctor.image_url}
                                alt={doctor.name}
                                className="w-20 h-20 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/80';
                                }}
                            />
                            <div className="absolute -bottom-1 -left-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 border border-gray-100">
                              <span className="text-xs font-medium text-gray-700">{doctor.rating}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-xs leading-tight mb-1">
                            {doctor.name}
                          </h3>
                        </div>
                    ))}
                  </div>
                </Card>
            )}
          </div>
        </div>
    );
  }

  return (
      <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto relative" dir="rtl">
        <AppBar />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-32">
          <Card className="p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-right">{form.title}</h1>
            <p className="text-gray-600 text-sm text-right">{form.description}</p>
          </Card>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 mb-6">
              {form.questions.map((question) => renderField(question))}
            </Card>

            {error && (
                <div className="mb-4 text-red-600 text-sm text-right">
                  {error}
                </div>
            )}

            <div  className="fixed bottom-25 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-center">
              <div className="max-w-2xl mx-auto flex gap-3">
                <Button
                    type="button"
                    onClick={handleSkip}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium"
                >
                  رد کردن
                </Button>

                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  {loading ? 'در حال ارسال...' : 'ارسال پاسخ‌ها'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
};

