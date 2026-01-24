'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in (has token)
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleAcademicInfoNext = async (data: {
    educationLevel: string
    institutionName: string
  }) => {
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        router.push('/login')
        return
      }

      // Send to backend API - Step 1
      const response = await fetch('https://studymate-api-vl93.onrender.com/api/profile/onboarding/step1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          educationLevel: data.educationLevel,
          institutionName: data.institutionName,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to save')
      }

      // Update local state
      setOnboardingData(prev => ({
        ...prev,
        educationLevel: data.educationLevel,
        institutionName: data.institutionName,
      }))

      // Update user data if returned
      if (responseData.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user))
      }

      // Determine next step
      if (data.educationLevel === 'undergraduate' || data.educationLevel === 'graduate') {
        setCurrentStep(2) // Go to UniversityProfile for college
      } else {
        setCurrentStep(3) // Skip to SemesterCreation for high school
      }

    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUniversityProfileNext = async (data: {
    university: string
    department: string
    program: string
    yearSemester: string
  }) => {
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        router.push('/login')
        return
      }

      // Send to backend API - Step 2
      const response = await fetch('https://studymate-api-vl93.onrender.com/api/profile/onboarding/step2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          university: data.university,
          department: data.department,
          program: data.program,
          yearSemester: data.yearSemester,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to save')
      }

      // Update local state
      setOnboardingData(prev => ({
        ...prev,
        university: data.university,
        department: data.department,
        program: data.program,
        yearSemester: data.yearSemester,
      }))

      // Update user data if returned
      if (responseData.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user))
      }

      // Move to next step
      setCurrentStep(3)

    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSemesterComplete = (data: {
    semesterName: string
    startDate: string
    endDate: string
  }) => {
    // Complete the onboarding locally
    const finalData = {
      ...onboardingData,
      semesterName: data.semesterName,
      startDate: data.startDate,
      endDate: data.endDate,
    }
    
    setOnboardingData(finalData)
    
    console.log('Onboarding complete:', finalData)
    
    // Mark as complete in localStorage
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      const updatedUser = { 
        ...userData, 
        onboardingComplete: true,
        onboardingStep: 2 
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    
    // Redirect to courses page
    window.location.href = '/courses/add'
  }

  // Show loading overlay
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Saving your information...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentStep === 1 && <AcademicInfo onNext={handleAcademicInfoNext} />}
      {currentStep === 2 && <UniversityProfile onNext={handleUniversityProfileNext} />}
      {currentStep === 3 && <SemesterCreation onComplete={handleSemesterComplete} />}
    </>
  )
}