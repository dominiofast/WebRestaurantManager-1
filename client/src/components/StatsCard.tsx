import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  description?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, description }: StatsCardProps) {
  const isPositiveTrend = trend?.startsWith("+");
  const isNegativeTrend = trend?.startsWith("-");

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && description && (
              <div className="flex items-center mt-2 text-sm">
                <span 
                  className={`font-medium ${
                    isPositiveTrend 
                      ? "text-green-600" 
                      : isNegativeTrend 
                      ? "text-red-600" 
                      : "text-muted-foreground"
                  }`}
                >
                  {trend}
                </span>
                <span className="text-muted-foreground ml-2">{description}</span>
              </div>
            )}
            {description && !trend && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="w-12 h-12 bg-coral/10 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-coral" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
