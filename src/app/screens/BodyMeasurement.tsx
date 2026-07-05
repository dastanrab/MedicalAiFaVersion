import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowRight, Ruler, Info } from 'lucide-react';
import { AppBar } from '../components/AppBar';

export function BodyMeasurement() {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState({
    neck: '',
    waist: '',
    arm: '',
    thigh: '',
    chest: '',
  });

  const updateMeasurement = (field: string, value: string) => {
    setMeasurements({ ...measurements, [field]: value });
  };

  const handleNext = () => {
    // Navigate to next step (to be implemented)
    navigate('/meal-plan');
  };

  const allFieldsFilled = Object.values(measurements).every(value => value.trim() !== '');

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-white overflow-y-auto pb-24">
      <AppBar backTo="/home" />

      <div className="px-6 pt-24 py-8 pb-8">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]">
            <Ruler className="w-10 h-10 text-white" />
          </div>
          <h2 className="mt-4 font-['Inter:SemiBold',sans-serif] font-semibold text-[22px] text-gray-900">Full Body Measurement</h2>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-100 border border-blue-300 rounded-[14px] p-4 mb-6 flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            The more accurate the information, the more accurate the indicators will be calculated.
          </p>
        </div>

        {/* Profile Info Summary */}
        <div className="bg-white rounded-[14px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] p-5 mb-6">
          <h3 className="font-['Inter:Medium',sans-serif] font-medium text-[#364153] text-[15px] mb-4">Your Profile Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-[#717182] text-[12px] mb-1">Weight</p>
              <p className="font-['Inter:SemiBold',sans-serif] font-semibold text-gray-900 text-[18px]">70 <span className="text-[14px] text-gray-600">kg</span></p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-[#717182] text-[12px] mb-1">Height</p>
              <p className="font-['Inter:SemiBold',sans-serif] font-semibold text-gray-900 text-[18px]">175 <span className="text-[14px] text-gray-600">cm</span></p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-[#717182] text-[12px] mb-1">Age</p>
              <p className="font-['Inter:SemiBold',sans-serif] font-semibold text-gray-900 text-[18px]">28 <span className="text-[14px] text-gray-600">yrs</span></p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[14px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] p-6 space-y-5">
          {/* Neck Circumference */}
          <div>
            <label className="block font-['Inter:Medium',sans-serif] font-medium leading-[20px] text-[#364153] text-[14px] tracking-[-0.1504px] mb-2">
              Neck Circumference (cm)
            </label>
            <input
              type="number"
              placeholder="35"
              value={measurements.neck}
              onChange={(e) => updateMeasurement('neck', e.target.value)}
              className="bg-[#f3f3f5] w-full h-[44px] rounded-[8px] px-3 font-['Inter:Regular',sans-serif] font-normal text-[#717182] text-[14px] tracking-[-0.1504px] border-none outline-none"
            />
          </div>

          {/* Waist Circumference */}
          <div>
            <label className="block font-['Inter:Medium',sans-serif] font-medium leading-[20px] text-[#364153] text-[14px] tracking-[-0.1504px] mb-2">
              Waist Circumference (cm)
            </label>
            <input
              type="number"
              placeholder="80"
              value={measurements.waist}
              onChange={(e) => updateMeasurement('waist', e.target.value)}
              className="bg-[#f3f3f5] w-full h-[44px] rounded-[8px] px-3 font-['Inter:Regular',sans-serif] font-normal text-[#717182] text-[14px] tracking-[-0.1504px] border-none outline-none"
            />
          </div>

          {/* Arm Circumference */}
          <div>
            <label className="block font-['Inter:Medium',sans-serif] font-medium leading-[20px] text-[#364153] text-[14px] tracking-[-0.1504px] mb-2">
              Arm Circumference (cm)
            </label>
            <input
              type="number"
              placeholder="30"
              value={measurements.arm}
              onChange={(e) => updateMeasurement('arm', e.target.value)}
              className="bg-[#f3f3f5] w-full h-[44px] rounded-[8px] px-3 font-['Inter:Regular',sans-serif] font-normal text-[#717182] text-[14px] tracking-[-0.1504px] border-none outline-none"
            />
          </div>

          {/* Thigh Circumference */}
          <div>
            <label className="block font-['Inter:Medium',sans-serif] font-medium leading-[20px] text-[#364153] text-[14px] tracking-[-0.1504px] mb-2">
              Thigh Circumference (cm)
            </label>
            <input
              type="number"
              placeholder="55"
              value={measurements.thigh}
              onChange={(e) => updateMeasurement('thigh', e.target.value)}
              className="bg-[#f3f3f5] w-full h-[44px] rounded-[8px] px-3 font-['Inter:Regular',sans-serif] font-normal text-[#717182] text-[14px] tracking-[-0.1504px] border-none outline-none"
            />
          </div>

          {/* Chest Circumference */}
          <div>
            <label className="block font-['Inter:Medium',sans-serif] font-medium leading-[20px] text-[#364153] text-[14px] tracking-[-0.1504px] mb-2">
              Chest Circumference (cm)
            </label>
            <input
              type="number"
              placeholder="95"
              value={measurements.chest}
              onChange={(e) => updateMeasurement('chest', e.target.value)}
              className="bg-[#f3f3f5] w-full h-[44px] rounded-[8px] px-3 font-['Inter:Regular',sans-serif] font-normal text-[#717182] text-[14px] tracking-[-0.1504px] border-none outline-none"
            />
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!allFieldsFilled}
          className={`w-full h-[48px] rounded-[8px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] mt-6 font-['Inter:Medium',sans-serif] font-medium text-[18px] tracking-[-0.4395px] transition-colors flex items-center justify-center ${
            allFieldsFilled
              ? 'bg-[#f97316] hover:bg-[#ea580c] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
          <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
}