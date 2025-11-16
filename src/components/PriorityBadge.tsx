import { Priority } from '@/types/request';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowUp, Minus, Zap, Flame } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityConfig: Record<Priority, { label: string; icon: React.ReactNode; className: string }> = {
  low: {
    label: 'Low',
    icon: <Minus className="w-3 h-3" />,
    className: 'bg-gray-100 text-gray-700 border-gray-300'
  },
  medium: {
    label: 'Medium',
    icon: <Minus className="w-3 h-3" />,
    className: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  high: {
    label: 'High',
    icon: <ArrowUp className="w-3 h-3" />,
    className: 'bg-orange-100 text-orange-700 border-orange-300'
  },
  urgent: {
    label: 'Urgent',
    icon: <Zap className="w-3 h-3" />,
    className: 'bg-red-100 text-red-700 border-red-300'
  },
  emergency: {
    label: 'Emergency',
    icon: <Flame className="w-3 h-3" />,
    className: 'bg-red-600 text-white border-red-700 animate-pulse'
  }
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge className={`${config.className} border font-medium flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}