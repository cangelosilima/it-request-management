import { Request, User, Notification, UserRole, StatusHistory, Attachment } from '@/types/request';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Developer',
    email: 'john.dev@company.com',
    role: 'developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    team: 'Development Team A'
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'sarah.mgr@company.com',
    role: 'line_manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    team: 'Management'
  },
  {
    id: '3',
    name: 'Mike User',
    email: 'mike.user@company.com',
    role: 'end_user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    team: 'Sales'
  },
  {
    id: '4',
    name: 'Emily Developer',
    email: 'emily.dev@company.com',
    role: 'developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    team: 'Development Team B'
  },
  {
    id: '5',
    name: 'Lisa User',
    email: 'lisa.user@company.com',
    role: 'end_user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    team: 'Marketing'
  }
];

// Mock requests
export const mockRequests: Request[] = [
  {
    id: 'REQ-001',
    title: 'New Employee Onboarding Portal',
    description: 'Create a portal for new employee onboarding with document upload and task tracking',
    status: 'pending',
    priority: 'high',
    createdBy: '3',
    createdByName: 'Mike User',
    lineManager: '2',
    lineManagerName: 'Sarah Manager',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    comments: [],
    statusHistory: [
      {
        status: 'pending',
        changedBy: '3',
        changedByName: 'Mike User',
        changedAt: new Date('2024-01-15'),
        comment: 'Initial request submitted'
      }
    ],
    attachments: [],
    system: 'HR Portal'
  },
  {
    id: 'REQ-002',
    title: 'Inventory Management System Update',
    description: 'Add barcode scanning functionality to existing inventory system',
    status: 'in_progress',
    priority: 'medium',
    createdBy: '5',
    createdByName: 'Lisa User',
    assignedTo: '1',
    assignedToName: 'John Developer',
    lineManager: '2',
    lineManagerName: 'Sarah Manager',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    dueDate: new Date('2024-02-10'),
    scope: 'Implement barcode scanning using device camera, integrate with existing database',
    testCases: ['Scan valid barcode', 'Handle invalid barcode', 'Update inventory count'],
    comments: [
      {
        id: 'c1',
        requestId: 'REQ-002',
        userId: '1',
        userName: 'John Developer',
        content: 'Started working on the barcode integration',
        createdAt: new Date('2024-01-20')
      }
    ],
    statusHistory: [
      {
        status: 'pending',
        changedBy: '5',
        changedByName: 'Lisa User',
        changedAt: new Date('2024-01-10')
      },
      {
        status: 'scope_defined',
        changedBy: '2',
        changedByName: 'Sarah Manager',
        changedAt: new Date('2024-01-12'),
        comment: 'Scope approved'
      },
      {
        status: 'approved',
        changedBy: '2',
        changedByName: 'Sarah Manager',
        changedAt: new Date('2024-01-15'),
        comment: 'Approved for development'
      },
      {
        status: 'in_progress',
        changedBy: '1',
        changedByName: 'John Developer',
        changedAt: new Date('2024-01-20')
      }
    ],
    attachments: [
      {
        id: 'att1',
        filename: 'requirements.pdf',
        url: '#',
        uploadedBy: '5',
        uploadedByName: 'Lisa User',
        uploadedAt: new Date('2024-01-10'),
        stage: 'pending',
        size: 245000
      }
    ],
    system: 'Inventory System'
  },
  {
    id: 'REQ-003',
    title: 'Customer Feedback Dashboard',
    description: 'Build analytics dashboard for customer feedback and ratings',
    status: 'test_cases_added',
    priority: 'medium',
    createdBy: '3',
    createdByName: 'Mike User',
    assignedTo: '4',
    assignedToName: 'Emily Developer',
    lineManager: '2',
    lineManagerName: 'Sarah Manager',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18'),
    dueDate: new Date('2024-02-20'),
    scope: 'Create dashboard with charts showing feedback trends, ratings distribution, and sentiment analysis',
    testCases: [
      'Display feedback data correctly',
      'Filter by date range',
      'Export reports to PDF',
      'Real-time updates'
    ],
    comments: [],
    statusHistory: [
      {
        status: 'pending',
        changedBy: '3',
        changedByName: 'Mike User',
        changedAt: new Date('2024-01-12')
      },
      {
        status: 'scope_defined',
        changedBy: '2',
        changedByName: 'Sarah Manager',
        changedAt: new Date('2024-01-14')
      },
      {
        status: 'test_cases_added',
        changedBy: '4',
        changedByName: 'Emily Developer',
        changedAt: new Date('2024-01-18')
      }
    ],
    attachments: [],
    system: 'CRM System'
  },
  {
    id: 'REQ-004',
    title: 'Mobile App Push Notifications',
    description: 'Implement push notification system for mobile app',
    status: 'development_complete',
    priority: 'emergency',
    createdBy: '5',
    createdByName: 'Lisa User',
    assignedTo: '1',
    assignedToName: 'John Developer',
    lineManager: '2',
    lineManagerName: 'Sarah Manager',
    createdAt: new Date('2023-12-05'),
    updatedAt: new Date('2024-01-22'),
    dueDate: new Date('2024-01-10'),
    scope: 'Integrate Firebase Cloud Messaging for push notifications',
    testCases: ['Send notification', 'Receive notification', 'Handle notification tap'],
    comments: [],
    statusHistory: [
      {
        status: 'pending',
        changedBy: '5',
        changedByName: 'Lisa User',
        changedAt: new Date('2023-12-05')
      },
      {
        status: 'approved',
        changedBy: '2',
        changedByName: 'Sarah Manager',
        changedAt: new Date('2023-12-10')
      },
      {
        status: 'in_progress',
        changedBy: '1',
        changedByName: 'John Developer',
        changedAt: new Date('2023-12-15')
      },
      {
        status: 'development_complete',
        changedBy: '1',
        changedByName: 'John Developer',
        changedAt: new Date('2024-01-22')
      }
    ],
    attachments: [],
    system: 'Mobile App'
  },
  {
    id: 'REQ-005',
    title: 'Automated Report Generation',
    description: 'Create automated monthly report generation for sales data',
    status: 'approved',
    priority: 'low',
    createdBy: '3',
    createdByName: 'Mike User',
    assignedTo: '4',
    assignedToName: 'Emily Developer',
    lineManager: '2',
    lineManagerName: 'Sarah Manager',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
    dueDate: new Date('2024-02-28'),
    scope: 'Generate PDF reports with sales charts and metrics on monthly schedule',
    testCases: ['Generate report', 'Email report', 'Schedule automation'],
    comments: [],
    statusHistory: [
      {
        status: 'pending',
        changedBy: '3',
        changedByName: 'Mike User',
        changedAt: new Date('2024-01-08')
      },
      {
        status: 'approved',
        changedBy: '2',
        changedByName: 'Sarah Manager',
        changedAt: new Date('2024-01-16')
      }
    ],
    attachments: [],
    system: 'Analytics Platform'
  },
  {
    id: 'REQ-006',
    title: 'User Authentication Enhancement',
    description: 'Add two-factor authentication to user login',
    status: 'scope_defined',
    priority: 'urgent',
    createdBy: '5',
    createdByName: 'Lisa User',
    assignedTo: '1',
    assignedToName: 'John Developer',
    lineManager: '2',
    lineManagerName: 'Sarah Manager',
    createdAt: new Date('2023-11-14'),
    updatedAt: new Date('2023-11-17'),
    dueDate: new Date('2024-01-05'),
    scope: 'Implement 2FA using SMS and authenticator app options',
    comments: [],
    statusHistory: [
      {
        status: 'pending',
        changedBy: '5',
        changedByName: 'Lisa User',
        changedAt: new Date('2023-11-14')
      },
      {
        status: 'scope_defined',
        changedBy: '2',
        changedByName: 'Sarah Manager',
        changedAt: new Date('2023-11-17')
      }
    ],
    attachments: [],
    system: 'CRM System'
  }
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'approval',
    requestId: 'REQ-001',
    requestTitle: 'New Employee Onboarding Portal',
    message: 'Pending your approval',
    read: false,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'n2',
    type: 'assignment',
    requestId: 'REQ-006',
    requestTitle: 'User Authentication Enhancement',
    message: 'Assigned to you',
    read: false,
    createdAt: new Date('2024-01-17')
  },
  {
    id: 'n3',
    type: 'status_update',
    requestId: 'REQ-004',
    requestTitle: 'Mobile App Push Notifications',
    message: 'Development completed - ready for validation',
    read: false,
    createdAt: new Date('2024-01-22')
  },
  {
    id: 'n4',
    type: 'comment',
    requestId: 'REQ-002',
    requestTitle: 'Inventory Management System Update',
    message: 'New comment added',
    read: true,
    createdAt: new Date('2024-01-20')
  }
];

// Current user (can be changed to simulate different roles)
export let currentUser: User = mockUsers[1]; // Default to manager

export const setCurrentUser = (role: UserRole) => {
  currentUser = mockUsers.find(u => u.role === role) || mockUsers[0];
};