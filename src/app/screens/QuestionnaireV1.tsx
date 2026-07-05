import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { SymptomFormState } from './SymptomSelection';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Textarea } from '../components/ui/textarea';
import { AppBar } from '../components/AppBar';

const symptoms = [
  { id: 'headache', label: 'سردرد' },
  { id: 'fever', label: 'تب' },
  { id: 'cough', label: 'سرفه' },
  { id: 'sore-throat', label: 'گلودرد' },
  { id: 'fatigue', label: 'خستگی' },
  { id: 'nausea', label: 'حالت تهوع' },
  { id: 'dizziness', label: 'سرگیجه' },
  { id: 'body-ache', label: 'درد بدن' },
  { id: 'runny-nose', label: 'آبریزش بینی' },
  { id: 'chest-pain', label: 'درد قفسه سینه' },
  { id: 'shortness-breath', label: 'تنگی نفس' },
  { id: 'stomach-pain', label: 'درد شکم' },
];

const questions = [
  {
    id: 1,
    question: 'علائم شما از چه زمانی شروع شده است؟',
    type: 'radio',
    options: ['امروز', 'دیروز', '۲-۳ روز پیش', 'بیشتر از ۳ روز پیش'],
  },
  {
    id: 2,
    question: 'شدت درد/ناراحتی شما چقدر است؟',
    type: 'radio',
    options: ['خفیف', 'متوسط', 'شدید', 'بسیار شدید'],
  },
  {
    id: 3,
    question: 'آیا از دارو استفاده می‌کنید؟',
    type: 'radio',
    options: ['بله', 'خیر'],
    hasFollowUp: true,
  },
  {
    id: 4,
    question: 'سیگار',
    type: 'radio',
    options: ['بله', 'خیر'],
  },
  {
    id: 5,
    question: 'مصرف الکل',
    type: 'radio',
    options: ['بله', 'خیر'],
  },
  {
    id: 6,
    question: 'آیا بیماری مزمنی دارید؟',
    type: 'radio',
    options: ['دیابت', 'فشار خون بالا', 'آسم', 'هیچکدام'],
  },
  {
    id: 7,
    question: 'اطلاعات تکمیلی',
    type: 'text',
    options: [],
  },
];

export function QuestionnaireV1() {
  const navigate = useNavigate();
  const location = useLocation();
  const symptomFormState = (location.state as { symptomFormState?: SymptomFormState } | null)
      ?.symptomFormState;
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [medicationDetails, setMedicationDetails] = useState('');

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
    if (currentQuestion.id === 3 && answer === 'خیر') {
      setMedicationDetails('');
    }
  };

  const buildFormattedText = (): string => {
    const parts: string[] = [];

    // علائم انتخاب شده از صفحه قبل
    if (symptomFormState?.selectedSymptoms && symptomFormState.selectedSymptoms.length > 0) {
      const symptomLabels = symptomFormState.selectedSymptoms
          .map(id => symptoms.find(s => s.id === id)?.label)
          .filter(Boolean)
          .join('، ');
      parts.push(`علائم: ${symptomLabels}`);
    }

    // سوال 1: زمان شروع علائم
    if (answers[1]) {
      parts.push(`زمان شروع علائم: ${answers[1]}`);
    }

    // سوال 2: شدت درد
    if (answers[2]) {
      parts.push(`شدت درد/ناراحتی: ${answers[2]}`);
    }

    // سوال 3: مصرف دارو
    if (answers[3]) {
      if (answers[3] === 'بله' && medicationDetails) {
        parts.push(`مصرف دارو: بله - ${medicationDetails}`);
      } else {
        parts.push(`مصرف دارو: ${answers[3]}`);
      }
    }

    // سوال 4: سیگار
    if (answers[4]) {
      parts.push(`سیگار: ${answers[4]}`);
    }

    // سوال 5: مصرف الکل
    if (answers[5]) {
      parts.push(`مصرف الکل: ${answers[5]}`);
    }

    // سوال 6: بیماری مزمن
    if (answers[6]) {
      parts.push(`بیماری مزمن: ${answers[6]}`);
    }

    // سوال 7: اطلاعات تکمیلی
    if (answers[7]) {
      parts.push(`اطلاعات تکمیلی: ${answers[7]}`);
    }

    return parts.join('. ');
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // ساخت متن فرمت‌بندی شده
      const formattedSymptoms = buildFormattedText();

      const payload: Record<string, unknown> = {
        symptoms: formattedSymptoms
      };

      // اضافه کردن اطلاعات تکمیلی
      if (symptomFormState?.age) payload.age = Number(symptomFormState.age);
      if (symptomFormState?.gender) payload.gender = symptomFormState.gender;
      if (symptomFormState?.medicalHistory) payload.medical_history = symptomFormState.medicalHistory;

      navigate('/diagnosis-result', {
        state: {
          requestPayload: payload,
          isLoading: true,
          symptomFormState: symptomFormState,
        },
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (symptomFormState) {
      navigate('/symptoms', { state: symptomFormState });
    } else {
      navigate('/symptoms');
    }
  };

  const canProceed = (() => {
    if (!answers[currentQuestion.id]) return false;
    if (currentQuestion.id === 3 && answers[currentQuestion.id] === 'بله') {
      return medicationDetails.trim().length > 0;
    }
    return true;
  })();

  const showMedicationDetails = currentQuestion.id === 3 && answers[3] === 'بله';

  return (
      <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24" dir="rtl">
        <AppBar backTo="/symptoms" backState={symptomFormState} />

        <div className="px-6 pt-24 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-gray-600">
                سوال {currentStep + 1} از {questions.length}
              </h2>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 ml-1" />
                ~۲ دقیقه
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="mb-6 border-0 p-6 text-right shadow-xl" dir="rtl">
            <h1 className="mb-6 text-2xl text-right text-gray-900">{currentQuestion.question}</h1>

            {currentQuestion.type === 'radio' ? (
                <RadioGroup
                    value={answers[currentQuestion.id]}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                    dir="rtl"
                >
                  {currentQuestion.options.map((option) => (
                      <div
                          key={option}
                          className={`cursor-pointer rounded-lg border-2 p-4 text-right transition-all ${
                              answers[currentQuestion.id] === option
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleAnswer(option)}
                      >
                        <div className="flex items-center justify-start gap-3">
                          <RadioGroupItem value={option} id={option} className="shrink-0" />
                          <Label htmlFor={option} className="flex-1 cursor-pointer text-right">
                            {option}
                          </Label>
                        </div>
                      </div>
                  ))}
                </RadioGroup>
            ) : (
                <Textarea
                    placeholder="لطفا جزئیات بیشتری را وارد کنید..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    className="min-h-32 text-right"
                    dir="rtl"
                />
            )}

            {showMedicationDetails && (
                <Textarea
                    placeholder="لطفا جزئیات داروهایی که مصرف می‌کنید را وارد کنید..."
                    value={medicationDetails}
                    onChange={(e) => setMedicationDetails(e.target.value)}
                    className="mt-4 min-h-32 text-right"
                    dir="rtl"
                />
            )}
          </Card>

          <div className="flex gap-3">
            <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-12 text-lg"
            >
              {currentStep > 0 ? 'قبلی' : 'بازگشت به علائم'}
            </Button>
            <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg"
            >
              {currentStep === questions.length - 1 ? 'دریافت نتایج' : 'بعدی'}
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
  );
}
