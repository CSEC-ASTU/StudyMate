'use client'

import { useState } from 'react'
import { AcademicInfo } from '@/components/pages/academics/AcademicInfo'
import { UniversityProfile } from '@/components/pages/academics/UniversityProfile'
import { SemesterCreation } from '@/components/pages/academics/SemesterCreation'

interface OnboardingData {
  educationLevel: string
  institutionName: string
  university: string
  department: string
  program: string
  yearSemester: string
  semesterName: string
  startDate: string
  endDate: string
}

export default function AcademicOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})

  const handleAcademicInfoNext = (data: {
    educationLevel: string
    institutionName: string
  }) => {
    setOnboardingData((prev) => ({
      ...prev,
      educationLevel: data.educationLevel,
      institutionName: data.institutionName,
    }))
    if (data.educationLevel === 'undergraduate' || data.educationLevel === 'graduate') {
      setCurrentStep(2)
    } else {
      setCurrentStep(3)
    }
  }

  const handleUniversityProfileNext = (data: {
    university: string
    department: string
    program: string
    yearSemester: string
  }) => {
    setOnboardingData((prev) => ({
      ...prev,
      university: data.university,
      department: data.department,
      program: data.program,
      yearSemester: data.yearSemester,
    }))
    setCurrentStep(3)
  }

  const handleSemesterComplete = (data: {
    semesterName: string
    startDate: string
    endDate: string
  }) => {
    setOnboardingData((prev) => ({
      ...prev,
      semesterName: data.semesterName,
      startDate: data.startDate,
      endDate: data.endDate,
    }))
    
    console.log('[v0] Onboarding complete:', { ...onboardingData, ...data })
    window.location.href = '/courses/add'
  }

  return (
    <>
      {currentStep === 1 && <AcademicInfo onNext={handleAcademicInfoNext} />}
      {currentStep === 2 && <UniversityProfile onNext={handleUniversityProfileNext} />}
      {currentStep === 3 && <SemesterCreation onComplete={handleSemesterComplete} />}
    </>
  )
}
