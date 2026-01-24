'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { AcademicInfo } from './AcademicInfo'
import { UniversityProfile } from './UniversityProfile'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, CheckCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    checkAuthAndOnboardingStatus()
  }, [])

  const checkAuthAndOnboardingStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      const storedUserId = localStorage.getItem('userId')
      
      if (!token || !storedUserId) {
        window.location.href = '/login'
        return
      }
      
      setUserId(storedUserId) 
      const response = await fetch(`${API_BASE_URL}/profile/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setOnboardingStep(data.onboardingStep || 0)
        
        if (data.onboardingStep === 2) {
          window.location.href = '/dashboard'
        } else if (data.onboardingStep === 1) {
          setCurrentStep(2)
        }
      } else {
        throw new Error('Failed to fetch user status')
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setError('Failed to load onboarding data. Please try again.')
      
      const storedUserId = localStorage.getItem('userId')
      if (storedUserId) {
        setUserId(storedUserId)
        setOnboardingStep(0)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcademicInfoSubmit = async (data: { educationLevel: string; institutionName: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch(`${API_BASE_URL}/profile/onboarding/step1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          educationLevel: data.educationLevel,
          institutionName: data.institutionName
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        setOnboardingStep(1)
        setCurrentStep(2)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save academic information')
      }
    } catch (error) {
      console.error('Error saving academic info:', error)
      setError(error instanceof Error ? error.message : 'Failed to save academic information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUniversityProfileSubmit = async (data: {
    university: string
    department: string
    program: string
    yearSemester: string
  }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      
      const response = await fetch(`${API_BASE_URL}/profile/onboarding/step2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          university: data.university,
          department: data.department,
          program: data.program,
          yearSemester: data.yearSemester
        }),
      })
      
      if (response.ok) {
        const result = await response.json()
        setOnboardingStep(2)
        setIsComplete(true)
        
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save university profile')
      }
    } catch (error) {
      console.error('Error saving university profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to save university profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !isComplete) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <Card className="p-8 border border-border bg-card shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-foreground">Loading onboarding...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Onboarding Complete!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your profile has been successfully set up.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-destructive mb-2">
                Error
              </h1>
              <p className="text-foreground mb-4">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted">
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                1
              </div>
              <span className="text-sm font-medium">Academic Info</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-muted">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: currentStep >= 2 ? '100%' : '0%' }} />
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <span className="text-sm font-medium">University Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-8">
        {currentStep === 1 ? (
          <AcademicInfo onNext={handleAcademicInfoSubmit} />
        ) : (
          <UniversityProfile onNext={handleUniversityProfileSubmit} />
        )}
      </div>
    </div>
  )
}