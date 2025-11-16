import { RequestStatus } from '@/types/request';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: RequestStatus;
}

const statusConfig: Record<RequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  scope_defined: { label: 'Scope Defined', variant: 'secondary' },
  test_cases_added: { label: 'Test Cases Added', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'default' },
  development_complete: { label: 'Dev Complete', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  rework_needed: { label: 'Rework Needed', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'destructive' }
};

const statusColors: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  scope_defined: 'bg-blue-100 text-blue-800 border-blue-300',
  test_cases_added: 'bg-purple-100 text-purple-800 border-purple-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  development_complete: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  completed: 'bg-gray-100 text-gray-800 border-gray-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  rework_needed: 'bg-orange-100 text-orange-800 border-orange-300',
  cancelled: 'bg-gray-400 text-gray-900 border-gray-500'
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const colorClass = statusColors[status];

  return (
    <Badge className={`${colorClass} border font-medium`}>
      {config.label}
    </Badge>
  );
}