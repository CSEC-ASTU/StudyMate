'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { ArrowRight, BookOpen, GraduationCap, Users, Shield, Zap, Clock, Globe, Sparkles, PlayCircle, Download } from 'lucide-react'

export function HomePage() {
  return (
    <>
      {/* Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">
              StudyMate
            </span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-border hover:bg-accent hover:text-accent-foreground"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 px-4">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-10" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-sm font-medium text-primary">🎓 Join Thousands of Students</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                  <span className="block text-foreground">Smart Learning</span>
                  <span className="block text-primary">
                    Made Simple
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  The ultimate academic companion helping students worldwide achieve better grades, 
                  manage coursework, and collaborate effectively.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 group">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#demo">
                    <Button size="lg" variant="outline" className="border-border hover:bg-accent px-8 group">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hover:text-primary transition cursor-pointer">Get the app</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Used by 50k+ students</span>
                  </div>
                </div>
              </div>

              {/* Right Content - 3D Illustration */}
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                  <div className="aspect-video bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex items-center justify-center p-8">
                    {/* 3D Books Stack */}
                    <div className="relative w-64 h-48">
                      {/* Book 3 */}
                      <div className="absolute -right-4 -bottom-2 w-32 h-40 bg-gradient-to-br from-primary/80 to-primary rounded-lg transform rotate-6 shadow-lg">
                        <div className="absolute inset-2 bg-white/10 rounded" />
                      </div>
                      {/* Book 2 */}
                      <div className="absolute left-12 bottom-0 w-36 h-44 bg-gradient-to-br from-primary to-primary/90 rounded-lg transform -rotate-3 shadow-xl">
                        <div className="absolute inset-3 bg-white/10 rounded flex items-center justify-center">
                          <GraduationCap className="w-12 h-12 text-white/80" />
                        </div>
                      </div>
                      {/* Book 1 */}
                      <div className="absolute left-0 top-4 w-40 h-48 bg-gradient-to-br from-primary/90 to-primary rounded-lg shadow-2xl">
                        <div className="absolute inset-4 bg-white/10 rounded flex flex-col items-center justify-center p-4">
                          <BookOpen className="w-16 h-16 text-white/80 mb-2" />
                          <div className="text-white/80 text-sm font-semibold text-center">StudyMate</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-6 left-6 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="absolute -bottom-6 -left-6">
                  <Card className="p-4 bg-background border border-border shadow-lg rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-primary">50K+</p>
                        <p className="text-xs text-muted-foreground">Active Students</p>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="absolute -top-6 -right-6">
                  <Card className="p-4 bg-background border border-border shadow-lg rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-primary">94%</p>
                        <p className="text-xs text-muted-foreground">Grade Improvement</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Everything Students Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A comprehensive academic platform with tools designed to help you study smarter, not harder.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Smart Study Planner
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create personalized study schedules with AI-powered recommendations. 
                  Track your progress and stay on top of deadlines.
                </p>
                <Link href="/signup" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                  Try it free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>

              {/* Feature 2 */}
              <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Collaborative Learning
                </h3>
                <p className="text-muted-foreground mb-6">
                  Study with classmates, share notes, and work on group projects together 
                  in real-time virtual study rooms.
                </p>
                <Link href="/signup" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                  Join community
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>

              {/* Feature 3 */}
              <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Secure & Private
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your data is protected with enterprise-grade security. 
                  Study with confidence knowing your work is always safe.
                </p>
                <Link href="/signup" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>

              {/* Feature 4 */}
              <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Time Management
                </h3>
                <p className="text-muted-foreground mb-6">
                  Pomodoro timer, focus sessions, and productivity analytics 
                  to help you make the most of your study time.
                </p>
                <Link href="/signup" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                  Boost productivity
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>

              {/* Feature 5 */}
              <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Exam Preparation
                </h3>
                <p className="text-muted-foreground mb-6">
                  Practice tests, flashcards, and revision tools tailored 
                  to your courses and learning style.
                </p>
                <Link href="/signup" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                  Ace your exams
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>

              {/* Feature 6 */}
              <Card className="p-8 bg-background border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Instant Feedback
                </h3>
                <p className="text-muted-foreground mb-6">
                  Get real-time feedback on assignments and practice questions 
                  to identify areas for improvement.
                </p>
                <Link href="/signup" className="inline-flex items-center text-primary hover:text-primary/80 font-medium">
                  Improve faster
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-12 bg-primary/5 border-primary/20">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Ready to Transform Your Study Habits?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already achieving better grades, 
                reducing stress, and enjoying the learning process with StudyMate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10">
                    Start Your Free Trial
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-border hover:bg-accent px-10">
                    Sign In to Continue
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-primary">StudyMate</span>
                  <p className="text-xs text-muted-foreground">Your Smart Academic Companion</p>
                </div>
              </div>
              
              <div className="flex gap-8">
                <div>
                  <p className="font-medium text-sm text-foreground mb-2">Product</p>
                  <div className="space-y-1">
                    <Link href="/features" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Features
                    </Link>
                    <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Pricing
                    </Link>
                    <Link href="/demo" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Demo
                    </Link>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground mb-2">Company</p>
                  <div className="space-y-1">
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition block">
                      About
                    </Link>
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Blog
                    </Link>
                    <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Careers
                    </Link>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground mb-2">Support</p>
                  <div className="space-y-1">
                    <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Help Center
                    </Link>
                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Contact
                    </Link>
                    <Link href="/status" className="text-sm text-muted-foreground hover:text-primary transition block">
                      Status
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground text-center md:text-left">
                © {new Date().getFullYear()} StudyMate. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}