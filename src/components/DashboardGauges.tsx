import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Clock, TrendingUp, Zap } from 'lucide-react';

interface DashboardGaugesProps {
  ongoingCount: number;
  pendingActionsCount: number;
  overdueCount: number;
  dormantCount: number;
  emergencyCount: number;
}

export function DashboardGauges({
  ongoingCount = 0,
  pendingActionsCount = 0,
  overdueCount = 0,
  dormantCount = 0,
  emergencyCount = 0
}: DashboardGaugesProps) {
  const gauges = [
    {
      title: 'Ongoing Requests',
      value: ongoingCount,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Pending Actions',
      value: pendingActionsCount,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Overdue',
      value: overdueCount,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Dormant (>1 month)',
      value: dormantCount,
      icon: TrendingUp,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      title: 'Emergency',
      value: emergencyCount,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {gauges.map((gauge) => {
        const Icon = gauge.icon;
        return (
          <Card key={gauge.title} className={`border-2 ${gauge.borderColor} ${gauge.bgColor}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={`w-4 h-4 ${gauge.color}`} />
                {gauge.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${gauge.color}`}>
                {gauge.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
