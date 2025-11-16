import { Request } from '@/types/request';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RequestListItemProps {
  request: Request;
  onClick: (request: Request) => void;
  viewMode?: 'list' | 'grid';
  visibleColumns?: string[];
}

export function RequestListItem({ request, onClick, viewMode = 'list', visibleColumns = ['id', 'title', 'status', 'priority', 'assignee', 'system', 'dueDate'] }: RequestListItemProps) {
  const isOverdue = request.dueDate && new Date(request.dueDate) < new Date() && 
    request.status !== 'completed' && request.status !== 'cancelled';

  if (viewMode === 'grid') {
    return (
      <div
        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 bg-card h-full flex flex-col ${
          isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-primary'
        }`}
        onClick={() => onClick(request)}
      >
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {visibleColumns.includes('id') && (
            <span className="text-xs font-mono text-muted-foreground font-semibold">{request.id}</span>
          )}
          {visibleColumns.includes('status') && <StatusBadge status={request.status} />}
          {visibleColumns.includes('priority') && <PriorityBadge priority={request.priority} />}
        </div>
        
        {visibleColumns.includes('title') && (
          <h3 className="font-semibold text-sm mb-2 line-clamp-2">{request.title}</h3>
        )}
        
        <div className="mt-auto space-y-2">
          {visibleColumns.includes('assignee') && (
            <div className="text-xs text-muted-foreground truncate">
              {request.assignedToName || 'Unassigned'}
            </div>
          )}
          
          {visibleColumns.includes('system') && request.system && (
            <span className="text-xs bg-secondary px-2 py-1 rounded inline-block">
              {request.system}
            </span>
          )}
          
          {visibleColumns.includes('dueDate') && request.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
              <Calendar className="w-3 h-3" />
              <span>{format(request.dueDate, 'MM/dd/yyyy')}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-lg p-2 cursor-pointer hover:shadow-md transition-all duration-200 bg-card ${
        isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-primary'
      }`}
      onClick={() => onClick(request)}
    >
      <div className="grid grid-cols-[100px_1fr_120px_120px_140px_180px_120px] gap-3 items-center text-sm">
        {visibleColumns.includes('id') && (
          <span className="text-xs font-mono text-muted-foreground font-semibold">{request.id}</span>
        )}
        
        {visibleColumns.includes('title') && (
          <h3 className="font-semibold text-sm truncate">{request.title}</h3>
        )}
        
        {visibleColumns.includes('status') && (
          <div className="flex justify-center">
            <StatusBadge status={request.status} />
          </div>
        )}
        
        {visibleColumns.includes('priority') && (
          <div className="flex justify-center">
            <PriorityBadge priority={request.priority} />
          </div>
        )}
        
        {visibleColumns.includes('assignee') && (
          <span className="text-xs text-muted-foreground truncate text-center">
            {request.assignedToName || 'Unassigned'}
          </span>
        )}
        
        {visibleColumns.includes('system') && (
          <span className="text-xs bg-secondary px-2 py-1 rounded text-center truncate">
            {request.system || '-'}
          </span>
        )}
        
        {visibleColumns.includes('dueDate') && (
          <div className={`flex items-center justify-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
            {request.dueDate ? (
              <>
                <Calendar className="w-3 h-3" />
                <span>{format(request.dueDate, 'MM/dd/yyyy')}</span>
              </>
            ) : (
              <span>-</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}