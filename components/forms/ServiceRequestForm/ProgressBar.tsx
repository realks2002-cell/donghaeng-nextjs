'use client'

import { Step } from './types'

interface ProgressBarProps {
  currentStep: Step
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const totalSteps = 6

  // 스텝을 6단계 진행바로 매핑
  const getProgressStep = (step: Step): number => {
    if (step === 1) return 1
    if (step === 1.5) return 1
    if (step === 2) return 2
    if (step === 3) return 3
    if (step === 3.5) return 3
    if (step === 4) return 4
    if (step === 5) return 6
    return 1
  }

  const progressStep = getProgressStep(currentStep)

  return (
    <div className="mt-6">
      <div className="flex gap-1" role="progressbar" aria-valuenow={progressStep} aria-valuemin={1} aria-valuemax={6} aria-label="진행 단계">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              step <= progressStep ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-sm font-medium text-gray-500">
        <span>{currentStep}</span> / 5
      </p>
    </div>
  )
}
