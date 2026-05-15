import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Textarea } from '../components/ui/textarea';
import { AppBar } from '../components/AppBar';

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
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [medicationDetails, setMedicationDetails] = useState('');

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
    // Clear medication details if user changes answer to "No"
    if (currentQuestion.id === 3 && answer === 'خیر') {
      setMedicationDetails('');
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/results');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  // Check if user can proceed
  const canProceed = (() => {
    if (!answers[currentQuestion.id]) return false;
    // If it's the medication question and answer is "Yes", require medication details
    if (currentQuestion.id === 3 && answers[currentQuestion.id] === 'بله') {
      return medicationDetails.trim().length > 0;
    }
    return true;
  })();

  // Check if we should show the medication details field
  const showMedicationDetails = currentQuestion.id === 3 && answers[3] === 'بله';

  return (
      <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24" dir="rtl">
        <AppBar />

        <div className="px-6 pt-24 py-8">
          {/* Progress */}
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

          {/* Question Card */}
          <Card className="p-6 shadow-xl border-0 mb-6">
            <h1 className="text-2xl mb-6 text-gray-900">{currentQuestion.question}</h1>

            {currentQuestion.type === 'radio' ? (
                <RadioGroup
                    value={answers[currentQuestion.id]}
                    onValueChange={handleAnswer}
                    className="space-y-3"
                >
                  {currentQuestion.options.map((option) => (
                      <div
                          key={option}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[currentQuestion.id] === option
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleAnswer(option)}
                      >
                        <div className="flex items-center">
                          <RadioGroupItem value={option} id={option} className="ml-3" />
                          <Label htmlFor={option} className="cursor-pointer flex-1">
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
                    className="min-h-32"
                />
            )}

            {/* Medication Details Field */}
            {showMedicationDetails && (
                <Textarea
                    placeholder="لطفا جزئیات داروهایی که مصرف می‌کنید را وارد کنید..."
                    value={medicationDetails}
                    onChange={(e) => setMedicationDetails(e.target.value)}
                    className="min-h-32 mt-4"
                />
            )}
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-12 text-lg"
                >
                  قبلی
                </Button>
            )}
            <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg"
            >
              {currentStep === questions.length - 1 ? 'دریافت نتایج' : 'بعدی'}
              <ArrowRight className="mr-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
  );
}
