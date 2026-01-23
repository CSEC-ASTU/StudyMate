import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AuthCardProps {
  title: string
  description: string
  children: React.ReactNode
  footerText: string
  footerLink: {
    text: string
    href: string
  }
}

export function AuthCard({
  title,
  description,
  children,
  footerText,
  footerLink,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <Card className="border border-border bg-card shadow-lg">
        <div className="px-6 py-8 sm:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {children}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="border border-border bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg transition"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border border-border bg-muted hover:bg-muted/80 text-foreground font-medium py-2 rounded-lg transition"
            >
              GitHub
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {footerText}{' '}
            <a
              href={footerLink.href}
              className="font-medium text-primary hover:text-primary/80 transition"
            >
              {footerLink.text}
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}
