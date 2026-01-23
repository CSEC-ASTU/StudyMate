'use client'

import React from "react"

import { useState } from 'react'
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

interface AcademicInfoProps {
  onNext: (data: { educationLevel: string; institutionName: string }) => void
}

export function AcademicInfo({ onNext }: AcademicInfoProps) {
  const [educationLevel, setEducationLevel] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!educationLevel || !institutionName) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onNext({ educationLevel, institutionName })
    }, 500)
  }

  const isComplete = educationLevel && institutionName

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <Card className="border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Academic Information
              </h1>
              <p className="text-sm text-muted-foreground">
                Let's start by understanding your educational background
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Education Level */}
              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-medium text-foreground">
                  Education Level
                </Label>
                <Select value={educationLevel} onValueChange={setEducationLevel}>
                  <SelectTrigger className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Institution Name */}
              <div className="space-y-2">
                <Label htmlFor="institution" className="text-sm font-medium text-foreground">
                  Institution Name
                </Label>
                <Input
                  id="institution"
                  type="text"
                  placeholder="Enter your school or university name"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || !isComplete}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Continue...' : (
                  <>
                    Next <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Info Note */}
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
