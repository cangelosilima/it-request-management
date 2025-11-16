import { useState, useMemo } from 'react';
import { Request, Notification, UserRole } from '@/types/request';
import { mockRequests, mockNotifications, mockUsers, currentUser, setCurrentUser } from '@/data/mockData';
import { AdvancedSearchBar } from './AdvancedSearchBar';
import { NotificationsPanel } from './NotificationsPanel';
import { RequestListItem } from './RequestListItem';
import { RequestDetailModal } from './RequestDetailModal';
import { DashboardGauges } from './DashboardGauges';
import { ReportsDialog } from './ReportsDialog';
import { TeamManagementDialog } from './TeamManagementDialog';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  ListTodo, 
  Plus,
  Settings,
  Menu
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { differenceInDays, differenceInMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'dashboard' | 'all' | 'search'>('dashboard');
  const [userRole] = useState<UserRole>(currentUser.role);
  
  // Modal states
  const [scopeModalOpen, setScopeModalOpen] = useState(false);
  const [testCasesModalOpen, setTestCasesModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [editRequestModalOpen, setEditRequestModalOpen] = useState(false);
  
  const [scopeText, setScopeText] = useState('');
  const [testCaseText, setTestCaseText] = useState('');
  const [commentText, setCommentText] = useState('');
  
  // New request form
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [newRequestPriority, setNewRequestPriority] = useState<'low' | 'medium' | 'high' | 'urgent' | 'emergency'>('medium');
  const [newRequestSystem, setNewRequestSystem] = useState('');
  
  const { toast } = useToast();

  // Calculate gauge metrics
  const gaugeMetrics = useMemo(() => {
    const now = new Date();
    const ongoing = requests.filter(r => 
      r.status !== 'completed' && r.status !== 'rejected' && r.status !== 'cancelled'
    ).length;
    
    const pendingActions = requests.filter(r => {
      if (userRole === 'developer') {
        return r.assignedTo === currentUser.id && 
          (r.status === 'approved' || r.status === 'scope_defined');
      } else if (userRole === 'line_manager') {
        return r.status === 'pending' || r.status === 'test_cases_added';
      } else if (userRole === 'end_user') {
        return r.status === 'development_complete' && r.createdBy === currentUser.id;
      }
      return false;
    }).length;
    
    const overdue = requests.filter(r => 
      r.dueDate && new Date(r.dueDate) < now && 
      r.status !== 'completed' && r.status !== 'cancelled'
    ).length;
    
    const dormant = requests.filter(r => {
      const daysSinceUpdate = differenceInDays(now, new Date(r.updatedAt));
      return daysSinceUpdate > 30 && 
        r.status !== 'completed' && r.status !== 'cancelled';
    }).length;
    
    const emergency = requests.filter(r => r.priority === 'emergency').length;
    
    return { ongoing, pendingActions, overdue, dormant, emergency };
  }, [requests, userRole]);

  const parseSearchQuery = (query: string) => {
    const filters: any = {};
    const parts = query.split(/\s+(AND|OR)\s+/i);
    
    parts.forEach(part => {
      if (part.includes('=')) {
        const [key, value] = part.split('=').map(s => s.trim());
        filters[key.toLowerCase()] = value.toLowerCase();
      }
    });
    
    return filters;
  };

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filter by user role and view
    if (activeView === 'dashboard') {
      if (userRole === 'developer') {
        filtered = requests.filter(r => r.assignedTo === currentUser.id);
      } else if (userRole === 'line_manager') {
        filtered = requests.filter(r => 
          r.status === 'pending' || 
          r.status === 'test_cases_added' ||
          r.lineManager === currentUser.id
        );
      } else if (userRole === 'end_user') {
        filtered = requests.filter(r => 
          r.createdBy === currentUser.id || 
          r.status === 'development_complete'
        );
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filters = parseSearchQuery(query);
      
      filtered = filtered.filter(r => {
        // Simple text search
        const simpleMatch = 
          r.id.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.status.toLowerCase().includes(query) ||
          r.assignedToName?.toLowerCase().includes(query) ||
          r.createdByName.toLowerCase().includes(query) ||
          r.system?.toLowerCase().includes(query);
        
        // Advanced filter search
        let filterMatch = true;
        if (Object.keys(filters).length > 0) {
          if (filters.id && !r.id.toLowerCase().includes(filters.id)) filterMatch = false;
          if (filters.title && !r.title.toLowerCase().includes(filters.title)) filterMatch = false;
          if (filters.assignee && !r.assignedToName?.toLowerCase().includes(filters.assignee)) filterMatch = false;
          if (filters.status && r.status !== filters.status) filterMatch = false;
          if (filters.priority && r.priority !== filters.priority) filterMatch = false;
          if (filters.creator && !r.createdByName.toLowerCase().includes(filters.creator)) filterMatch = false;
          if (filters.system && !r.system?.toLowerCase().includes(filters.system)) filterMatch = false;
        }
        
        return simpleMatch || filterMatch;
      });
    }

    return filtered;
  }, [requests, searchQuery, activeView, userRole]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setActiveView('search');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const request = requests.find(r => r.id === notification.requestId);
    if (request) {
      setSelectedRequest(request);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleCreateRequest = () => {
    if (!newRequestTitle.trim() || !newRequestDescription.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newRequest: Request = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      title: newRequestTitle,
      description: newRequestDescription,
      status: 'pending',
      priority: newRequestPriority,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      lineManager: mockUsers.find(u => u.role === 'line_manager')?.id,
      lineManagerName: mockUsers.find(u => u.role === 'line_manager')?.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      comments: [],
      statusHistory: [{
        status: 'pending',
        changedBy: currentUser.id,
        changedByName: currentUser.name,
        changedAt: new Date(),
        comment: 'Request created'
      }],
      attachments: [],
      system: newRequestSystem || undefined
    };

    setRequests(prev => [newRequest, ...prev]);
    setNewRequestModalOpen(false);
    setNewRequestTitle('');
    setNewRequestDescription('');
    setNewRequestPriority('medium');
    setNewRequestSystem('');

    toast({
      title: "Request Created",
      description: `Request ${newRequest.id} has been created successfully`,
    });
  };

  const handleAddScope = () => {
    if (!selectedRequest || !scopeText.trim()) return;
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { 
              ...r, 
              scope: scopeText, 
              status: 'scope_defined' as const, 
              updatedAt: new Date(),
              statusHistory: [
                ...r.statusHistory,
                {
                  status: 'scope_defined' as const,
                  changedBy: currentUser.id,
                  changedByName: currentUser.name,
                  changedAt: new Date(),
                  comment: 'Scope defined'
                }
              ]
            }
          : r
      )
    );
    
    setScopeModalOpen(false);
    setScopeText('');
    setSelectedRequest(null);
    
    toast({
      title: "Scope Added",
      description: "Request scope has been defined successfully",
    });
  };

  const handleAddTestCases = () => {
    if (!selectedRequest || !testCaseText.trim()) return;
    
    const testCases = testCaseText.split('\n').filter(tc => tc.trim());
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { 
              ...r, 
              testCases, 
              status: 'test_cases_added' as const, 
              updatedAt: new Date(),
              statusHistory: [
                ...r.statusHistory,
                {
                  status: 'test_cases_added' as const,
                  changedBy: currentUser.id,
                  changedByName: currentUser.name,
                  changedAt: new Date()
                }
              ]
            }
          : r
      )
    );
    
    setTestCasesModalOpen(false);
    setTestCaseText('');
    setSelectedRequest(null);
    
    toast({
      title: "Test Cases Added",
      description: "Test cases have been added successfully",
    });
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { 
              ...r, 
              status: 'approved' as const, 
              updatedAt: new Date(),
              statusHistory: [
                ...r.statusHistory,
                {
                  status: 'approved' as const,
                  changedBy: currentUser.id,
                  changedByName: currentUser.name,
                  changedAt: new Date(),
                  comment: 'Approved'
                }
              ]
            }
          : r
      )
    );
    
    setSelectedRequest(null);
    
    toast({
      title: "Request Approved",
      description: "The request has been approved",
    });
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { 
              ...r, 
              status: 'rejected' as const, 
              updatedAt: new Date(),
              statusHistory: [
                ...r.statusHistory,
                {
                  status: 'rejected' as const,
                  changedBy: currentUser.id,
                  changedByName: currentUser.name,
                  changedAt: new Date(),
                  comment: 'Rejected'
                }
              ]
            }
          : r
      )
    );
    
    setSelectedRequest(null);
    
    toast({
      title: "Request Rejected",
      description: "The request has been rejected",
      variant: "destructive"
    });
  };

  const handleStartDevelopment = () => {
    if (!selectedRequest) return;
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { 
              ...r, 
              status: 'in_progress' as const, 
              updatedAt: new Date(),
              statusHistory: [
                ...r.statusHistory,
                {
                  status: 'in_progress' as const,
                  changedBy: currentUser.id,
                  changedByName: currentUser.name,
                  changedAt: new Date()
                }
              ]
            }
          : r
      )
    );
    
    setSelectedRequest(null);
    
    toast({
      title: "Development Started",
      description: "Request status updated to In Progress",
    });
  };

  const handleCompleteDevelopment = () => {
    if (!selectedRequest) return;
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { 
              ...r, 
              status: 'development_complete' as const, 
              updatedAt: new Date(),
              statusHistory: [
                ...r.statusHistory,
                {
                  status: 'development_complete' as const,
                  changedBy: currentUser.id,
                  changedByName: currentUser.name,
                  changedAt: new Date()
                }
              ]
            }
          : r
      )
    );
    
    setSelectedRequest(null);
    
    toast({
      title: "Development Complete",
      description: "Request is ready for validation",
    });
  };

  const handleValidate = () => {
    if (!selectedRequest) return;
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { 
              ...r, 
              status: 'completed' as const, 
              updatedAt: new Date(),
              statusHistory: [
                ...r.statusHistory,
                {
                  status: 'completed' as const,
                  changedBy: currentUser.id,
                  changedByName: currentUser.name,
                  changedAt: new Date(),
                  comment: 'Validated and accepted'
                }
              ]
            }
          : r
      )
    );
    
    setSelectedRequest(null);
    
    toast({
      title: "Request Completed",
      description: "The request has been validated and completed",
    });
  };

  const handleAddComment = () => {
    if (!selectedRequest || !commentText.trim()) return;
    
    const newComment = {
      id: `c${Date.now()}`,
      requestId: selectedRequest.id,
      userId: currentUser.id,
      userName: currentUser.name,
      content: commentText,
      createdAt: new Date()
    };
    
    setRequests(prev =>
      prev.map(r =>
        r.id === selectedRequest.id
          ? { ...r, comments: [...r.comments, newComment], updatedAt: new Date() }
          : r
      )
    );
    
    setCommentModalOpen(false);
    setCommentText('');
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the request",
    });
  };

  const handleGenerateReport = (reportType: string, dateRange: DateRange | undefined) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">IT Request Management</h1>
                <p className="text-sm text-muted-foreground">Track and manage IT requests</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => setNewRequestModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Request
              </Button>

              {userRole === 'line_manager' && (
                <>
                  <ReportsDialog onGenerateReport={handleGenerateReport} />
                  <TeamManagementDialog teamMembers={mockUsers} requests={requests} />
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Configuration</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Preferences</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <NotificationsPanel
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAsRead={handleMarkAsRead}
              />
              
              <Avatar>
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Gauges */}
        <DashboardGauges {...gaugeMetrics} />

        {/* Search Bar */}
        <div className="mb-8">
          <AdvancedSearchBar onSearch={handleSearch} />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              My Dashboard
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ListTodo className="w-4 h-4" />
              All Requests
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Requests List */}
        <div className="space-y-3">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <RequestListItem
                key={request.id}
                request={request}
                onClick={setSelectedRequest}
              />
            ))
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No requests found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search criteria' : 'No requests match your current view'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        userRole={userRole}
        onApprove={handleApprove}
        onReject={handleReject}
        onAddScope={() => {
          setScopeModalOpen(true);
          setSelectedRequest(null);
        }}
        onAddTestCases={() => {
          setTestCasesModalOpen(true);
          setSelectedRequest(null);
        }}
        onStartDevelopment={handleStartDevelopment}
        onCompleteDevelopment={handleCompleteDevelopment}
        onValidate={handleValidate}
        onAddComment={() => {
          setCommentModalOpen(true);
        }}
        onEdit={() => {
          setEditRequestModalOpen(true);
        }}
      />

      {/* New Request Modal */}
      <Dialog open={newRequestModalOpen} onOpenChange={setNewRequestModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
            <DialogDescription>
              Fill in the details for your new IT request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter request title"
                value={newRequestTitle}
                onChange={(e) => setNewRequestTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your request in detail"
                value={newRequestDescription}
                onChange={(e) => setNewRequestDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newRequestPriority} onValueChange={(v: any) => setNewRequestPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="system">System</Label>
                <Input
                  id="system"
                  placeholder="e.g., CRM System"
                  value={newRequestSystem}
                  onChange={(e) => setNewRequestSystem(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scope Modal */}
      <Dialog open={scopeModalOpen} onOpenChange={setScopeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Scope Definition</DialogTitle>
            <DialogDescription>
              Define the scope and requirements for this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scope">Scope Details</Label>
              <Textarea
                id="scope"
                placeholder="Enter detailed scope definition..."
                value={scopeText}
                onChange={(e) => setScopeText(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScopeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddScope}>Save Scope</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Cases Modal */}
      <Dialog open={testCasesModalOpen} onOpenChange={setTestCasesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Cases</DialogTitle>
            <DialogDescription>
              Define test cases for this request (one per line)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testcases">Test Cases</Label>
              <Textarea
                id="testcases"
                placeholder="Enter test cases (one per line)..."
                value={testCaseText}
                onChange={(e) => setTestCaseText(e.target.value)}
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestCasesModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTestCases}>Save Test Cases</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Modal */}
      <Dialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogDescription>
              Add a comment to this request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                placeholder="Enter your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddComment}>Add Comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}