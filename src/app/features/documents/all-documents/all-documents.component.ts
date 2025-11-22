import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type DocumentCategory = 'Policy' | 'Finance' | 'Operations' | 'People' | 'Templates';
type DocumentStatus = 'Published' | 'Draft' | 'Needs review';

interface DocumentRecord {
  title: string;
  category: DocumentCategory;
  owner: string;
  lastUpdated: Date;
  size: string;
  compliance: 'Mandatory' | 'Recommended';
  status: DocumentStatus;
  tags: string[];
  version: string;
}

@Component({
  selector: 'app-all-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-documents.component.html',
  styleUrls: ['./all-documents.component.css']
})
export class AllDocumentsComponent {
  readonly filters: { id: 'all' | DocumentCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'Policy', label: 'Policy' },
    { id: 'Finance', label: 'Finance' },
    { id: 'Operations', label: 'Operations' },
    { id: 'People', label: 'People' },
    { id: 'Templates', label: 'Templates' }
  ];

  selectedFilter: 'all' | DocumentCategory = 'all';

  readonly documents: DocumentRecord[] = [
    {
      title: 'Employee Handbook 2025',
      category: 'Policy',
      owner: 'HR CoE',
      lastUpdated: new Date('2025-11-14'),
      size: '4.8 MB',
      compliance: 'Mandatory',
      status: 'Published',
      tags: ['Culture', 'Day 1'],
      version: 'v6.2'
    },
    {
      title: 'Expense Guidelines',
      category: 'Finance',
      owner: 'Finance Ops',
      lastUpdated: new Date('2025-11-08'),
      size: '2.1 MB',
      compliance: 'Recommended',
      status: 'Published',
      tags: ['Travel', 'Reimbursement'],
      version: 'v3.1'
    },
    {
      title: 'Remote Work Playbook',
      category: 'Operations',
      owner: 'People Partners',
      lastUpdated: new Date('2025-10-29'),
      size: '3.2 MB',
      compliance: 'Mandatory',
      status: 'Needs review',
      tags: ['Hybrid', 'Policies'],
      version: 'v2.4'
    },
    {
      title: 'Manager 30-60-90 Toolkit',
      category: 'People',
      owner: 'L&D',
      lastUpdated: new Date('2025-11-18'),
      size: '1.4 MB',
      compliance: 'Recommended',
      status: 'Draft',
      tags: ['Managers', 'Growth'],
      version: 'v1.0'
    },
    {
      title: 'Offer Letter Template - APAC',
      category: 'Templates',
      owner: 'Talent Acquisition',
      lastUpdated: new Date('2025-11-02'),
      size: '890 KB',
      compliance: 'Mandatory',
      status: 'Published',
      tags: ['Hiring', 'Legal'],
      version: 'v4.0'
    }
  ];

  setFilter(filter: 'all' | DocumentCategory): void {
    this.selectedFilter = filter;
  }

  get filteredDocuments(): DocumentRecord[] {
    if (this.selectedFilter === 'all') {
      return this.documents;
    }
    return this.documents.filter(doc => doc.category === this.selectedFilter);
  }

  get totalDocuments(): number {
    return this.documents.length;
  }

  get mandatoryDocuments(): number {
    return this.documents.filter(doc => doc.compliance === 'Mandatory').length;
  }

  get recentlyUpdatedDocuments(): number {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return this.documents.filter(doc => doc.lastUpdated >= sevenDaysAgo).length;
  }

  get needsReviewCount(): number {
    return this.documents.filter(doc => doc.status === 'Needs review').length;
  }
}
