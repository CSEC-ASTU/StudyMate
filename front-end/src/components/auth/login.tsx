'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { z } from 'zod'
import { create } from 'zustand'

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Zustand store for form state and validation
interface LoginStore {
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
}

const useLoginStore = create<LoginStore>((set) => ({
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
}))

export function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const { errors, setErrors, clearErrors } = useLoginStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validate field on change if it's been touched
    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    try {
      if (name === 'email') {
        // Validate email
        const emailSchema = z.string().email()
        emailSchema.parse(value)
        const newErrors = { ...errors }
        delete newErrors.email
        setErrors(newErrors)
      } else if (name === 'password') {
        // Validate password
        if (!value.trim()) {
          setErrors({ ...errors, password: 'Password is required' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.password
          setErrors(newErrors)
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ ...errors, [name]: error.issues[0].message })
      }
    }
  }

  const validateForm = () => {
    try {
      loginSchema.parse(formData)
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
    
    // Mark all fields as touched
    const allTouched = {
      email: true,
      password: true,
    }
    setTouched(allTouched)
    
    if (!validateForm()) return

    setIsLoading(true)
    // Handle login logic here
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-sm text-muted-foreground">
                Login to your account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.email ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-primary hover:text-primary/80 font-medium transition"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.password ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="border border-border bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg transition"
              >
                <Image
                    src="/Google.png"
                    alt="Google"
                    width={18}
                    height={18}
                />  
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border border-border bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg transition"
              >
                <Image
                    src="/Github.png"
                    alt="GitHub"
                    width={18}
                    height={18}
                />  
                GitHub
              </Button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80 transition"
              >
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}