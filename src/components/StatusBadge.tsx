import { RequestStatus } from '@/types/request';
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: RequestStatus;
}

const statusConfig: Record<RequestStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending_manager_approval: { label: 'Pending Manager', variant: 'outline' },
  pending_user_approval: { label: 'Pending User', variant: 'outline' },
  user_approved: { label: 'User Approved', variant: 'default' },
  user_rejected: { label: 'User Rejected', variant: 'destructive' },
  manager_review_test_cases: { label: 'Manager Review', variant: 'outline' },
  pending_design_review: { label: 'Design Review', variant: 'outline' },
  in_development: { label: 'In Development', variant: 'default' },
  uat_release: { label: 'UAT Release', variant: 'default' },
  uat_signoff: { label: 'UAT Sign-off', variant: 'outline' },
  cab_review: { label: 'CAB Review', variant: 'outline' },
  production_release: { label: 'Production', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'destructive' }
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.label}
    </Badge>
  );
}