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

export function FeaturesSection() {
  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
  )
}
