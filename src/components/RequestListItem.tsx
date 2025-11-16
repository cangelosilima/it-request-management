import { Request } from '@/types/request';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

interface RequestListItemProps {
  request: Request;
  onClick: (request: Request) => void;
}

export function RequestListItem({ request, onClick }: RequestListItemProps) {
  const isOverdue = request.dueDate && new Date(request.dueDate) < new Date() && 
    request.status !== 'completed' && request.status !== 'cancelled';

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 bg-card ${
        isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-primary'
      }`}
      onClick={() => onClick(request)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-sm font-mono text-muted-foreground font-semibold">{request.id}</span>
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
            {request.attachments && request.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                <span>{request.attachments.length}</span>
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-base mb-1 line-clamp-1">{request.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {request.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm flex-wrap">
            {request.assignedToName && (
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.assignedToName}`} />
                  <AvatarFallback>{request.assignedToName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">{request.assignedToName}</span>
              </div>
            )}
            {!request.assignedToName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Unassigned</span>
              </div>
            )}
            
            {request.system && (
              <span className="text-xs bg-secondary px-2 py-1 rounded">
                {request.system}
              </span>
            )}
            
            {request.dueDate && (
              <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                <Calendar className="w-4 h-4" />
                <span>{format(request.dueDate, 'MMM dd, yyyy')}</span>
                {isOverdue && <span className="text-xs">(Overdue)</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
