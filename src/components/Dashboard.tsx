import { useState, useMemo } from 'react';
import { Request, Notification, UserRole, RequestType, Priority } from '@/types/request';
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
  Columns3,
  ChevronLeft,
  ChevronRight,
  Zap,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search
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
  DropdownMenuCheckboxItem,
} from './ui/dropdown-menu';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from './ui/use-toast';
import { differenceInDays, differenceInMonths, addWeeks } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

type FilterType = 'all' | 'pending_actions' | 'overdue' | 'dormant' | 'emergency' | 'top_system' | 'due_2weeks';
type SortField = 'id' | 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function Dashboard() {
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [userRole] = useState<UserRole>(currentUser.role);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['id', 'title', 'status', 'priority', 'assignee', 'system', 'dueDate']);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Sorting states
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  
  // New request form fields
  const [newRequestTitle, setNewRequestTitle] = useState('');
  const [newRequestType, setNewRequestType] = useState<RequestType>('enhancement');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [newRequestImplementationScope, setNewRequestImplementationScope] = useState('');
  const [newRequestSystem, setNewRequestSystem] = useState('');
  const [newRequestPriority, setNewRequestPriority] = useState<Priority>('medium');
  const [newRequestDueDate, setNewRequestDueDate] = useState<Date>();
  const [selectedRequestors, setSelectedRequestors] = useState<string[]>([]);
  
  const { toast } = useToast();

  const availableColumns = [
    { id: 'id', label: 'ID' },
    { id: 'title', label: 'Title' },
    { id: 'status', label: 'Status' },
    { id: 'priority', label: 'Priority' },
    { id: 'assignee', label: 'Assignee' },
    { id: 'system', label: 'System' },
    { id: 'dueDate', label: 'Due Date' }
  ];

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const toggleRequestor = (userId: string) => {
    setSelectedRequestors(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Calculate gauge metrics
  const gaugeMetrics = useMemo(() => {
    const now = new Date();
    const ongoing = requests.filter(r => 
      r.status !== 'completed' && r.status !== 'rejected' && r.status !== 'cancelled'
    ).length;
    
    const pendingActions = requests.filter(r => {
      if (userRole === 'developer') {
        return r.assignedDevelopers?.includes(currentUser.id) && 
          (r.status === 'user_approved' || r.status === 'in_development' || r.status === 'uat_release');
      } else if (userRole === 'line_manager') {
        return r.status === 'pending_manager_approval' || r.status === 'manager_review_test_cases';
      } else if (userRole === 'end_user') {
        return (r.status === 'pending_user_approval' && r.requestors.includes(currentUser.id)) ||
               (r.status === 'uat_signoff' && r.requestors.includes(currentUser.id));
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

  const topSystemData = useMemo(() => {
    const systemCounts = requests.reduce((acc, r) => {
      if (r.system && r.status !== 'completed' && r.status !== 'cancelled') {
        acc[r.system] = (acc[r.system] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const sorted = Object.entries(systemCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { name: sorted[0][0], count: sorted[0][1] } : null;
  }, [requests]);

  const due2WeeksCount = useMemo(() => {
    const now = new Date();
    const twoWeeksFromNow = addWeeks(now, 2);
    return requests.filter(r => 
      r.dueDate && 
      new Date(r.dueDate) >= now && 
      new Date(r.dueDate) <= twoWeeksFromNow &&
      r.status !== 'completed' && r.status !== 'cancelled'
    ).length;
  }, [requests]);

  const parseSearchQuery = (query: string) => {
    const filters: any = {};
    
    if (query.includes('*')) {
      const likePattern = query.replace(/\*/g, '');
      return { likePattern };
    }
    
    const parts = query.split(/\s+(AND|OR)\s+/i);
    
    parts.forEach(part => {
      if (part.includes('=')) {
        const [key, value] = part.split('=').map(s => s.trim());
        filters[key.toLowerCase()] = value.toLowerCase();
      }
    });
    
    return filters;
  };

  const parseAdvancedSearch = (query: string) => {
    const filters: any = {};
    
    if (query.includes('*')) {
      const likePattern = query.replace(/\*/g, '');
      return { likePattern };
    }
    
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
    const now = new Date();
    const twoWeeksFromNow = addWeeks(now, 2);

    switch (activeFilter) {
      case 'pending_actions':
        if (userRole === 'developer') {
          filtered = requests.filter(r => 
            r.assignedDevelopers?.includes(currentUser.id) && 
            (r.status === 'user_approved' || r.status === 'in_development' || r.status === 'uat_release')
          );
        } else if (userRole === 'line_manager') {
          filtered = requests.filter(r => 
            r.status === 'pending_manager_approval' || r.status === 'manager_review_test_cases'
          );
        } else if (userRole === 'end_user') {
          filtered = requests.filter(r => 
            r.requestors.includes(currentUser.id) && 
            (r.status === 'pending_user_approval' || r.status === 'uat_signoff')
          );
        }
        break;
      case 'overdue':
        filtered = requests.filter(r => {
          if (!r.dueDate) return false;
          return new Date(r.dueDate) < now && 
            r.status !== 'completed' && r.status !== 'cancelled';
        });
        break;
      case 'dormant':
        filtered = requests.filter(r => {
          const daysSinceUpdate = differenceInDays(now, new Date(r.updatedAt));
          return daysSinceUpdate > 30 && 
            r.status !== 'completed' && r.status !== 'cancelled';
        });
        break;
      case 'emergency':
        filtered = requests.filter(r => r.priority === 'emergency');
        break;
      case 'top_system':
        if (topSystemData) {
          filtered = requests.filter(r => 
            r.system === topSystemData.name && 
            r.status !== 'completed' && r.status !== 'cancelled'
          );
        }
        break;
      case 'due_2weeks':
        filtered = requests.filter(r => 
          r.dueDate && 
          new Date(r.dueDate) >= now && 
          new Date(r.dueDate) <= twoWeeksFromNow &&
          r.status !== 'completed' && r.status !== 'cancelled'
        );
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      if (query.includes('=')) {
        const filters = parseAdvancedSearch(query);
        
        filtered = filtered.filter(request => {
          if (filters.id && !request.id.toLowerCase().includes(filters.id)) return false;
          if (filters.title && !request.title.toLowerCase().includes(filters.title)) return false;
          if (filters.status && !request.status.toLowerCase().includes(filters.status)) return false;
          if (filters.priority && !request.priority.toLowerCase().includes(filters.priority)) return false;
          if (filters.system && !request.system?.toLowerCase().includes(filters.system)) return false;
          if (filters.assignee) {
            const assignees = request.assignedDevelopers?.map(id => {
              const user = mockUsers.find(u => u.id === id);
              return user?.name.toLowerCase() || '';
            }) || [];
            if (!assignees.some(name => name.includes(filters.assignee!))) return false;
          }
          return true;
        });
      } else {
        filtered = filtered.filter(request => {
          const simpleMatch = 
            request.id.toLowerCase().includes(query) ||
            request.title.toLowerCase().includes(query) ||
            request.status.toLowerCase().includes(query) ||
            request.priority.toLowerCase().includes(query) ||
            request.system?.toLowerCase().includes(query);
          
          return simpleMatch;
        });
      }
    }

    return filtered;
  }, [requests, searchQuery, activeFilter, userRole, topSystemData]);

  const sortedRequests = useMemo(() => {
    const sorted = [...filteredRequests];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { emergency: 5, urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredRequests, sortField, sortDirection]);

  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedRequests.slice(startIndex, endIndex);
  }, [sortedRequests, currentPage]);

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
    if (!newRequestTitle.trim() || !newRequestDescription.trim() || !newRequestImplementationScope.trim() || 
        !newRequestSystem.trim() || selectedRequestors.length === 0 || !newRequestDueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Bug fixes can only have emergency priority
    if (newRequestType === 'bug_fix' && newRequestPriority !== 'emergency') {
      toast({
        title: "Error",
        description: "Bug fixes must have Emergency priority",
        variant: "destructive"
      });
      return;
    }

    const requestorUsers = mockUsers.filter(u => selectedRequestors.includes(u.id));
    const lineManager = mockUsers.find(u => u.role === 'line_manager');

    const newRequest: Request = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      title: newRequestTitle,
      type: newRequestType,
      description: newRequestDescription,
      implementationScope: newRequestImplementationScope,
      status: 'pending_manager_approval',
      priority: newRequestPriority,
      system: newRequestSystem,
      requestors: selectedRequestors,
      requestorNames: requestorUsers.map(u => u.name),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      lineManager: lineManager?.id,
      lineManagerName: lineManager?.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: newRequestDueDate,
      testCases: [],
      releases: [],
      comments: [],
      statusHistory: [{
        status: 'pending_manager_approval',
        changedBy: currentUser.id,
        changedByName: currentUser.name,
        changedAt: new Date(),
        comment: 'Request created'
      }],
      attachments: []
    };

    setRequests(prev => [newRequest, ...prev]);
    setNewRequestModalOpen(false);
    
    // Reset form
    setNewRequestTitle('');
    setNewRequestType('enhancement');
    setNewRequestDescription('');
    setNewRequestImplementationScope('');
    setNewRequestSystem('');
    setNewRequestPriority('medium');
    setNewRequestDueDate(undefined);
    setSelectedRequestors([]);

    toast({
      title: "Request Created",
      description: `Request ${newRequest.id} has been created successfully`,
    });
  };

  const handleGenerateReport = (reportType: string, dateRange: DateRange | undefined) => {
    toast({
      title: "Report Generated",
      description: `${reportType} report has been generated`,
    });
  };

  const handleRequestUpdate = (updatedRequest: Request) => {
    setRequests(prev =>
      prev.map(r => r.id === updatedRequest.id ? updatedRequest : r)
    );
    setSelectedRequest(updatedRequest);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 inline" />
      : <ArrowDown className="w-3 h-3 ml-1 inline" />;
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
              
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {currentUser.name[0]}
              </div>
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

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
            size="sm"
          >
            All Requests
          </Button>
          <Button 
            variant={activeFilter === 'pending_actions' ? 'default' : 'outline'}
            onClick={() => { setActiveFilter('pending_actions'); setCurrentPage(1); }}
            size="sm"
          >
            Pending Actions ({gaugeMetrics.pendingActions})
          </Button>
          <Button 
            variant={activeFilter === 'overdue' ? 'default' : 'outline'}
            onClick={() => { setActiveFilter('overdue'); setCurrentPage(1); }}
            size="sm"
          >
            Overdue ({gaugeMetrics.overdue})
          </Button>
          <Button 
            variant={activeFilter === 'dormant' ? 'default' : 'outline'}
            onClick={() => { setActiveFilter('dormant'); setCurrentPage(1); }}
            size="sm"
            className="flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Dormant ({gaugeMetrics.dormant})
          </Button>
          <Button 
            variant={activeFilter === 'emergency' ? 'default' : 'outline'}
            onClick={() => { setActiveFilter('emergency'); setCurrentPage(1); }}
            size="sm"
          >
            Emergency ({gaugeMetrics.emergency})
          </Button>
          {topSystemData && (
            <Button 
              variant={activeFilter === 'top_system' ? 'default' : 'outline'}
              onClick={() => { setActiveFilter('top_system'); setCurrentPage(1); }}
              size="sm"
            >
              {topSystemData.name} ({topSystemData.count})
            </Button>
          )}
          <Button 
            variant={activeFilter === 'due_2weeks' ? 'default' : 'outline'}
            onClick={() => { setActiveFilter('due_2weeks'); setCurrentPage(1); }}
            size="sm"
          >
            Due Next 2 Weeks ({due2WeeksCount})
          </Button>
        </div>

        {/* View Controls */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="w-4 h-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableColumns.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={visibleColumns.includes(col.id)}
                    onCheckedChange={() => toggleColumn(col.id)}
                  >
                    {col.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {paginatedRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, sortedRequests.length)} of {sortedRequests.length} requests
          </div>
        </div>

        {/* Column Headers */}
        {paginatedRequests.length > 0 && (
          <div className="mb-2 px-2">
            <div className="grid grid-cols-[100px_1fr_120px_120px_140px_180px_120px] gap-3 text-xs font-semibold text-muted-foreground">
              {visibleColumns.includes('id') && (
                <div 
                  className="cursor-pointer hover:text-foreground flex items-center"
                  onClick={() => handleSort('id')}
                >
                  ID{getSortIcon('id')}
                </div>
              )}
              {visibleColumns.includes('title') && (
                <div 
                  className="cursor-pointer hover:text-foreground flex items-center"
                  onClick={() => handleSort('title')}
                >
                  Title{getSortIcon('title')}
                </div>
              )}
              {visibleColumns.includes('status') && (
                <div 
                  className="text-center cursor-pointer hover:text-foreground flex items-center justify-center"
                  onClick={() => handleSort('status')}
                >
                  Status{getSortIcon('status')}
                </div>
              )}
              {visibleColumns.includes('priority') && (
                <div 
                  className="text-center cursor-pointer hover:text-foreground flex items-center justify-center"
                  onClick={() => handleSort('priority')}
                >
                  Priority{getSortIcon('priority')}
                </div>
              )}
              {visibleColumns.includes('assignee') && <div className="text-center">Assignee</div>}
              {visibleColumns.includes('system') && <div className="text-center">System</div>}
              {visibleColumns.includes('dueDate') && (
                <div 
                  className="text-center cursor-pointer hover:text-foreground flex items-center justify-center"
                  onClick={() => handleSort('dueDate')}
                >
                  Due Date{getSortIcon('dueDate')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-2">
          {paginatedRequests.length > 0 ? (
            paginatedRequests.map((request) => (
              <RequestListItem
                key={request.id}
                request={request}
                onClick={setSelectedRequest}
                viewMode="list"
                visibleColumns={visibleColumns}
              />
            ))
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <ListTodo className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No requests found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search criteria' : 'No requests match your current filter'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8"
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        userRole={userRole}
        onRequestUpdate={handleRequestUpdate}
      />

      {/* New Request Modal */}
      <Dialog open={newRequestModalOpen} onOpenChange={setNewRequestModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New IT Request</DialogTitle>
            <DialogDescription>
              Fill in all required details for your IT request
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="type">Type *</Label>
                <Select value={newRequestType} onValueChange={(v: RequestType) => {
                  setNewRequestType(v);
                  if (v === 'bug_fix') {
                    setNewRequestPriority('emergency');
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small_enhancement">Small Enhancement</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                    <SelectItem value="bug_fix">Bug Fix</SelectItem>
                    <SelectItem value="user_support">User Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the request in detail"
                value={newRequestDescription}
                onChange={(e) => setNewRequestDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="scope">Implementation Scope *</Label>
              <Textarea
                id="scope"
                placeholder="Describe the implementation scope"
                value={newRequestImplementationScope}
                onChange={(e) => setNewRequestImplementationScope(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="system">System *</Label>
                <Input
                  id="system"
                  placeholder="e.g., CRM System"
                  value={newRequestSystem}
                  onChange={(e) => setNewRequestSystem(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={newRequestPriority} 
                  onValueChange={(v: Priority) => setNewRequestPriority(v)}
                  disabled={newRequestType === 'bug_fix'}
                >
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
                {newRequestType === 'bug_fix' && (
                  <p className="text-xs text-muted-foreground mt-1">Bug fixes must have Emergency priority</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {newRequestDueDate ? format(newRequestDueDate, 'MM/dd/yyyy') : 'Select due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newRequestDueDate}
                    onSelect={setNewRequestDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Requestors * (Select at least one)</Label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {mockUsers.filter(u => u.role === 'end_user').map(user => (
                  <div key={user.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`requestor-${user.id}`}
                      checked={selectedRequestors.includes(user.id)}
                      onChange={() => toggleRequestor(user.id)}
                      className="rounded"
                    />
                    <label htmlFor={`requestor-${user.id}`} className="text-sm cursor-pointer flex-1">
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
              </div>
              {selectedRequestors.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedRequestors.map(id => {
                    const user = mockUsers.find(u => u.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {user?.name}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => toggleRequestor(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
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
    </div>
  );
}