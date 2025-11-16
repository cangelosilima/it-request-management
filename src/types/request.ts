export type RequestStatus = 
  | 'pending'
  | 'scope_defined'
  | 'test_cases_added'
  | 'approved'
  | 'in_progress'
  | 'development_complete'
  | 'completed'
  | 'rejected'
  | 'rework_needed'
  | 'cancelled';

export type UserRole = 'developer' | 'line_manager' | 'end_user';

export type Priority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  team?: string;
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
  description: string;
  status: RequestStatus;
  priority: Priority;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  lineManager?: string;
  lineManagerName?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  scope?: string;
  testCases?: string[];
  comments: Comment[];
  statusHistory: StatusHistory[];
  attachments: Attachment[];
  system?: string;
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