import { useState } from 'react';
import { Request, UserRole, TestCase, Release, ReleaseType, TestCaseStatus } from '@/types/request';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { RequestTimeline } from './RequestTimeline';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Calendar, User, MessageSquare, Paperclip, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { mockUsers, currentUser, systemScenarios } from '@/data/mockData';

interface RequestDetailModalProps {
  request: Request | null;
  open: boolean;
  onClose: () => void;
  userRole: UserRole;
  onRequestUpdate: (request: Request) => void;
}

export function RequestDetailModal({
  request,
  open,
  onClose,
  userRole,
  onRequestUpdate
}: RequestDetailModalProps) {
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [actionText, setActionText] = useState('');
  const [selectedDevelopers, setSelectedDevelopers] = useState<string[]>([]);
  const [testCaseText, setTestCaseText] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [releaseType, setReleaseType] = useState<ReleaseType>('binary');
  const [rfcCode, setRfcCode] = useState('');
  const [releaseDescription, setReleaseDescription] = useState('');
  const [testCaseStatuses, setTestCaseStatuses] = useState<Record<string, TestCaseStatus>>({});
  const [testCaseComments, setTestCaseComments] = useState<Record<string, string>>({});
  const [approvalJustification, setApprovalJustification] = useState('');
  
  const { toast } = useToast();

  if (!request) return null;

  const developers = mockUsers.filter(u => u.role === 'developer');
  const availableScenarios = systemScenarios.filter(s => s.systemName === request.system);

  const handleAction = (type: string) => {
    setActionType(type);
    setActionText('');
    setActionModalOpen(true);
    
    if (type === 'assign_developers') {
      setSelectedDevelopers(request.assignedDevelopers || []);
    }
    if (type === 'add_test_cases') {
      setTestCaseText('');
      setSelectedScenarios([]);
    }
    if (type === 'add_release') {
      setReleaseType('binary');
      setRfcCode('');
      setReleaseDescription('');
    }
    if (type === 'uat_signoff') {
      const statuses: Record<string, TestCaseStatus> = {};
      const comments: Record<string, string> = {};
      request.testCases.forEach(tc => {
        statuses[tc.id] = tc.status;
        comments[tc.id] = tc.comments || '';
      });
      setTestCaseStatuses(statuses);
      setTestCaseComments(comments);
      setApprovalJustification('');
    }
  };

  const executeAction = () => {
    if (!request) return;

    const updatedRequest = { ...request, updatedAt: new Date() };
    const newHistory = [...request.statusHistory];

    switch (actionType) {
      case 'manager_approve':
        if (selectedDevelopers.length === 0) {
          toast({ title: "Error", description: "Please select at least one developer", variant: "destructive" });
          return;
        }
        updatedRequest.status = 'pending_user_approval';
        updatedRequest.assignedDevelopers = selectedDevelopers;
        updatedRequest.assignedDeveloperNames = developers.filter(d => selectedDevelopers.includes(d.id)).map(d => d.name);
        newHistory.push({
          status: 'pending_user_approval',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: actionText || 'Approved and assigned developers'
        });
        break;

      case 'manager_reject':
        updatedRequest.status = 'rejected';
        newHistory.push({
          status: 'rejected',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: actionText || 'Rejected'
        });
        break;

      case 'user_approve':
        updatedRequest.status = 'user_approved';
        newHistory.push({
          status: 'user_approved',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: actionText || 'Approved by user'
        });
        break;

      case 'user_reject':
        updatedRequest.status = 'user_rejected';
        newHistory.push({
          status: 'user_rejected',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: actionText || 'Rejected by user'
        });
        break;

      case 'add_test_cases':
        const customTestCases = testCaseText.split('\n').filter(t => t.trim()).map((desc, idx) => ({
          id: `tc-${Date.now()}-${idx}`,
          description: desc.trim(),
          status: 'pending' as TestCaseStatus,
          isPreDefined: false
        }));
        
        const scenarioTestCases = selectedScenarios.map(scId => {
          const scenario = systemScenarios.find(s => s.id === scId);
          return {
            id: `tc-${Date.now()}-${scId}`,
            description: scenario?.description || '',
            status: 'pending' as TestCaseStatus,
            isPreDefined: true,
            systemScenarioId: scId
          };
        });

        updatedRequest.testCases = [...request.testCases, ...customTestCases, ...scenarioTestCases];
        updatedRequest.impactAnalysis = actionText;
        updatedRequest.status = 'manager_review_test_cases';
        newHistory.push({
          status: 'manager_review_test_cases',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: 'Test cases and impact analysis submitted'
        });
        break;

      case 'manager_approve_test_cases':
        updatedRequest.status = 'pending_design_review';
        newHistory.push({
          status: 'pending_design_review',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: actionText || 'Test cases approved'
        });
        break;

      case 'add_design':
        updatedRequest.architectureDesign = actionText;
        updatedRequest.designReview = actionText;
        updatedRequest.status = 'in_development';
        newHistory.push({
          status: 'in_development',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: 'Design submitted, development started'
        });
        break;

      case 'add_release':
        if (!rfcCode.trim() || !releaseDescription.trim()) {
          toast({ title: "Error", description: "Please fill in all release fields", variant: "destructive" });
          return;
        }
        const newRelease: Release = {
          id: `rel-${Date.now()}`,
          type: releaseType,
          rfcCode: rfcCode,
          description: releaseDescription,
          releasedBy: currentUser.id,
          releasedByName: currentUser.name,
          releasedAt: new Date(),
          isManual: true
        };
        updatedRequest.releases = [...request.releases, newRelease];
        if (request.status === 'in_development') {
          updatedRequest.status = 'uat_release';
          newHistory.push({
            status: 'uat_release',
            changedBy: currentUser.id,
            changedByName: currentUser.name,
            changedAt: new Date(),
            comment: 'Release added'
          });
        }
        break;

      case 'submit_uat_signoff':
        updatedRequest.status = 'uat_signoff';
        newHistory.push({
          status: 'uat_signoff',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: 'Submitted for UAT sign-off'
        });
        break;

      case 'uat_signoff':
        const hasFailures = Object.values(testCaseStatuses).some(s => s === 'failed' || s === 'partially_passed');
        if (hasFailures && !approvalJustification.trim()) {
          toast({ title: "Error", description: "Please provide justification for approval with failed/partial tests", variant: "destructive" });
          return;
        }
        
        updatedRequest.testCases = request.testCases.map(tc => ({
          ...tc,
          status: testCaseStatuses[tc.id] || tc.status,
          comments: testCaseComments[tc.id] || tc.comments,
          testedBy: currentUser.id,
          testedByName: currentUser.name,
          testedAt: new Date()
        }));
        
        if (hasFailures) {
          updatedRequest.userApprovalJustification = approvalJustification;
        }
        
        updatedRequest.status = 'cab_review';
        newHistory.push({
          status: 'cab_review',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: hasFailures ? `Approved with justification: ${approvalJustification}` : 'All tests passed'
        });
        break;

      case 'promote_cab':
        updatedRequest.status = 'cab_review';
        newHistory.push({
          status: 'cab_review',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: 'Promoted to CAB review'
        });
        break;

      case 'production_release':
        updatedRequest.status = 'production_release';
        newHistory.push({
          status: 'production_release',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: 'Released to production'
        });
        break;

      case 'complete_request':
        if (!actionText.trim()) {
          toast({ title: "Error", description: "Please provide post implementation review and release notes", variant: "destructive" });
          return;
        }
        updatedRequest.postImplementationReview = actionText;
        updatedRequest.releaseNotes = actionText;
        updatedRequest.status = 'completed';
        newHistory.push({
          status: 'completed',
          changedBy: currentUser.id,
          changedByName: currentUser.name,
          changedAt: new Date(),
          comment: 'Request completed'
        });
        break;

      case 'add_comment':
        const newComment = {
          id: `c${Date.now()}`,
          requestId: request.id,
          userId: currentUser.id,
          userName: currentUser.name,
          content: actionText,
          createdAt: new Date()
        };
        updatedRequest.comments = [...request.comments, newComment];
        break;
    }

    updatedRequest.statusHistory = newHistory;
    onRequestUpdate(updatedRequest);
    setActionModalOpen(false);
    
    toast({
      title: "Success",
      description: "Action completed successfully"
    });
  };

  const getAvailableActions = () => {
    const actions: { label: string; action: string; variant?: 'default' | 'destructive' }[] = [];

    if (userRole === 'line_manager') {
      if (request.status === 'pending_manager_approval') {
        actions.push({ label: 'Approve & Assign', action: 'manager_approve' });
        actions.push({ label: 'Reject', action: 'manager_reject', variant: 'destructive' });
      }
      if (request.status === 'manager_review_test_cases') {
        actions.push({ label: 'Approve Test Cases', action: 'manager_approve_test_cases' });
        actions.push({ label: 'Reject', action: 'manager_reject', variant: 'destructive' });
      }
    }

    if (userRole === 'end_user' && request.requestors.includes(currentUser.id)) {
      if (request.status === 'pending_user_approval') {
        actions.push({ label: 'Approve', action: 'user_approve' });
        actions.push({ label: 'Reject', action: 'user_reject', variant: 'destructive' });
      }
      if (request.status === 'uat_signoff') {
        actions.push({ label: 'Complete UAT Sign-off', action: 'uat_signoff' });
      }
    }

    if (userRole === 'developer' && request.assignedDevelopers?.includes(currentUser.id)) {
      if (request.status === 'user_approved') {
        actions.push({ label: 'Add Test Cases & Impact Analysis', action: 'add_test_cases' });
      }
      if (request.status === 'pending_design_review') {
        actions.push({ label: 'Submit Design & Start Development', action: 'add_design' });
      }
      if (request.status === 'in_development' || request.status === 'uat_release') {
        actions.push({ label: 'Add Release', action: 'add_release' });
      }
      if (request.status === 'uat_release') {
        actions.push({ label: 'Submit for UAT Sign-off', action: 'submit_uat_signoff' });
      }
      if (request.status === 'uat_signoff' || request.status === 'cab_review') {
        actions.push({ label: 'Promote to CAB', action: 'promote_cab' });
      }
      if (request.status === 'cab_review') {
        actions.push({ label: 'Release to Production', action: 'production_release' });
      }
      if (request.status === 'production_release') {
        actions.push({ label: 'Complete Request', action: 'complete_request' });
      }
    }

    actions.push({ label: 'Add Comment', action: 'add_comment' });

    return actions;
  };

  const getTestCaseIcon = (status: TestCaseStatus) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partially_passed': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const typeLabels = {
    small_enhancement: 'Small Enhancement',
    enhancement: 'Enhancement',
    bug_fix: 'Bug Fix',
    user_support: 'User Support'
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{request.title}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono text-muted-foreground">{request.id}</span>
                  <Badge variant="outline">{typeLabels[request.type]}</Badge>
                  <StatusBadge status={request.status} />
                  <PriorityBadge priority={request.priority} />
                </div>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-200px)]">
            <div className="space-y-6 pr-4">
              <RequestTimeline 
                statusHistory={request.statusHistory} 
                currentStatus={request.status}
                orientation="horizontal"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Description</h4>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Implementation Scope</h4>
                  <p className="text-sm text-muted-foreground">{request.implementationScope}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">System</h4>
                  <p className="text-sm text-muted-foreground">{request.system}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Due Date</h4>
                  <p className="text-sm text-muted-foreground">{format(request.dueDate, 'MM/dd/yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Created By</h4>
                  <p className="text-sm text-muted-foreground">{request.createdByName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Requestors</h4>
                  <div className="flex flex-wrap gap-1">
                    {request.requestorNames.map((name, idx) => (
                      <Badge key={idx} variant="secondary">{name}</Badge>
                    ))}
                  </div>
                </div>
                {request.assignedDeveloperNames && request.assignedDeveloperNames.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Assigned Developers</h4>
                    <div className="flex flex-wrap gap-1">
                      {request.assignedDeveloperNames.map((name, idx) => (
                        <Badge key={idx} variant="secondary">{name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {request.impactAnalysis && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Impact Analysis</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.impactAnalysis}</p>
                  </div>
                </div>
              )}

              {request.testCases.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Test Cases</h4>
                  <div className="space-y-2">
                    {request.testCases.map((tc) => (
                      <div key={tc.id} className="bg-muted/30 rounded-lg p-3 flex items-start gap-3">
                        {getTestCaseIcon(tc.status)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{tc.description}</p>
                          {tc.isPreDefined && <Badge variant="outline" className="text-xs mt-1">Pre-defined</Badge>}
                          {tc.testedByName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tested by {tc.testedByName} on {tc.testedAt && format(tc.testedAt, 'MM/dd/yyyy')}
                            </p>
                          )}
                          {tc.comments && (
                            <p className="text-xs text-muted-foreground italic mt-1">"{tc.comments}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {request.architectureDesign && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Architecture Design</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.architectureDesign}</p>
                  </div>
                </div>
              )}

              {request.releases.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Releases</h4>
                  <div className="space-y-2">
                    {request.releases.map((rel) => (
                      <div key={rel.id} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant={rel.type === 'binary' ? 'default' : 'secondary'}>{rel.type.toUpperCase()}</Badge>
                            <span className="text-sm font-mono ml-2">{rel.rfcCode}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {rel.releasedAt && format(rel.releasedAt, 'MM/dd/yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{rel.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Released by {rel.releasedByName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {request.postImplementationReview && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Post Implementation Review</h4>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.postImplementationReview}</p>
                  </div>
                </div>
              )}

              {request.comments.length > 0 && (
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
          </ScrollArea>

          <Separator />

          <div className="flex gap-2 flex-wrap">
            {getAvailableActions().map((action, idx) => (
              <Button
                key={idx}
                onClick={() => handleAction(action.action)}
                variant={action.variant || 'default'}
                size="sm"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'manager_approve' && 'Approve & Assign Developers'}
              {actionType === 'manager_reject' && 'Reject Request'}
              {actionType === 'user_approve' && 'Approve Request'}
              {actionType === 'user_reject' && 'Reject Request'}
              {actionType === 'add_test_cases' && 'Add Test Cases & Impact Analysis'}
              {actionType === 'manager_approve_test_cases' && 'Approve Test Cases'}
              {actionType === 'add_design' && 'Submit Architecture Design'}
              {actionType === 'add_release' && 'Add Release'}
              {actionType === 'submit_uat_signoff' && 'Submit for UAT Sign-off'}
              {actionType === 'uat_signoff' && 'UAT Sign-off'}
              {actionType === 'complete_request' && 'Complete Request'}
              {actionType === 'add_comment' && 'Add Comment'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {actionType === 'manager_approve' && (
              <>
                <div>
                  <Label>Select Developers *</Label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {developers.map(dev => (
                      <div key={dev.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`dev-${dev.id}`}
                          checked={selectedDevelopers.includes(dev.id)}
                          onChange={() => {
                            setSelectedDevelopers(prev =>
                              prev.includes(dev.id)
                                ? prev.filter(id => id !== dev.id)
                                : [...prev, dev.id]
                            );
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`dev-${dev.id}`} className="text-sm cursor-pointer">
                          {dev.name} ({dev.team})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Comments (Optional)</Label>
                  <Textarea
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}

            {actionType === 'add_test_cases' && (
              <>
                <div>
                  <Label>Impact Analysis *</Label>
                  <Textarea
                    placeholder="Describe the impact of this change..."
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    rows={4}
                  />
                </div>
                {availableScenarios.length > 0 && (
                  <div>
                    <Label>Pre-defined Test Scenarios</Label>
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {availableScenarios.map(scenario => (
                        <div key={scenario.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`scenario-${scenario.id}`}
                            checked={selectedScenarios.includes(scenario.id)}
                            onChange={() => {
                              setSelectedScenarios(prev =>
                                prev.includes(scenario.id)
                                  ? prev.filter(id => id !== scenario.id)
                                  : [...prev, scenario.id]
                              );
                            }}
                            className="rounded"
                          />
                          <label htmlFor={`scenario-${scenario.id}`} className="text-sm cursor-pointer">
                            {scenario.scenarioName}: {scenario.description}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Custom Test Cases (one per line)</Label>
                  <Textarea
                    placeholder="Enter custom test cases..."
                    value={testCaseText}
                    onChange={(e) => setTestCaseText(e.target.value)}
                    rows={6}
                  />
                </div>
              </>
            )}

            {actionType === 'add_design' && (
              <div>
                <Label>Architecture Design & Design Review *</Label>
                <Textarea
                  placeholder="Describe the architecture design and design review details..."
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  rows={8}
                />
              </div>
            )}

            {actionType === 'add_release' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Release Type *</Label>
                    <Select value={releaseType} onValueChange={(v: ReleaseType) => setReleaseType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="binary">Binary</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>RFC Code *</Label>
                    <Input
                      placeholder="e.g., RFC-2024-001"
                      value={rfcCode}
                      onChange={(e) => setRfcCode(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Release Description *</Label>
                  <Textarea
                    placeholder="Describe the release..."
                    value={releaseDescription}
                    onChange={(e) => setReleaseDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </>
            )}

            {actionType === 'uat_signoff' && (
              <>
                <div>
                  <Label>Test Case Results</Label>
                  <div className="space-y-3 mt-2">
                    {request.testCases.map(tc => (
                      <div key={tc.id} className="border rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium">{tc.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Status</Label>
                            <Select 
                              value={testCaseStatuses[tc.id] || 'pending'} 
                              onValueChange={(v: TestCaseStatus) => {
                                setTestCaseStatuses(prev => ({ ...prev, [tc.id]: v }));
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="passed">Passed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="partially_passed">Partially Passed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Comments</Label>
                            <Input
                              className="h-8"
                              placeholder="Optional comments"
                              value={testCaseComments[tc.id] || ''}
                              onChange={(e) => {
                                setTestCaseComments(prev => ({ ...prev, [tc.id]: e.target.value }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {Object.values(testCaseStatuses).some(s => s === 'failed' || s === 'partially_passed') && (
                  <div>
                    <Label>Approval Justification * (Required for failed/partial tests)</Label>
                    <Textarea
                      placeholder="Explain why you're approving despite test failures..."
                      value={approvalJustification}
                      onChange={(e) => setApprovalJustification(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </>
            )}

            {actionType === 'complete_request' && (
              <div>
                <Label>Post Implementation Review & Release Notes *</Label>
                <Textarea
                  placeholder="Provide post implementation review and release notes..."
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  rows={8}
                />
              </div>
            )}

            {(actionType === 'manager_reject' || actionType === 'user_reject' || 
              actionType === 'user_approve' || actionType === 'manager_approve_test_cases' || 
              actionType === 'add_comment') && (
              <div>
                <Label>{actionType === 'add_comment' ? 'Comment *' : 'Comments'}</Label>
                <Textarea
                  placeholder={actionType === 'add_comment' ? 'Enter your comment...' : 'Optional comments...'}
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={executeAction}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
