import { Request, UserRole } from '@/types/request';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { RequestTimeline } from './RequestTimeline';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, Clock, CheckCircle2, FileText, Paperclip, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RequestDetailModalProps {
  request: Request | null;
  open: boolean;
  onClose: () => void;
  userRole: UserRole;
  onApprove?: () => void;
  onReject?: () => void;
  onAddScope?: () => void;
  onAddTestCases?: () => void;
  onStartDevelopment?: () => void;
  onCompleteDevelopment?: () => void;
  onValidate?: () => void;
  onAddComment?: () => void;
  onEdit?: () => void;
  onUploadAttachment?: () => void;
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
  onEdit,
  onUploadAttachment
}: RequestDetailModalProps) {
  if (!request) return null;

  const canApprove = userRole === 'line_manager' && 
    (request.status === 'pending' || request.status === 'test_cases_added');
  
  const canAddScope = userRole === 'line_manager' && request.status === 'pending';
  
  const canAddTestCases = userRole === 'developer' && request.status === 'scope_defined';
  
  const canStartDev = userRole === 'developer' && request.status === 'approved';
  
  const canCompleteDev = userRole === 'developer' && request.status === 'in_progress';
  
  const canValidate = userRole === 'end_user' && request.status === 'development_complete';

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{request.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono text-muted-foreground">{request.id}</span>
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
                {request.system && (
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    {request.system}
                  </span>
                )}
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <RequestTimeline statusHistory={request.statusHistory} currentStatus={request.status} />

        <ScrollArea className="max-h-[50vh]">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="scope">Scope & Tests</TabsTrigger>
              <TabsTrigger value="attachments">
                Attachments ({request.attachments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="comments">Comments ({request.comments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{request.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Created By
                  </h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.createdByName}`} />
                      <AvatarFallback>{request.createdByName[0]}</AvatarFallback>
                    </Avatar>
                    <span>{request.createdByName}</span>
                  </div>
                </div>

                {request.assignedToName && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assigned To
                    </h4>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.assignedToName}`} />
                        <AvatarFallback>{request.assignedToName[0]}</AvatarFallback>
                      </Avatar>
                      <span>{request.assignedToName}</span>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created Date
                  </h4>
                  <p className="text-muted-foreground">{format(request.createdAt, 'MMM dd, yyyy')}</p>
                </div>

                {request.dueDate && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Due Date
                    </h4>
                    <p className="text-muted-foreground">{format(request.dueDate, 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="scope" className="space-y-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Scope Definition
                </h4>
                {request.scope ? (
                  <p className="text-muted-foreground">{request.scope}</p>
                ) : (
                  <p className="text-muted-foreground italic">No scope defined yet</p>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Test Cases
                </h4>
                {request.testCases && request.testCases.length > 0 ? (
                  <ul className="space-y-2">
                    {request.testCases.map((testCase, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                        <span className="text-muted-foreground">{testCase}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic">No test cases defined yet</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-3 mt-4">
              {onUploadAttachment && (
                <Button onClick={onUploadAttachment} variant="outline" className="w-full">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Upload Attachment
                </Button>
              )}
              
              {request.attachments && request.attachments.length > 0 ? (
                request.attachments.map((attachment) => (
                  <div key={attachment.id} className="border rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-sm">{attachment.filename}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedByName} • {format(attachment.uploadedAt, 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground italic py-8">No attachments</p>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 mt-4">
              {request.comments.length > 0 ? (
                request.comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userName}`} />
                        <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.createdAt, 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground italic py-8">No comments yet</p>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <Separator />

        <div className="flex gap-2 flex-wrap">
          {canApprove && onApprove && (
            <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
              Approve
            </Button>
          )}
          {canApprove && onReject && (
            <Button onClick={onReject} variant="destructive">
              Reject
            </Button>
          )}
          {canAddScope && onAddScope && (
            <Button onClick={onAddScope}>
              Add Scope
            </Button>
          )}
          {canAddTestCases && onAddTestCases && (
            <Button onClick={onAddTestCases}>
              Add Test Cases
            </Button>
          )}
          {canStartDev && onStartDevelopment && (
            <Button onClick={onStartDevelopment}>
              Start Development
            </Button>
          )}
          {canCompleteDev && onCompleteDevelopment && (
            <Button onClick={onCompleteDevelopment}>
              Mark as Complete
            </Button>
          )}
          {canValidate && onValidate && (
            <Button onClick={onValidate} className="bg-green-600 hover:bg-green-700">
              Validate & Accept
            </Button>
          )}
          {onAddComment && (
            <Button onClick={onAddComment} variant="outline">
              Add Comment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}