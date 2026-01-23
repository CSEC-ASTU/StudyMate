'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { ChevronRight, SkipForward } from 'lucide-react'

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!university) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onNext({ university, department, program, yearSemester })
    }, 500)
  }

  const handleSkip = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onNext({ university: '', department: '', program: '', yearSemester: '' })
    }, 500)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        

        <Card className="border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                University Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Tell us more about your university experience
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* University */}
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium text-foreground">
                  University <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="university"
                  type="text"
                  placeholder="Enter your university name"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-foreground">
                  Department
                </Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="e.g., School of Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>

              {/* Program */}
              <div className="space-y-2">
                <Label htmlFor="program" className="text-sm font-medium text-foreground">
                  Program
                </Label>
                <Input
                  id="program"
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>

              {/* Year/Semester */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium text-foreground">
                  Year / Semester
                </Label>
                <Input
                  id="year"
                  type="text"
                  placeholder="e.g., 3rd Year, Spring 2026"
                  value={yearSemester}
                  onChange={(e) => setYearSemester(e.target.value)}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !university}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Continue...' : (
                  <>
                    Next <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              {/* Skip Button */}
              <Button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                variant="outline"
                className="w-full border border-border bg-transparent hover:bg-muted text-foreground font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isLoading ? 'Continue...' : (
                  <>
                    Skip <SkipForward className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Info Note */}
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
