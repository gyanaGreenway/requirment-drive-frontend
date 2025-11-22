import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TemplateCategory = 'Onboarding' | 'Performance' | 'Leave' | 'Compensation' | 'Compliance';
type TemplateStatus = 'Active' | 'In review' | 'Archived';

interface HrTemplateRecord {
  name: string;
  category: TemplateCategory;
  description: string;
  lastUpdated: Date;
  owner: string;
  format: 'DOCX' | 'PDF' | 'Slides';
  usageCount: number;
  status: TemplateStatus;
  tags: string[];
}

@Component({
  selector: 'app-documents-hr-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents-hr-templates.component.html',
  styleUrls: ['./documents-hr-templates.component.css']
})
export class DocumentsHrTemplatesComponent {
  readonly filters: { id: 'all' | TemplateCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'Onboarding', label: 'Onboarding' },
    { id: 'Performance', label: 'Performance' },
    { id: 'Leave', label: 'Leave' },
    { id: 'Compensation', label: 'Compensation' },
    { id: 'Compliance', label: 'Compliance' }
  ];

  selectedFilter: 'all' | TemplateCategory = 'all';

  readonly templates: HrTemplateRecord[] = [
    {
      name: 'Day-0 Welcome Email Pack',
      category: 'Onboarding',
      description: 'Automated welcome email sequence including buddy introduction and culture primer.',
      lastUpdated: new Date('2025-11-16'),
      owner: 'People Experience',
      format: 'DOCX',
      usageCount: 42,
      status: 'Active',
      tags: ['New hire', 'Automation']
    },
    {
      name: 'Quarterly Performance Conversation Guide',
      category: 'Performance',
      description: 'Structured prompts for growth, metrics, and feedback loops during quarterly reviews.',
      lastUpdated: new Date('2025-11-10'),
      owner: 'L&D',
      format: 'Slides',
      usageCount: 33,
      status: 'Active',
      tags: ['Manager toolkit']
    },
    {
      name: 'Flexible Leave Policy Pack',
      category: 'Leave',
      description: 'Policy, FAQ, and form bundle for global leave scenarios including wellness resets.',
      lastUpdated: new Date('2025-10-27'),
      owner: 'HR CoE',
      format: 'PDF',
      usageCount: 21,
      status: 'In review',
      tags: ['Policy', 'Global']
    },
    {
      name: 'Sales Incentive Letter',
      category: 'Compensation',
      description: 'Editable template with variable pay logic and acknowledgement track.',
      lastUpdated: new Date('2025-11-03'),
      owner: 'Total Rewards',
      format: 'DOCX',
      usageCount: 14,
      status: 'Active',
      tags: ['Variable pay']
    },
    {
      name: 'Policy Exception Request',
      category: 'Compliance',
      description: 'Form with conditional approvals for policy exception handling.',
      lastUpdated: new Date('2025-10-15'),
      owner: 'Risk & Compliance',
      format: 'PDF',
      usageCount: 9,
      status: 'Archived',
      tags: ['Audit ready']
    }
  ];

  setFilter(filter: 'all' | TemplateCategory): void {
    this.selectedFilter = filter;
  }

  get filteredTemplates(): HrTemplateRecord[] {
    if (this.selectedFilter === 'all') {
      return this.templates;
    }
    return this.templates.filter(template => template.category === this.selectedFilter);
  }

  get activeTemplates(): number {
    return this.templates.filter(template => template.status === 'Active').length;
  }

  get inReviewTemplates(): number {
    return this.templates.filter(template => template.status === 'In review').length;
  }

  get averageUsage(): number {
    if (!this.templates.length) {
      return 0;
    }
    const totalUsage = this.templates.reduce((acc, template) => acc + template.usageCount, 0);
    return Math.round(totalUsage / this.templates.length);
  }
}
