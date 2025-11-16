import { StatusHistory, RequestStatus } from '@/types/request';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface RequestTimelineProps {
  statusHistory: StatusHistory[];
  currentStatus: RequestStatus;
  orientation?: 'vertical' | 'horizontal';
}

const statusOrder: RequestStatus[] = [
  'pending',
  'scope_defined',
  'test_cases_added',
  'approved',
  'in_progress',
  'development_complete',
  'completed'
];

const statusLabels: Record<RequestStatus, string> = {
  pending: 'Pending',
  scope_defined: 'Scope Defined',
  test_cases_added: 'Test Cases Added',
  approved: 'Approved',
  in_progress: 'In Progress',
  development_complete: 'Development Complete',
  completed: 'Completed',
  rejected: 'Rejected',
  rework_needed: 'Rework Needed',
  cancelled: 'Cancelled'
};

export function RequestTimeline({ statusHistory = [], currentStatus, orientation = 'horizontal' }: RequestTimelineProps) {
  const getStatusIcon = (status: RequestStatus, isCompleted: boolean, isRejected: boolean) => {
    if (isRejected) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    if (isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const currentIndex = statusOrder.indexOf(currentStatus);
  const isRejected = currentStatus === 'rejected' || currentStatus === 'cancelled';

  if (orientation === 'horizontal') {
    return (
      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        <h4 className="font-semibold mb-4 text-sm">Timeline</h4>
        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {statusHistory.map((history, index) => {
            const isLast = index === statusHistory.length - 1;
            const isRejectedStatus = history.status === 'rejected' || history.status === 'cancelled';
            
            return (
              <div key={index} className="flex items-start gap-2 flex-shrink-0">
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className="flex items-center gap-2 w-full">
                    {getStatusIcon(history.status, true, isRejectedStatus)}
                    {!isLast && (
                      <div className={`flex-1 h-0.5 ${isRejectedStatus ? 'bg-red-300' : 'bg-green-300'}`} />
                    )}
                  </div>
                  <div className="mt-2 text-center w-full">
                    <span className={`font-medium text-xs block ${isRejectedStatus ? 'text-red-600' : ''}`}>
                      {statusLabels[history.status]}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      {format(history.changedAt, 'MMM dd, HH:mm')}
                    </span>
                    <span className="text-xs text-muted-foreground block">
                      {history.changedByName}
                    </span>
                    {history.comment && (
                      <span className="text-xs text-muted-foreground italic block mt-1">
                        "{history.comment}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {!isRejected && currentIndex < statusOrder.length - 1 && (
            <div className="flex items-start gap-2 flex-shrink-0">
              <div className="flex flex-col items-center min-w-[120px]">
                <div className="flex items-center gap-2 w-full">
                  <Circle className="w-5 h-5 text-gray-300" />
                </div>
                <div className="mt-2 text-center w-full">
                  <span className="font-medium text-xs text-muted-foreground block">
                    Next: {statusLabels[statusOrder[currentIndex + 1]]}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vertical orientation (original)
  return (
    <div className="bg-muted/30 rounded-lg p-4 mb-4">
      <h4 className="font-semibold mb-3 text-sm">Timeline</h4>
      <div className="space-y-3">
        {statusHistory.map((history, index) => {
          const isLast = index === statusHistory.length - 1;
          const isRejectedStatus = history.status === 'rejected' || history.status === 'cancelled';
          
          return (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                {getStatusIcon(history.status, true, isRejectedStatus)}
                {!isLast && (
                  <div className={`w-0.5 h-8 ${isRejectedStatus ? 'bg-red-300' : 'bg-green-300'}`} />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <span className={`font-medium text-sm ${isRejectedStatus ? 'text-red-600' : ''}`}>
                    {statusLabels[history.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(history.changedAt, 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  by {history.changedByName}
                </div>
                {history.comment && (
                  <div className="text-xs text-muted-foreground mt-1 italic">
                    "{history.comment}"
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {!isRejected && currentIndex < statusOrder.length - 1 && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <Circle className="w-5 h-5 text-gray-300" />
            </div>
            <div className="flex-1">
              <span className="font-medium text-sm text-muted-foreground">
                Next: {statusLabels[statusOrder[currentIndex + 1]]}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}