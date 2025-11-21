export enum ApplicationStatus {
  New = 1,
  Shortlisted = 2,
  Rejected = 3,
  Hired = 4
}

export interface JobApplication {
  id: number;
  jobId: number;
  candidateId: number;
  status: ApplicationStatus;
  appliedDate: Date;
  notes?: string;
  job?: {
    id: number;
    title: string;
    department: string;
    location: string;
  };
  candidate?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  statusHistory?: ApplicationStatusHistory[];
  rowVersion?: string;
}

export interface ApplicationStatusHistory {
  id: number;
  applicationId: number;
  status: ApplicationStatus;
  changedDate: Date;
  changedBy?: string;
  notes?: string;
}

export interface CreateApplicationDto {
  jobId: number;
  candidateId: number;
  notes?: string;
}

export interface UpdateApplicationStatusDto {
  applicationId: number;
  status: ApplicationStatus;
  notes?: string;
  changedBy?: string;
}

export interface ApplicationFilter {
  status?: ApplicationStatus;
  jobId?: number;
  candidateId?: number;
  startDate?: Date;
  endDate?: Date;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

