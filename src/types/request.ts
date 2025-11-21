export type RequestType = 'small_enhancement' | 'enhancement' | 'bug_fix' | 'user_support';

export type RequestStatus = 
  | 'pending_manager_approval'
  | 'pending_user_approval'
  | 'user_approved'
  | 'user_rejected'
  | 'manager_review_test_cases'
  | 'pending_design_review'
  | 'in_development'
  | 'uat_release'
  | 'uat_signoff'
  | 'cab_review'
  | 'production_release'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type UserRole = 'developer' | 'line_manager' | 'end_user' | 'devops';

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';

export type ReleaseType = 'binary' | 'database';

export type TestCaseStatus = 'passed' | 'failed' | 'partially_passed' | 'pending';

export type ReleaseStatus = 'pending' | 'concluded' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  team?: string;
}

export interface TestCase {
  id: string;
  description: string;
  status: TestCaseStatus;
  testedBy?: string;
  testedByName?: string;
  testedAt?: Date;
  comments?: string;
  attachments?: Attachment[];
  isPreDefined?: boolean;
  systemScenarioId?: string;
}

export interface Release {
  id: string;
  type: ReleaseType;
  rfcCode: string;
  description: string;
  releasedBy?: string;
  releasedByName?: string;
  releasedAt?: Date;
  isManual: boolean;
  status?: ReleaseStatus;
}

export interface Comment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface StatusHistory {
  status: RequestStatus;
  changedBy: string;
  changedByName: string;
  changedAt: Date;
  comment?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  stage: RequestStatus;
  size: number;
}

export interface Request {
  id: string;
  title: string;
  type: RequestType;
  description: string;
  implementationScope: string;
  status: RequestStatus;
  priority: Priority;
  system: string;
  
  // Requestors (multiple users)
  requestors: string[];
  requestorNames: string[];
  
  // Assigned developers (multiple)
  assignedDevelopers?: string[];
  assignedDeveloperNames?: string[];
  
  createdBy: string;
  createdByName: string;
  lineManager?: string;
  lineManagerName?: string;
  
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  
  // Test cases with status tracking
  testCases: TestCase[];
  
  // Impact Analysis
  impactAnalysis?: string;
  
  // Architecture & Design
  architectureDesign?: string;
  designReview?: string;
  
  // Releases
  releases: Release[];
  
  // Post Implementation
  postImplementationReview?: string;
  releaseNotes?: string;
  
  // User approval justification
  userApprovalJustification?: string;
  
  comments: Comment[];
  statusHistory: StatusHistory[];
  attachments: Attachment[];
}

export interface Notification {
  id: string;
  type: 'approval' | 'status_update' | 'comment' | 'assignment';
  requestId: string;
  requestTitle: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface SearchAttribute {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date';
  options?: string[];
}

export interface SystemScenario {
  id: string;
  systemName: string;
  scenarioName: string;
  description: string;
}