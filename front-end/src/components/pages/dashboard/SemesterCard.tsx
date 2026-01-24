import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SemesterCardProps {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  courseCount: number;
  isActive?: boolean;
}

export function SemesterCard({
  name,
  startDate,
  endDate,
  courseCount,
  isActive = false,
}: SemesterCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    return `${months} month${months !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          {isActive && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>{getDuration(startDate, endDate)}</span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Courses:</span>
              <span className="font-semibold">{courseCount}</span>
            </div>
          </div>

          <div className="pt-3">
            <button className="w-full py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              View Details
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}