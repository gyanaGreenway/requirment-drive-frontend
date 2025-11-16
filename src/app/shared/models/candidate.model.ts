// Employment Record
export interface Employment {
  id?: string;
  jobTitle: string;
  company: string;
  workArea?: string;
  startDate: Date | string;
  endDate?: Date | string;
  currentlyWorking: boolean;
  description?: string;
}

// Education Record
export interface Education {
  id?: string;
  degree: string;
  field: string;
  institution: string;
  startDate: Date | string;
  endDate?: Date | string;
  grade?: string;
  description?: string;
}

// Project Record
export interface Project {
  id?: string;
  title: string;
  description: string;
  link?: string;
  startDate: Date | string;
  endDate?: Date | string;
}

// IT Skills Record
export interface ITSkill {
  id?: string;
  skill: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

// Personal Details
export interface PersonalDetails {
  dateOfBirth?: Date | string;
  gender?: 'Male' | 'Female' | 'Other';
  nationality?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumeHeadline?: string;
  keySkills?: string[]; // e.g., ['Java', 'Spring Boot', 'Angular']
  employment?: Employment[];
  education?: Education[];
  itSkills?: ITSkill[];
  projects?: Project[];
  profileSummary?: string;
  accomplishments?: string;
  careerProfile?: string;
  personalDetails?: PersonalDetails;
  skills?: string; // legacy field for backward compatibility
  experience?: string; // legacy field for backward compatibility
  isDeleted: boolean;
  rowVersion?: string;
}

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumeHeadline?: string;
  keySkills?: string[];
  profileSummary?: string;
  accomplishments?: string;
  careerProfile?: string;
  personalDetails?: PersonalDetails;
  password?: string;
}

export interface UpdateCandidateDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  resumeHeadline?: string;
  keySkills?: string[];
  employment?: Employment[];
  education?: Education[];
  itSkills?: ITSkill[];
  projects?: Project[];
  profileSummary?: string;
  accomplishments?: string;
  careerProfile?: string;
  personalDetails?: PersonalDetails;
  rowVersion?: string;
}

