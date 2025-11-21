import { Request, User, Notification, SystemScenario } from '@/types/request';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'line_manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    team: 'IT Operations'
  },
  {
    id: 'u2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    team: 'Development Team A'
  },
  {
    id: 'u3',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    team: 'Development Team B'
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'end_user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    team: 'Sales'
  },
  {
    id: 'u5',
    name: 'Robert Wilson',
    email: 'robert.wilson@company.com',
    role: 'end_user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    team: 'Marketing'
  },
  {
    id: 'u6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    role: 'developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    team: 'Development Team A'
  },
  {
    id: 'u7',
    name: 'David Martinez',
    email: 'david.martinez@company.com',
    role: 'devops',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    team: 'DevOps'
  }
];

export const systemScenarios: SystemScenario[] = [
  {
    id: 'sc1',
    systemName: 'CRM System',
    scenarioName: 'User Login',
    description: 'Verify user can login with valid credentials'
  },
  {
    id: 'sc2',
    systemName: 'CRM System',
    scenarioName: 'Create Contact',
    description: 'Verify user can create a new contact'
  },
  {
    id: 'sc3',
    systemName: 'CRM System',
    scenarioName: 'Update Contact',
    description: 'Verify user can update existing contact information'
  },
  {
    id: 'sc4',
    systemName: 'Inventory System',
    scenarioName: 'Add Product',
    description: 'Verify user can add a new product to inventory'
  },
  {
    id: 'sc5',
    systemName: 'Inventory System',
    scenarioName: 'Stock Update',
    description: 'Verify stock levels update correctly'
  }
];

export let currentUser: User = mockUsers[1]; // Default to developer

export const setCurrentUser = (user: User) => {
  currentUser = user;
};

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

