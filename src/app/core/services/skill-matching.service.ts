import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Job } from '../../shared/models/job.model';
import { Candidate } from '../../shared/models/candidate.model';

export interface JobMatch {
  job: Job;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  requirementsMet: {
    skillsRequired: boolean;
    experienceRequired: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SkillMatchingService {

  constructor() { }

  /**
   * Calculate how well a candidate's skills match a job's requirements
   * Returns match percentage (0-100) and detailed match info
   */
  calculateJobMatch(candidate: Candidate, job: Job): JobMatch {
    const candidateSkills = this.extractCandidateSkills(candidate);
    const jobRequiredSkills = this.extractJobRequiredSkills(job);
    
    // Calculate skill match
    const { matchedSkills, missingSkills, matchPercentage } = this.calculateSkillMatch(
      candidateSkills, 
      jobRequiredSkills
    );

    // Check experience requirement
    const experienceYears = this.getCandidateExperienceYears(candidate);
    const jobExperienceRequired = this.extractExperienceRequirement(job);
    const experienceRequirementMet = experienceYears >= jobExperienceRequired;

    return {
      job,
      matchPercentage,
      matchedSkills,
      missingSkills,
      requirementsMet: {
        skillsRequired: matchPercentage >= 60,
        experienceRequired: experienceRequirementMet
      }
    };
  }

  /**
   * Find all matching jobs for a candidate
   */
  findMatchingJobs(candidate: Candidate, jobs: Job[]): JobMatch[] {
    return jobs
      .map(job => this.calculateJobMatch(candidate, job))
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  /**
   * Extract candidate's skill set from various fields
   */
  private extractCandidateSkills(candidate: Candidate): string[] {
    const skills = new Set<string>();

    // Add key skills
    if (candidate.keySkills && Array.isArray(candidate.keySkills)) {
      candidate.keySkills.forEach((skill: string) => skills.add(skill.toLowerCase()));
    }

    // Add IT skills
    if (candidate.itSkills && Array.isArray(candidate.itSkills)) {
      candidate.itSkills.forEach((skill: any) => skills.add(skill.skill.toLowerCase()));
    }

    // Add skills from legacy field
    if (candidate.skills) {
      const skillsArray = candidate.skills.split(',').map((s: string) => s.trim().toLowerCase());
      skillsArray.forEach((skill: string) => skills.add(skill));
    }

    return Array.from(skills);
  }

  /**
   * Extract required skills from job description and requirements
   */
  private extractJobRequiredSkills(job: Job): string[] {
    const skills = new Set<string>();

    // Extract from requirements field (assuming it contains comma-separated or similar format)
    if (job.requirements) {
      const reqArray = job.requirements.split(',').map((r: string) => r.trim().toLowerCase());
      reqArray.forEach((req: string) => skills.add(req));
    }

    // Parse common technical terms from description
    const techKeywords = this.extractTechKeywords(job.description || '');
    techKeywords.forEach((keyword: string) => skills.add(keyword.toLowerCase()));

    return Array.from(skills);
  }

  /**
   * Extract technology keywords from job description
   */
  private extractTechKeywords(description: string): string[] {
    const commonTechKeywords = [
      'java', 'python', 'javascript', 'typescript', 'golang', 'rust', 'c++', 'c#', 'php', 'ruby',
      'angular', 'react', 'vue', 'node', 'express', 'spring', 'django', 'flask', 'laravel',
      'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'docker', 'kubernetes',
      'aws', 'gcp', 'azure', 'git', 'ci/cd', 'jenkins', 'gitlab', 'microservices', 'rest', 'graphql',
      'html', 'css', 'sass', 'webpack', 'gradle', 'maven', 'npm', 'yarn', 'linux', 'windows'
    ];

    const foundKeywords: string[] = [];
    commonTechKeywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    return foundKeywords;
  }

  /**
   * Calculate skill match between candidate and job
   */
  private calculateSkillMatch(candidateSkills: string[], jobRequiredSkills: string[]): 
    { matchPercentage: number; matchedSkills: string[]; missingSkills: string[] } {
    
    if (jobRequiredSkills.length === 0) {
      return { matchPercentage: 100, matchedSkills: [], missingSkills: [] };
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    jobRequiredSkills.forEach(requiredSkill => {
      const isSimilarSkillPresent = this.isSimilarSkillPresent(requiredSkill, candidateSkills);
      if (isSimilarSkillPresent) {
        matchedSkills.push(requiredSkill);
      } else {
        missingSkills.push(requiredSkill);
      }
    });

    const matchPercentage = Math.round((matchedSkills.length / jobRequiredSkills.length) * 100);

    return { matchPercentage, matchedSkills, missingSkills };
  }

  /**
   * Check if a similar skill exists (handles slight variations)
   */
  private isSimilarSkillPresent(requiredSkill: string, candidateSkills: string[]): boolean {
    const required = requiredSkill.toLowerCase().trim();
    
    // Exact match
    if (candidateSkills.some(skill => skill === required)) {
      return true;
    }

    // Substring match (e.g., "JavaScript" matches "JS")
    if (candidateSkills.some(skill => required.includes(skill) || skill.includes(required))) {
      return true;
    }

    // Framework/Language family match
    const skillFamilies: { [key: string]: string[] } = {
      'javascript': ['js', 'typescript', 'ts', 'node', 'react', 'angular', 'vue'],
      'python': ['django', 'flask', 'pandas', 'numpy'],
      'java': ['spring', 'maven', 'gradle', 'j2ee'],
      'c#': ['dotnet', '.net', 'asp.net'],
      'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'nosql'],
      'devops': ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'gitlab', 'terraform'],
      'cloud': ['aws', 'azure', 'gcp', 'cloud']
    };

    for (const [family, variants] of Object.entries(skillFamilies)) {
      if (required.includes(family) || variants.some(v => required.includes(v))) {
        if (candidateSkills.some(skill => 
          variants.some(v => skill.includes(v)) || skill.includes(family)
        )) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Extract candidate's total years of experience
   */
  private getCandidateExperienceYears(candidate: Candidate): number {
    if (!candidate.employment || candidate.employment.length === 0) {
      // Fallback to legacy experience field
      if (candidate.experience) {
        const match = candidate.experience.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      }
      return 0;
    }

    let totalMonths = 0;
    candidate.employment.forEach((emp: any) => {
      const start = new Date(emp.startDate);
      const end = emp.currentlyWorking ? new Date() : new Date(emp.endDate || new Date());
      const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                        (end.getMonth() - start.getMonth());
      totalMonths += monthsDiff;
    });

    return Math.round(totalMonths / 12);
  }

  /**
   * Extract experience requirement from job description
   */
  private extractExperienceRequirement(job: Job): number {
    const description = (job.requirements || '') + ' ' + (job.description || '');
    
    // Look for patterns like "5 years", "5+ years", "minimum 5 years"
    const patterns = [
      /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience/i,
      /experience[:\s]+(\d+)\+?\s*(?:years?|yrs?)/i,
      /(?:minimum|at least|required)\s+(\d+)\s+years?/i
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    return 0; // No specific requirement found
  }

  /**
   * Get notification message for a job match
   */
  getMatchNotificationMessage(match: JobMatch): string {
    if (match.matchPercentage >= 90) {
      return `Excellent match! Your profile matches ${match.matchPercentage}% of the requirements for "${match.job.title}"`;
    } else if (match.matchPercentage >= 70) {
      return `Good match! Your profile matches ${match.matchPercentage}% of the requirements for "${match.job.title}"`;
    } else if (match.matchPercentage >= 50) {
      return `Potential match! Your profile matches ${match.matchPercentage}% of the requirements for "${match.job.title}"`;
    } else {
      return `New job posted: "${match.job.title}" - Consider developing some additional skills to increase your match`;
    }
  }

  /**
   * Get color code for match percentage
   */
  getMatchColorClass(matchPercentage: number): string {
    if (matchPercentage >= 80) {
      return 'match-excellent'; // Green
    } else if (matchPercentage >= 60) {
      return 'match-good'; // Blue
    } else if (matchPercentage >= 40) {
      return 'match-fair'; // Orange
    } else {
      return 'match-poor'; // Red
    }
  }
}
