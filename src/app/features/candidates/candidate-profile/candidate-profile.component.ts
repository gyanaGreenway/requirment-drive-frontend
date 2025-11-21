import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CandidateService } from '../../../core/services/candidate.service';
import { AuthService } from '../../../core/services/auth';
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
  candidateId: number | null = null;
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
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.candidateId = this.authService.getCandidateId();
    console.log('Initial candidateId from auth:', this.candidateId);
    
    // Debug: Check localStorage
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from auth:', currentUser);
    
    if (!this.candidateId) {
      console.log('No candidateId found, trying to fetch from backend...');
      this.loading = true;
      this.authService.getCurrentUserProfile().subscribe({
        next: (profile) => {
          console.log('Profile from backend:', profile);
          this.candidateId = profile.candidateId || profile.id;
          console.log('Extracted candidateId:', this.candidateId);
          if (this.candidateId) {
            this.loadCandidateProfile();
          } else {
            this.error = 'Unable to load your profile. Please login again.';
            this.loading = false;
            setTimeout(() => this.router.navigate(['/candidate-login']), 2000);
          }
        },
        error: (err) => {
          this.error = 'Please login to view your profile.';
          this.loading = false;
          console.error('Error fetching profile:', err);
          setTimeout(() => this.router.navigate(['/candidate-login']), 2000);
        }
      });
    } else {
      console.log('Using candidateId:', this.candidateId);
      this.loadCandidateProfile();
    }
  }

  loadCandidateProfile(): void {
    if (!this.candidateId) {
      this.error = 'Candidate ID not available';
      return;
    }
    
    console.log('Loading candidate profile for ID:', this.candidateId);
    this.loading = true;
    this.candidateService.getCandidate(this.candidateId).subscribe({
      next: (candidate) => {
        console.log('Candidate profile loaded:', candidate);
        this.candidate = candidate;
        this.populateForm(candidate);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load candidate profile:', err);
        this.error = `Failed to load candidate profile. ${err.status === 403 ? 'Access denied - you may not have permission to view this profile.' : ''}`;
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
    
    // Merge personalDetails, keeping defaults for empty values
    if (candidate.personalDetails) {
      this.personalDetails = {
        dateOfBirth: candidate.personalDetails.dateOfBirth || '',
        gender: candidate.personalDetails.gender || 'Male',
        nationality: candidate.personalDetails.nationality || '',
        maritalStatus: candidate.personalDetails.maritalStatus || 'Single',
        address: candidate.personalDetails.address || '',
        city: candidate.personalDetails.city || '',
        state: candidate.personalDetails.state || '',
        zipCode: candidate.personalDetails.zipCode || '',
        country: candidate.personalDetails.country || ''
      };
    }
  }

  saveProfile(): void {
    if (!this.candidateId) {
      this.error = 'Candidate ID not available. Please login again.';
      return;
    }
    
    if (!this.validateForm()) {
      this.error = 'Please fill in all required fields';
      return;
    }

    if (!this.candidate?.rowVersion) {
      this.error = 'Unable to save - missing version information. Please reload the page.';
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
      personalDetails: this.personalDetails,
      rowVersion: this.candidate.rowVersion
    };

    console.log('Saving candidate profile with DTO:', updateDto);

    this.candidateService.updateCandidate(updateDto).subscribe({
      next: (response) => {
        console.log('Save successful, response:', response);
        this.successMessage = 'Profile saved successfully!';
        this.candidate = response;
        this.saving = false;
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Save failed:', err);
        this.error = err.error?.title || 'Failed to save profile. Please try again.';
        
        // Show validation errors if present
        if (err.error?.errors) {
          const validationErrors = Object.entries(err.error.errors)
            .map(([key, msgs]: [string, any]) => `${key}: ${msgs.join(', ')}`)
            .join('\n');
          this.error = `Validation errors:\n${validationErrors}`;
        }
        
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
