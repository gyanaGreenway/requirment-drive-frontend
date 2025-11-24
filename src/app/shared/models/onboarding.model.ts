export interface Onboarding {
  id: number;
  publicId: string;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  recruiterId: number;
  recruiterName: string;
  startDate: Date;
  dueDate: Date;
  status: string;
  notes: string;
  tasksCount: number;
  completedTasksCount: number;
  documentsCount: number;
  equipmentDispatched?: boolean;
  backgroundCheckClear?: boolean;
  checklistCompletion?: number;
  tasksDueThisWeek?: number;
  manager?: string;
  buddy?: string;
  tasks?: OnboardingTask[];
  documents?: OnboardingDocument[];
}

export interface OnboardingTask {
  id: number;
  publicId: string;
  title: string;
  description: string;
  assignedToId: number;
  assignedToName: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface OnboardingDocument {
  id: number;
  publicId: string;
  fileName: string;
  url: string;
  uploadedById: number;
  uploadedByName: string;
  uploadedAt: Date;
}
