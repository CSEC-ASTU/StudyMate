'use client'

import React from "react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ChevronRight, SkipForward } from 'lucide-react'
import { z } from 'zod'
import { create } from 'zustand'

// Zod validation schema
const universityProfileSchema = z.object({
  university: z.string()
    .min(1, 'University name is required')
    .regex(/^[a-zA-Z\s]*$/, 'University name must contain only letters and spaces'),
  department: z.string()
    .min(1, 'Department is required')
    .regex(/^[a-zA-Z\s]*$/, 'Department must contain only letters and spaces'),
  program: z.string()
    .min(1, 'Program is required')
    .regex(/^[a-zA-Z\s]*$/, 'Program must contain only letters and spaces'),
  yearSemester: z.string()
    .min(1, 'Year/Semester is required')
    .regex(/^[a-zA-Z0-9\s,]*$/, 'Year/Semester can contain letters, numbers, spaces, and commas')
})

// Zustand store for form state and validation
interface UniversityProfileStore {
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
}

const useUniversityProfileStore = create<UniversityProfileStore>((set) => ({
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
}))

interface UniversityProfileProps {
  onNext: (data: {
    university: string
    department: string
    program: string
    yearSemester: string
  }) => void
}

export function UniversityProfile({ onNext }: UniversityProfileProps) {
  const [university, setUniversity] = useState('')
  const [department, setDepartment] = useState('')
  const [program, setProgram] = useState('')
  const [yearSemester, setYearSemester] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { errors, setErrors, clearErrors } = useUniversityProfileStore()

  const handleUniversityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUniversity(value)
    if (touched.university) {
      validateField('university', value)
    }
  }

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDepartment(value)
    if (touched.department) {
      validateField('department', value)
    }
  }

  const handleProgramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setProgram(value)
    if (touched.program) {
      validateField('program', value)
    }
  }

  const handleYearSemesterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setYearSemester(value)
    if (touched.yearSemester) {
      validateField('yearSemester', value)
    }
  }

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    try {
      if (field === 'university') {
        if (!value.trim()) {
          setErrors({ ...errors, university: 'University name is required' })
        } else if (!/^[a-zA-Z\s]*$/.test(value)) {
          setErrors({ ...errors, university: 'University name must contain only letters and spaces' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.university
          setErrors(newErrors)
        }
      } else if (field === 'department') {
        if (!value.trim()) {
          setErrors({ ...errors, department: 'Department is required' })
        } else if (!/^[a-zA-Z\s]*$/.test(value)) {
          setErrors({ ...errors, department: 'Department must contain only letters and spaces' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.department
          setErrors(newErrors)
        }
      } else if (field === 'program') {
        if (!value.trim()) {
          setErrors({ ...errors, program: 'Program is required' })
        } else if (!/^[a-zA-Z\s]*$/.test(value)) {
          setErrors({ ...errors, program: 'Program must contain only letters and spaces' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.program
          setErrors(newErrors)
        }
      } else if (field === 'yearSemester') {
        if (!value.trim()) {
          setErrors({ ...errors, yearSemester: 'Year/Semester is required' })
        } else if (!/^[a-zA-Z0-9\s,]*$/.test(value)) {
          setErrors({ ...errors, yearSemester: 'Year/Semester can contain letters, numbers, spaces, and commas' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.yearSemester
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
      universityProfileSchema.parse({
        university,
        department,
        program,
        yearSemester,
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
    
    const allTouched = {
      university: true,
      department: true,
      program: true,
      yearSemester: true,
    }
    setTouched(allTouched)
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onNext({ university, department, program, yearSemester })
    } catch (error) {
      console.error('Error in university profile submission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      await onNext({ university: '', department: '', program: '', yearSemester: '' })
    } catch (error) {
      console.error('Error skipping university profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isSubmitDisabled = isLoading || !university || !department || !program || !yearSemester || Object.keys(errors).length > 0

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                University Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Tell us more about your university experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium text-foreground">
                  University <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="university"
                  type="text"
                  placeholder="Enter your university name"
                  value={university}
                  onChange={handleUniversityChange}
                  onBlur={() => handleBlur('university', university)}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.university ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.university && (
                  <p className="text-xs text-destructive mt-1">{errors.university}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-foreground">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="e.g., School of Engineering"
                  value={department}
                  onChange={handleDepartmentChange}
                  onBlur={() => handleBlur('department', department)}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.department ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.department && (
                  <p className="text-xs text-destructive mt-1">{errors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="program" className="text-sm font-medium text-foreground">
                  Program <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="program"
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={program}
                  onChange={handleProgramChange}
                  onBlur={() => handleBlur('program', program)}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.program ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.program && (
                  <p className="text-xs text-destructive mt-1">{errors.program}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium text-foreground">
                  Year / Semester <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="year"
                  type="text"
                  placeholder="e.g., 3rd Year, Spring 2026"
                  value={yearSemester}
                  onChange={handleYearSemesterChange}
                  onBlur={() => handleBlur('yearSemester', yearSemester)}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.yearSemester ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.yearSemester && (
                  <p className="text-xs text-destructive mt-1">{errors.yearSemester}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Onboarding <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip for now
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground">
                You can update these details later anytime from your profile settings.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}