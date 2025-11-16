import { Request } from '@/types/request';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface RequestCardProps {
  request: Request;
  onClick: (request: Request) => void;
}

export function RequestCard({ request, onClick }: RequestCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary"
      onClick={() => onClick(request)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-muted-foreground">{request.id}</span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <h3 className="font-semibold text-lg leading-tight">{request.title}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {request.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {request.assignedToName && (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
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
          </div>
          
          {request.dueDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(request.dueDate, 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
