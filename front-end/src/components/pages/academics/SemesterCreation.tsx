'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { CheckCircle, ChevronRight } from 'lucide-react'

interface SemesterCreationProps {
  onComplete: (data: {
    semesterName: string
    startDate: string
    endDate: string
  }) => void
}

export function SemesterCreation({ onComplete }: SemesterCreationProps) {
  const [semesterName, setSemesterName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!semesterName || !startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start >= end) {
      alert('End date must be after start date')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onComplete({ semesterName, startDate, endDate })
    }, 500)
  }

  const isComplete = semesterName && startDate && endDate

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">


        <Card className="border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create Your Semester
              </h1>
              <p className="text-sm text-muted-foreground">
                Start the academic structure for your courses
              </p>
            </div>

            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Why this matters</p>
                  <p className="text-xs text-muted-foreground">
                    We use this to organize your courses and study plan effectively
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="semester" className="text-sm font-medium text-foreground">
                  Semester Name
                </Label>
                <Input
                  id="semester"
                  type="text"
                  placeholder="e.g., Spring 2026"
                  value={semesterName}
                  onChange={(e) => setSemesterName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-foreground">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !isComplete}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Creating Semester...' : (
                  <>
                    Create & Add Courses <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 p-4 bg-muted/50 border border-border rounded-lg">
              <p className="text-xs text-muted-foreground">
                After creating your semester, you'll be able to add your courses and start planning your study schedule.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