export const mockRequests: Request[] = [
  {
    id: 'REQ-001',
    title: 'Add export functionality to reports',
    type: 'enhancement',
    description: 'Users need ability to export reports to Excel and PDF formats',
    implementationScope: 'Add export buttons to all report pages with format selection dropdown',
    status: 'pending_manager_approval',
    priority: 'high',
    system: 'CRM System',
    requestors: ['u4', 'u5'],
    requestorNames: ['Emily Davis', 'Robert Wilson'],
    createdBy: 'u4',
    createdByName: 'Emily Davis',
    lineManager: 'u1',
    lineManagerName: 'John Smith',
    createdAt: yesterday,
    updatedAt: yesterday,
    dueDate: nextWeek,
    testCases: [],
    releases: [],
    comments: [],
    statusHistory: [
      {
        status: 'pending_manager_approval',
        changedBy: 'u4',
        changedByName: 'Emily Davis',
        changedAt: yesterday,
        comment: 'Request created'
      }
    ],
    attachments: []
  },
  {
    id: 'REQ-002',
    title: 'Critical login bug - users locked out',
    type: 'bug_fix',
    description: 'Multiple users reporting being locked out after 3 failed login attempts with no unlock mechanism',
    implementationScope: 'Fix account unlock mechanism and add admin override capability',
    status: 'in_development',
    priority: 'emergency',
    system: 'CRM System',
    requestors: ['u4'],
    requestorNames: ['Emily Davis'],
    assignedDevelopers: ['u2', 'u6'],
    assignedDeveloperNames: ['Sarah Johnson', 'Lisa Anderson'],
    createdBy: 'u4',
    createdByName: 'Emily Davis',
    lineManager: 'u1',
    lineManagerName: 'John Smith',
    createdAt: twoWeeksAgo,
    updatedAt: yesterday,
    dueDate: now,
    testCases: [
      {
        id: 'tc1',
        description: 'Verify user can unlock account after 3 failed attempts',
        status: 'pending',
        isPreDefined: false
      },
      {
        id: 'tc2',
        description: 'Verify admin can manually unlock user accounts',
        status: 'pending',
        isPreDefined: false
      }
    ],
    impactAnalysis: 'High impact - affects all users. No data loss risk. Requires immediate deployment.',
    architectureDesign: 'Add unlock token generation service and email notification system',
    designReview: 'Reviewed and approved - follows existing authentication patterns',
    releases: [],
    comments: [
      {
        id: 'c1',
        requestId: 'REQ-002',
        userId: 'u2',
        userName: 'Sarah Johnson',
        content: 'Working on the fix, should be ready for testing by EOD',
        createdAt: yesterday
      }
    ],
    statusHistory: [
      {
        status: 'pending_manager_approval',
        changedBy: 'u4',
        changedByName: 'Emily Davis',
        changedAt: twoWeeksAgo,
        comment: 'Emergency bug reported'
      },
      {
        status: 'user_approved',
        changedBy: 'u1',
        changedByName: 'John Smith',
        changedAt: twoWeeksAgo,
        comment: 'Approved - Emergency priority'
      },
      {
        status: 'manager_review_test_cases',
        changedBy: 'u2',
        changedByName: 'Sarah Johnson',
        changedAt: lastWeek,
        comment: 'Test cases and impact analysis submitted'
      },
      {
        status: 'in_development',
        changedBy: 'u1',
        changedByName: 'John Smith',
        changedAt: lastWeek,
        comment: 'Approved for development'
      }
    ],
    attachments: []
  },
  {
    id: 'REQ-003',
    title: 'Update contact form validation',
    type: 'small_enhancement',
    description: 'Add phone number format validation to contact form',
    implementationScope: 'Add regex validation for phone numbers in contact creation/edit forms',
    status: 'uat_signoff',
    priority: 'medium',
    system: 'CRM System',
    requestors: ['u5'],
    requestorNames: ['Robert Wilson'],
    assignedDevelopers: ['u3'],
    assignedDeveloperNames: ['Mike Chen'],
    createdBy: 'u5',
    createdByName: 'Robert Wilson',
    lineManager: 'u1',
    lineManagerName: 'John Smith',
    createdAt: lastWeek,
    updatedAt: yesterday,
    dueDate: nextWeek,
    testCases: [
      {
        id: 'tc3',
        description: 'Verify phone number validation accepts valid formats',
        status: 'pending',
        isPreDefined: true,
        systemScenarioId: 'sc2'
      },
      {
        id: 'tc4',
        description: 'Verify phone number validation rejects invalid formats',
        status: 'pending',
        isPreDefined: false
      }
    ],
    impactAnalysis: 'Low impact - only affects contact form. No breaking changes.',
    architectureDesign: 'Client-side validation using regex pattern',
    designReview: 'Approved - simple validation enhancement',
    releases: [
      {
        id: 'r1',
        type: 'binary',
        rfcCode: 'RFC-2024-001',
        description: 'UAT Release - Contact form validation',
        releasedBy: 'u7',
        releasedByName: 'David Martinez',
        releasedAt: yesterday,
        isManual: false,
        status: 'concluded'
      }
    ],
    comments: [],
    statusHistory: [
      {
        status: 'pending_manager_approval',
        changedBy: 'u5',
        changedByName: 'Robert Wilson',
        changedAt: lastWeek
      },
      {
        status: 'user_approved',
        changedBy: 'u1',
        changedByName: 'John Smith',
        changedAt: lastWeek
      },
      {
        status: 'in_development',
        changedBy: 'u1',
        changedByName: 'John Smith',
        changedAt: lastWeek
      },
      {
        status: 'uat_release',
        changedBy: 'u3',
        changedByName: 'Mike Chen',
        changedAt: yesterday
      },
      {
        status: 'uat_signoff',
        changedBy: 'u3',
        changedByName: 'Mike Chen',
        changedAt: yesterday,
        comment: 'Ready for UAT testing'
      }
    ],
    attachments: []
  },
  {
    id: 'REQ-004',
    title: 'Help desk ticket system integration',
    type: 'user_support',
    description: 'Users need guidance on how to submit support tickets through the new system',
    implementationScope: 'Create user guide and training materials for new ticket system',
    status: 'completed',
    priority: 'low',
    system: 'Support Portal',
    requestors: ['u4', 'u5'],
    requestorNames: ['Emily Davis', 'Robert Wilson'],
    assignedDevelopers: ['u2'],
    assignedDeveloperNames: ['Sarah Johnson'],
    createdBy: 'u4',
    createdByName: 'Emily Davis',
    lineManager: 'u1',
    lineManagerName: 'John Smith',
    createdAt: twoWeeksAgo,
    updatedAt: yesterday,
    dueDate: lastWeek,
    testCases: [
      {
        id: 'tc5',
        description: 'Verify user guide is accessible and clear',
        status: 'passed',
        testedBy: 'u4',
        testedByName: 'Emily Davis',
        testedAt: yesterday,
        comments: 'Guide is clear and comprehensive'
      }
    ],
    impactAnalysis: 'Documentation only - no system changes',
    releases: [],
    postImplementationReview: 'Successfully deployed user guide. Positive feedback from users.',
    releaseNotes: 'Added comprehensive user guide for support ticket system',
    comments: [],
    statusHistory: [
      {
        status: 'pending_manager_approval',
        changedBy: 'u4',
        changedByName: 'Emily Davis',
        changedAt: twoWeeksAgo
      },
      {
        status: 'completed',
        changedBy: 'u2',
        changedByName: 'Sarah Johnson',
        changedAt: yesterday,
        comment: 'Documentation completed and approved'
      }
    ],
    attachments: []
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'approval',
    requestId: 'REQ-001',
    requestTitle: 'Add export functionality to reports',
    message: 'New request awaiting your approval',
    read: false,
    createdAt: yesterday
  },
  {
    id: 'n2',
    type: 'assignment',
    requestId: 'REQ-002',
    requestTitle: 'Critical login bug - users locked out',
    message: 'You have been assigned to this request',
    read: false,
    createdAt: yesterday
  },
  {
    id: 'n3',
    type: 'status_update',
    requestId: 'REQ-003',
    requestTitle: 'Update contact form validation',
    message: 'Request is ready for UAT sign-off',
    read: true,
    createdAt: yesterday
  }
];