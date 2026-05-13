import { useNavigate } from 'react-router';
import { 
  Brain, 
  AlertCircle, 
  CheckCircle, 
  Activity, 
  ArrowRight, 
  Home,
  Clock,
  TrendingUp,
  Shield,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  Pill,
  Heart,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AppBar } from '../components/AppBar';

export function AIResults() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24">
      <AppBar title="AI Results" />

      <div className="px-6 pt-24 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl mb-2 text-gray-900">AI Analysis Complete</h1>
          <p className="text-gray-600">Based on your symptoms and responses</p>
        </div>

        {/* Analysis Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card className="p-3 shadow-lg border-0 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 font-bold">Analyzed</p>
            <p className="text-sm text-gray-900">8 Symptoms</p>
          </Card>
          
          <Card className="p-3 shadow-lg border-0 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600 font-bold">Duration</p>
            <p className="text-sm text-gray-900">3-5 Days</p>
          </Card>
          
          <Card className="p-3 shadow-lg border-0 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 font-bold">Match</p>
            <p className="text-sm text-gray-900">85%</p>
          </Card>
        </div>

        {/* Diagnosis Card */}
        <Card className="p-6 shadow-xl border-0 mb-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-start mb-4">
            <Activity className="w-6 h-6 mr-3 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg mb-1 font-bold">Possible Condition</h2>
              <h3 className="text-2xl mb-3">Upper Respiratory Infection</h3>
              <p className="text-sm text-blue-100">
                Commonly known as the common cold, affecting the nose, throat, and airways
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className="bg-white/20 text-white border-white/30 rounded-full">
              85% Confidence
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 rounded-full">
              Moderate Severity
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 rounded-full">
              Self-limiting
            </Badge>
          </div>
        </Card>

        {/* Key Symptoms Identified */}
        <Card className="p-4 shadow-lg border-0 mb-4">
          <h3 className="text-base text-gray-900 mb-3 flex items-center font-bold">
            <Info className="w-4 h-4 mr-2 text-blue-500" />
            Key Symptoms Identified
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center p-2 bg-red-50 rounded-lg">
              <Thermometer className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-gray-900">Fever</span>
            </div>
            <div className="flex items-center p-2 bg-blue-50 rounded-lg">
              <Droplets className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm text-gray-900">Runny Nose</span>
            </div>
            <div className="flex items-center p-2 bg-orange-50 rounded-lg">
              <Wind className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-sm text-gray-900">Cough</span>
            </div>
            <div className="flex items-center p-2 bg-purple-50 rounded-lg">
              <Activity className="w-4 h-4 text-purple-500 mr-2" />
              <span className="text-sm text-gray-900">Fatigue</span>
            </div>
          </div>
        </Card>

        {/* Severity & Timeline */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4 shadow-lg border-0">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600">Severity Level</p>
            <p className="text-lg text-gray-900">Moderate</p>
          </Card>
          
          <Card className="p-4 shadow-lg border-0">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600">Recovery Time</p>
            <p className="text-lg text-gray-900">7-10 Days</p>
          </Card>
        </div>

        {/* What to Expect */}
        <Card className="p-4 shadow-lg border-0 mb-4 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="text-base text-gray-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
            What to Expect
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
              <p className="text-gray-700">Symptoms typically peak within 2-3 days</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
              <p className="text-gray-700">Gradual improvement expected after day 5</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
              <p className="text-gray-700">Full recovery within 7-10 days for most people</p>
            </div>
          </div>
        </Card>

        {/* Recommendations */}
        <div className="mb-4">
          <h2 className="text-xl text-gray-900 mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Treatment Recommendations
          </h2>

          <Card className="p-4 shadow-lg border-0 mb-2">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Rest & Hydration</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Get 7-9 hours of sleep and drink at least 8 glasses of water daily
                </p>
                <Badge className="bg-green-50 text-green-700 border-green-200 text-xs rounded-full">
                  Essential
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-lg border-0 mb-2">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Pill className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Over-the-Counter Medication</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Pain relievers (acetaminophen 500mg every 6 hours) or ibuprofen for fever and aches
                </p>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs rounded-full">
                  As needed
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-lg border-0 mb-2">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Droplets className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Steam Inhalation</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Breathe warm steam 2-3 times daily to relieve nasal congestion
                </p>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs rounded-full">
                  Recommended
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-lg border-0 mb-2">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Monitor Symptoms</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Track temperature and symptoms. Seek immediate care if fever exceeds 103°F or breathing difficulties occur
                </p>
                <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs rounded-full">
                  Important
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* When to See a Doctor */}
        <Card className="p-4 bg-red-50 border-red-200 mb-4">
          <h3 className="text-base text-red-900 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
            Seek Immediate Medical Care If:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <p className="text-red-900">High fever (above 103°F/39.4°C) lasting more than 3 days</p>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <p className="text-red-900">Difficulty breathing or chest pain</p>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <p className="text-red-900">Symptoms worsen after initial improvement</p>
            </div>
            <div className="flex items-start">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
              <p className="text-red-900">Severe headache or confusion</p>
            </div>
          </div>
        </Card>

        {/* Warning */}
        <Card className="p-4 bg-orange-50 border-orange-200 mb-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-orange-900">
              This is an AI-generated analysis and should not replace professional medical advice. 
              Please consult a healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/doctors')}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white text-lg shadow-lg"
          >
            Find a Doctor
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/home')}
            className="w-full h-12 text-lg"
          >
            <Home className="mr-2 w-5 h-5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}