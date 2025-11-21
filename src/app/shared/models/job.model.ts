export interface Job {
  id: number;
  publicId: string;
  title: string;
  description: string;
  department: string;
  location: string;
  salary?: number;
  salaryRange?: string;
  requirements?: string[];
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
  salary?: number;
  salaryRange?: string;
  requirements?: string[];
  closingDate?: Date;
  isActive: boolean;
}

export interface UpdateJobDto {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  salary?: number;
  salaryRange?: string;
  requirements?: string[];
  closingDate?: Date;
  isActive: boolean;
  rowVersion?: string;
}

