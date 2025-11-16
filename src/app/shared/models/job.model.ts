export interface Job {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  salaryRange?: string;
  requirements?: string;
  postedDate: Date;
  closingDate?: Date;
  isActive: boolean;
  rowVersion?: string;
}

export interface CreateJobDto {
  title: string;
  description: string;
  department: string;
  location: string;
  salaryRange?: string;
  requirements?: string;
  closingDate?: Date;
  isActive: boolean;
}

export interface UpdateJobDto {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  salaryRange?: string;
  requirements?: string;
  closingDate?: Date;
  isActive: boolean;
  rowVersion?: string;
}

