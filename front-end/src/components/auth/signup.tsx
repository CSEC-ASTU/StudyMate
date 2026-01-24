'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { z } from 'zod'
import { create } from 'zustand'

// Zod validation schema
const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface SignupStore {
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
}

const useSignupStore = create<SignupStore>((set) => ({
  errors: {},
  setErrors: (errors) => set({ errors }),
  clearErrors: () => set({ errors: {} }),
}))

export function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [apiError, setApiError] = useState<string>('')
  const { errors, setErrors, clearErrors } = useSignupStore()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (apiError) setApiError('')
    if (name === 'confirmPassword') {
      setPasswordsMatch(value === formData.password)
    } else if (name === 'password') {
      setPasswordsMatch(formData.confirmPassword === value)
    }
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
      if (name === 'password') {
        if (value.length < 8) {
          setErrors({ ...errors, password: 'Password must be at least 8 characters' })
        } else if (!/[A-Z]/.test(value)) {
          setErrors({ ...errors, password: 'Password must contain at least one uppercase letter' })
        } else if (!/[0-9]/.test(value)) {
          setErrors({ ...errors, password: 'Password must contain at least one number' })
        } else if (!/[^A-Za-z0-9]/.test(value)) {
          setErrors({ ...errors, password: 'Password must contain at least one special character' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.password
          setErrors(newErrors)
        }
      } else if (name === 'email') {
        const emailSchema = z.string().email()
        emailSchema.parse(value)
        const newErrors = { ...errors }
        delete newErrors.email
        setErrors(newErrors)
      } else if (name === 'confirmPassword') {
        if (value !== formData.password) {
          setErrors({ ...errors, confirmPassword: "Passwords don't match" })
        } else {
          const newErrors = { ...errors }
          delete newErrors.confirmPassword
          setErrors(newErrors)
        }
      } else if (name === 'fullName') {
        if (!value.trim()) {
          setErrors({ ...errors, fullName: 'Full name is required' })
        } else {
          const newErrors = { ...errors }
          delete newErrors.fullName
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
      signupSchema.parse(formData)
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
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    }
    setTouched(allTouched)
    
    if (!validateForm()) return

    setIsLoading(true)
    setApiError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName, 
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Signup failed')
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      router.push('/academic')
      
    } catch (error: unknown) {
      console.error('Signup error:', error)
      if (error instanceof Error) {
        setApiError(error.message || 'An error occurred during signup. Please try again.')
      } else {
        setApiError('An error occurred during signup. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border border-border bg-card shadow-lg">
          <div className="px-6 py-8 sm:px-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Join us and start your journey today
              </p>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive text-center">{apiError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.fullName ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.password ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive mt-1">{errors.password}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-2.5 bg-input border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-primary transition ${
                    errors.confirmPassword 
                      ? 'border-destructive focus:ring-destructive/50' 
                      : passwordsMatch && formData.confirmPassword
                        ? 'border-green-500 focus:ring-green-500/50'
                        : !passwordsMatch && formData.confirmPassword
                          ? 'border-destructive focus:ring-destructive/50'
                          : 'border-border focus:ring-primary/50'
                  }`}
                />
                {errors.confirmPassword ? (
                  <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
                ) : !passwordsMatch && formData.confirmPassword ? (
                  <p className="text-xs text-destructive mt-1">
                    Passwords do not match
                  </p>
                ) : passwordsMatch && formData.confirmPassword ? (
                  <p className="text-xs text-green-600 mt-1">
                    Passwords match
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isLoading || Object.keys(errors).length > 0 || !formData.password}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or sign up with</span>
              </div>
            </div>

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

            <p className="text-center text-xs text-muted-foreground mt-6">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80 transition">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80 transition">
                Privacy Policy
              </Link>
            </p>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 transition"
              >
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}