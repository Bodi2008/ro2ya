import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between relative">
      <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
      <div 
        className="absolute right-0 top-1/2 h-1 bg-blue-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-300"
        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
      ></div>
      
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        
        return (
          <div 
            key={stepNum} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
              isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 
              isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
          </div>
        );
      })}
    </div>
  );
}
