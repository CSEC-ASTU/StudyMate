import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: '🔒',
    title: 'Secure',
    description: 'Enterprise-grade security to protect your data',
  },
  {
    icon: '⚡',
    title: 'Fast',
    description: 'Lightning-quick performance on all devices',
  },
  {
    icon: '📱',
    title: 'Responsive',
    description: 'Works perfectly on mobile, tablet, and desktop',
  },
]

export function HomePage() {
  return (
    <>
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">AuthApp</div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border border-border bg-transparent hover:bg-muted text-foreground"
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

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
            Welcome to Your App
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
            Create an account or sign in to access all the amazing features. Our modern authentication system keeps your account secure.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border border-primary text-primary hover:bg-primary/10 px-8 bg-transparent"
              >
                Login
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition"
              >
                <div className="text-2xl font-bold text-primary mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
