'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import { z } from 'zod'
import { create } from 'zustand'

const academicInfoSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  institutionName: z.string()
    .min(1, 'Institution name is required')
    .regex(/^[a-zA-Z\s]*$/, 'Institution name must contain only letters and spaces'),
})

interface AcademicInfoStore {
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
}

const useAcademicInfoStore = create<AcademicInfoStore>((set) => ({
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
}))

interface AcademicInfoProps {
  onNext: (data: { educationLevel: string; institutionName: string }) => void
}

export function AcademicInfo({ onNext }: AcademicInfoProps) {
  const [educationLevel, setEducationLevel] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [initialValidationDone, setInitialValidationDone] = useState(false)
  const { errors, setErrors, clearErrors } = useAcademicInfoStore()

  useEffect(() => {
    if (initialValidationDone) {
      validateField('educationLevel', educationLevel)
      validateField('institutionName', institutionName)
    }
  }, [educationLevel, institutionName, initialValidationDone])

  const handleEducationLevelChange = (value: string) => {
    setEducationLevel(value)
  }

  const handleInstitutionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInstitutionName(value)
  }

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    try {
      if (field === 'educationLevel') {
        if (!value.trim()) {
          setErrors({ ...errors, educationLevel: 'Education level is required' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.educationLevel
          setErrors(newErrors)
        }
      } else if (field === 'institutionName') {
        if (!value.trim()) {
          setErrors({ ...errors, institutionName: 'Institution name is required' })
        } else if (!/^[a-zA-Z\s]*$/.test(value)) {
          setErrors({ ...errors, institutionName: 'Institution name must contain only letters and spaces' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.institutionName
          setErrors(newErrors)
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, [field]: error.issues[0].message })
      }
    }
  }

  const validateForm = () => {
    try {
      academicInfoSchema.parse({
        educationLevel,
        institutionName,
      })
      clearErrors()
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setInitialValidationDone(true)
    const allTouched = {
      educationLevel: true,
      institutionName: true,
    }
    setTouched(allTouched)
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onNext({ educationLevel, institutionName })
    } catch (error) {
      console.error('Error in academic info submission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isComplete = educationLevel && institutionName && Object.keys(errors).length === 0

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Academic Information
              </h1>
              <p className="text-sm text-muted-foreground">
                Let's start by understanding your educational background
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium text-foreground">
                  Education Level
                </Label>
                <Select 
                  value={educationLevel} 
                  onValueChange={handleEducationLevelChange}
                  onOpenChange={(open) => {
                    if (!open && educationLevel) {
                      handleBlur('educationLevel', educationLevel)
                    }
                  }}
                >
                  <SelectTrigger className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    (initialValidationDone || touched.educationLevel) && errors.educationLevel ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}>
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
                {(initialValidationDone || touched.educationLevel) && errors.educationLevel && (
                  <p className="text-xs text-destructive mt-1">{errors.educationLevel}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-medium text-foreground">
                  Institution Name
                </Label>
                <Input
                  id="institution"
                  type="text"
                  placeholder="Enter your school or university name"
                  value={institutionName}
                  onChange={handleInstitutionNameChange}
                  onBlur={() => handleBlur('institutionName', institutionName)}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    (initialValidationDone || touched.institutionName) && errors.institutionName ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {(initialValidationDone || touched.institutionName) && errors.institutionName && (
                  <p className="text-xs text-destructive mt-1">{errors.institutionName}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading || !isComplete}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Next <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground">
                This information helps us organize your courses and study plan effectively.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}