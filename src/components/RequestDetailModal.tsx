import { Request, UserRole } from '@/types/request';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { RequestTimeline } from './RequestTimeline';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Calendar, User, MessageSquare, Paperclip, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface RequestDetailModalProps {
  request: Request | null;
  open: boolean;
  onClose: () => void;
  userRole: UserRole;
  onApprove: () => void;
  onReject: () => void;
  onAddScope: () => void;
  onAddTestCases: () => void;
  onStartDevelopment: () => void;
  onCompleteDevelopment: () => void;
  onValidate: () => void;
  onAddComment: () => void;
  onEdit: () => void;
}

export function RequestDetailModal({
  request,
  open,
  onClose,
  userRole,
  onApprove,
  onReject,
  onAddScope,
  onAddTestCases,
  onStartDevelopment,
  onCompleteDevelopment,
  onValidate,
  onAddComment,
  onEdit
}: RequestDetailModalProps) {
  if (!request) return null;

  const canApprove = userRole === 'line_manager' && 
    (request.status === 'pending' || request.status === 'test_cases_added');
  const canAddScope = userRole === 'line_manager' && request.status === 'pending';
  const canAddTestCases = userRole === 'developer' && request.status === 'scope_defined';
  const canStartDev = userRole === 'developer' && request.status === 'approved';
  const canCompleteDev = userRole === 'developer' && request.status === 'in_progress';
  const canValidate = userRole === 'end_user' && request.status === 'development_complete';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{request.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono text-muted-foreground">{request.id}</span>
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Timeline - Horizontal */}
            <RequestTimeline 
              statusHistory={request.statusHistory} 
              currentStatus={request.status}
              orientation="horizontal"
            />

            {/* Request Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm">Description</h4>
                <p className="text-sm text-muted-foreground">{request.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Created By
                  </h4>
                  <p className="text-sm text-muted-foreground">{request.createdByName}</p>
                  <p className="text-xs text-muted-foreground">{format(request.createdAt, 'MMM dd, yyyy HH:mm')}</p>
                </div>

                {request.assignedToName && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assigned To
                    </h4>
                    <p className="text-sm text-muted-foreground">{request.assignedToName}</p>
                  </div>
                )}

                {request.lineManagerName && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Line Manager
                    </h4>
                    <p className="text-sm text-muted-foreground">{request.lineManagerName}</p>
                  </div>
                )}

                {request.dueDate && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </h4>
                    <p className="text-sm text-muted-foreground">{format(request.dueDate, 'MM/dd/yyyy')}</p>
                  </div>
                )}

                {request.system && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">System</h4>
                    <p className="text-sm text-muted-foreground">{request.system}</p>
                  </div>
                )}
              </div>

              {request.scope && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Scope</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.scope}</p>
                  </div>
                </div>
              )}

              {request.testCases && request.testCases.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Test Cases</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <ul className="list-disc list-inside space-y-1">
                      {request.testCases.map((tc, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground">{tc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {request.attachments && request.attachments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </h4>
                  <div className="space-y-2">
                    {request.attachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                        <Paperclip className="w-4 h-4" />
                        <span>{att.filename}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {(att.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {request.comments && request.comments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Comments
                  </h4>
                  <div className="space-y-3">
                    {request.comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.createdAt, 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={onAddComment} variant="outline" size="sm">
            <MessageSquare className="w-4 h-4 mr-2" />
            Add Comment
          </Button>

          {canAddScope && (
            <Button onClick={onAddScope} size="sm">
              Add Scope
            </Button>
          )}

          {canAddTestCases && (
            <Button onClick={onAddTestCases} size="sm">
              Add Test Cases
            </Button>
          )}

          {canApprove && (
            <>
              <Button onClick={onApprove} size="sm">
                Approve
              </Button>
              <Button onClick={onReject} variant="destructive" size="sm">
                Reject
              </Button>
            </>
          )}

          {canStartDev && (
            <Button onClick={onStartDevelopment} size="sm">
              Start Development
            </Button>
          )}

          {canCompleteDev && (
            <Button onClick={onCompleteDevelopment} size="sm">
              Complete Development
            </Button>
          )}

          {canValidate && (
            <Button onClick={onValidate} size="sm">
              Validate & Complete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}