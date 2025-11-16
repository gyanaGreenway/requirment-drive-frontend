import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CandidateService } from '../../../core/services/candidate.service';
import { 
  Candidate, 
  Employment, 
  Education, 
  ITSkill, 
  Project, 
  PersonalDetails,
  UpdateCandidateDto 
} from '../../../shared/models/candidate.model';

@Component({
  selector: 'app-candidate-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.css']
})
export class CandidateProfileComponent implements OnInit {
  candidateId: number = 1; // Should come from auth service
  candidate: Candidate | null = null;
  loading: boolean = false;
  saving: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Form sections
  activeTab: string = 'basic';
  
  // Basic Info
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phone: string = '';
  resumeHeadline: string = '';
  
  // Resume & Summary
  profileSummary: string = '';
  accomplishments: string = '';
  careerProfile: string = '';
  
  // Collections
  employment: Employment[] = [];
  education: Education[] = [];
  itSkills: ITSkill[] = [];
  projects: Project[] = [];
  keySkills: string[] = [];
  
  // Personal Details
  personalDetails: PersonalDetails = {
    dateOfBirth: '',
    gender: 'Male',
    nationality: '',
    maritalStatus: 'Single',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  };
  
  // Form states
  showAddEmployment: boolean = false;
  showAddEducation: boolean = false;
  showAddProject: boolean = false;
  showAddSkill: boolean = false;
  
  newSkillInput: string = '';
  newEmployment: Employment = this.initializeEmployment();
  newEducation: Education = this.initializeEducation();
  newProject: Project = this.initializeProject();
  newITSkill: ITSkill = { skill: '', proficiency: 'Beginner' };

  constructor(
    private candidateService: CandidateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCandidateProfile();
  }

  loadCandidateProfile(): void {
    this.loading = true;
    this.candidateService.getCandidate(this.candidateId).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.populateForm(candidate);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load candidate profile';
        console.error(err);
        this.loading = false;
      }
    });
  }

  populateForm(candidate: Candidate): void {
    this.firstName = candidate.firstName;
    this.lastName = candidate.lastName;
    this.email = candidate.email;
    this.phone = candidate.phone || '';
    this.resumeHeadline = candidate.resumeHeadline || '';
    this.profileSummary = candidate.profileSummary || '';
    this.accomplishments = candidate.accomplishments || '';
    this.careerProfile = candidate.careerProfile || '';
    this.employment = candidate.employment || [];
    this.education = candidate.education || [];
    this.itSkills = candidate.itSkills || [];
    this.projects = candidate.projects || [];
    // Normalize keySkills to always be an array
    this.keySkills = Array.isArray(candidate.keySkills) 
      ? candidate.keySkills 
      : (typeof candidate.keySkills === 'string' 
        ? candidate.keySkills.split(/[,|]/).map((s: string) => s.trim()).filter(Boolean)
        : []);
    this.personalDetails = candidate.personalDetails || this.personalDetails;
  }

  saveProfile(): void {
    if (!this.validateForm()) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.saving = true;
    this.error = null;
    this.successMessage = null;

    const updateDto: UpdateCandidateDto = {
      id: this.candidateId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      resumeHeadline: this.resumeHeadline,
      keySkills: this.keySkills,
      employment: this.employment,
      education: this.education,
      itSkills: this.itSkills,
      projects: this.projects,
      profileSummary: this.profileSummary,
      accomplishments: this.accomplishments,
      careerProfile: this.careerProfile,
      personalDetails: this.personalDetails
    };

    this.candidateService.updateCandidate(updateDto).subscribe({
      next: (response) => {
        this.successMessage = 'Profile saved successfully!';
        this.candidate = response;
        this.saving = false;
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to save profile. Please try again.';
        console.error(err);
        this.saving = false;
      }
    });
  }

  validateForm(): boolean {
    return this.firstName.trim() !== '' &&
           this.lastName.trim() !== '' &&
           this.email.trim() !== '';
  }

  // Employment Management
  addEmployment(): void {
    if (this.newEmployment.jobTitle && this.newEmployment.company) {
      this.employment.push({ ...this.newEmployment });
      this.newEmployment = this.initializeEmployment();
      this.showAddEmployment = false;
    }
  }

  removeEmployment(index: number): void {
    this.employment.splice(index, 1);
  }

  initializeEmployment(): Employment {
    return {
      jobTitle: '',
      company: '',
      workArea: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: ''
    };
  }

  // Education Management
  addEducation(): void {
    if (this.newEducation.degree && this.newEducation.institution) {
      this.education.push({ ...this.newEducation });
      this.newEducation = this.initializeEducation();
      this.showAddEducation = false;
    }
  }

  removeEducation(index: number): void {
    this.education.splice(index, 1);
  }

  initializeEducation(): Education {
    return {
      degree: '',
      field: '',
      institution: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: ''
    };
  }

  // Project Management
  addProject(): void {
    if (this.newProject.title && this.newProject.description) {
      this.projects.push({ ...this.newProject });
      this.newProject = this.initializeProject();
      this.showAddProject = false;
    }
  }

  removeProject(index: number): void {
    this.projects.splice(index, 1);
  }

  initializeProject(): Project {
    return {
      title: '',
      description: '',
      link: '',
      startDate: '',
      endDate: ''
    };
  }

  // Key Skills Management
  addKeySkill(): void {
    if (this.newSkillInput.trim() && !this.keySkills.includes(this.newSkillInput.trim())) {
      this.keySkills.push(this.newSkillInput.trim());
      this.newSkillInput = '';
    }
  }

  removeKeySkill(index: number): void {
    this.keySkills.splice(index, 1);
  }

  // IT Skills Management
  addITSkill(): void {
    if (this.newITSkill.skill.trim()) {
      this.itSkills.push({ ...this.newITSkill });
      this.newITSkill = { skill: '', proficiency: 'Beginner' };
      this.showAddSkill = false;
    }
  }

  removeITSkill(index: number): void {
    this.itSkills.splice(index, 1);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/candidate-dashboard']);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
