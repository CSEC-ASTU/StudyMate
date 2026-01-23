import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ScheduleItem {
  time: string
  title: string
  type: "lecture" | "quiz" | "assignment"
}

interface ScheduleCardProps {
  items: ScheduleItem[]
}

const typeStyles = {
  lecture: "bg-primary text-primary-foreground",
  quiz: "bg-secondary text-secondary-foreground",
  assignment: "bg-foreground text-background",
}

export function ScheduleCard({ items }: ScheduleCardProps) {
  return (
    <Card className="border-border bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5" />
          Today&apos;s Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events scheduled for today</p>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeStyles[item.type]}`}>
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.time}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground capitalize">
                {item.type}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
