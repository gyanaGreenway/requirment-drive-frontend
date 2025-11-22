import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TrendDirection = 'up' | 'down' | 'flat';
type UserStatus = 'active' | 'invited' | 'suspended';
type RiskLevel = 'low' | 'medium' | 'high';
type AccessLevel = 'full' | 'limited' | 'view' | 'none';
type MfaStatus = 'Enabled' | 'Pending';

@Component({
  selector: 'app-users-roles-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-roles-settings.component.html',
  styleUrls: ['./users-roles-settings.component.css']
})
export class UsersRolesSettingsComponent {
  readonly filters = ['All teams', 'People Ops', 'Product', 'Field recruiting'] as const;
  selectedFilter: (typeof this.filters)[number];

  readonly accessMetrics = [
    {
      label: 'Active users',
      value: '128',
      change: '+6 vs last month',
      direction: 'up' as TrendDirection
    },
    {
      label: 'Pending invites',
      value: '9',
      change: '3 expiring in 48h',
      direction: 'flat' as TrendDirection
    },
    {
      label: 'MFA coverage',
      value: '91%',
      change: '+4 pts since audit',
      direction: 'up' as TrendDirection
    },
    {
      label: 'Policy attestations',
      value: '87%',
      change: '↓ 2 pending follow-up',
      direction: 'down' as TrendDirection
    }
  ];

  readonly roleCatalog = [
    {
      name: 'HR Admin',
      members: 18,
      change: '+2 added this sprint',
      direction: 'up' as TrendDirection,
      description: 'Owns compliance, payroll and all candidate data access.',
      focus: 'Full platform ownership',
      privileges: ['Full candidate visibility', 'Policy management', 'Automation builder']
    },
    {
      name: 'Recruiter',
      members: 42,
      change: 'Stable month-over-month',
      direction: 'flat' as TrendDirection,
      description: 'Manages requisitions, interviews and offer workflows.',
      focus: 'Pipeline execution',
      privileges: ['Requisition editing', 'Interview scheduling', 'Offer drafts']
    },
    {
      name: 'Hiring Manager',
      members: 36,
      change: '↓ 1 reassigned',
      direction: 'down' as TrendDirection,
      description: 'Reviews shortlists, feedback and hiring decisions.',
      focus: 'Decision enablement',
      privileges: ['Scorecard submission', 'Offer approvals', 'Team analytics']
    },
    {
      name: 'Contractor access',
      members: 12,
      change: '+3 activated',
      direction: 'up' as TrendDirection,
      description: 'Time-bound vendor access with masked candidate data.',
      focus: 'Limited sourcing support',
      privileges: ['Masked candidate list', 'Task assignments', 'Activity logging']
    }
  ];

  readonly permissionMatrix = [
    {
      module: 'Offer management',
      criticality: 'High',
      access: [
        { role: 'HR Admin', level: 'full' as AccessLevel },
        { role: 'Recruiter', level: 'limited' as AccessLevel },
        { role: 'Hiring Manager', level: 'view' as AccessLevel }
      ],
      automation: 'Auto-escalates approvals after 24h inactivity.'
    },
    {
      module: 'Compliance & documents',
      criticality: 'High',
      access: [
        { role: 'HR Admin', level: 'full' as AccessLevel },
        { role: 'Recruiter', level: 'view' as AccessLevel },
        { role: 'Hiring Manager', level: 'none' as AccessLevel }
      ],
      automation: 'Mandatory retention reviews every 90 days.'
    },
    {
      module: 'Interview operations',
      criticality: 'Medium',
      access: [
        { role: 'HR Admin', level: 'full' as AccessLevel },
        { role: 'Recruiter', level: 'full' as AccessLevel },
        { role: 'Hiring Manager', level: 'limited' as AccessLevel }
      ],
      automation: 'Panel rotations refreshed weekly based on load.'
    },
    {
      module: 'Analytics & reports',
      criticality: 'Medium',
      access: [
        { role: 'HR Admin', level: 'full' as AccessLevel },
        { role: 'Recruiter', level: 'limited' as AccessLevel },
        { role: 'Hiring Manager', level: 'view' as AccessLevel }
      ],
      automation: 'Sensitive exports require MFA challenge.'
    }
  ];

  readonly teamRoster = [
    {
      name: 'Mamta Joshi',
      email: 'mamta@example.com',
      role: 'HR Admin',
      department: 'People Ops',
      status: 'active' as UserStatus,
      lastActive: '2m ago',
      mfa: 'Enabled' as MfaStatus,
      risk: 'low' as RiskLevel
    },
    {
      name: 'Ranjan Mehta',
      email: 'ranjan@example.com',
      role: 'Recruiter',
      department: 'Growth Hiring',
      status: 'active' as UserStatus,
      lastActive: '18m ago',
      mfa: 'Enabled' as MfaStatus,
      risk: 'medium' as RiskLevel
    },
    {
      name: 'Priya Anand',
      email: 'priya.anand@example.com',
      role: 'Hiring Manager',
      department: 'Product',
      status: 'active' as UserStatus,
      lastActive: '1h ago',
      mfa: 'Pending' as MfaStatus,
      risk: 'medium' as RiskLevel
    },
    {
      name: 'Evan Wright',
      email: 'evan.wright@example.com',
      role: 'Contractor access',
      department: 'Sourcing Squad',
      status: 'invited' as UserStatus,
      lastActive: 'Invite sent today',
      mfa: 'Pending' as MfaStatus,
      risk: 'low' as RiskLevel
    }
  ];

  readonly inviteQueue = [
    {
      email: 'natalie.ray@example.com',
      role: 'Recruiter',
      sent: 'Nov 20, 2025',
      status: 'Reminder scheduled'
    },
    {
      email: 'leo@contractpartner.io',
      role: 'Contractor access',
      sent: 'Nov 18, 2025',
      status: 'Expires in 2 days'
    },
    {
      email: 'arjun@productlead.io',
      role: 'Hiring Manager',
      sent: 'Nov 14, 2025',
      status: 'Resent today'
    }
  ];

  readonly activityFeed = [
    {
      time: '10:24 AM',
      actor: 'Mamta Joshi',
      action: 'granted offer management to',
      target: 'Field Recruiting',
      detail: 'Policy justified with hiring surge context.'
    },
    {
      time: 'Yesterday',
      actor: 'System auditor',
      action: 'flagged MFA pending for',
      target: '3 managers',
      detail: 'Follow-up nudges queued for Monday.'
    },
    {
      time: 'Nov 18',
      actor: 'Ranjan Mehta',
      action: 'revoked contractor access for',
      target: 'Vendor squad B',
      detail: 'Engagement wrapped; auto-archived assets.'
    }
  ];

  constructor() {
    this.selectedFilter = this.filters[0];
  }

  setFilter(filter: (typeof this.filters)[number]): void {
    this.selectedFilter = filter;
  }

  getTrendClass(direction: TrendDirection): string {
    return `delta delta--${direction}`;
  }

  getAccessClass(level: AccessLevel): string {
    return `access-chip access-chip--${level}`;
  }

  getStatusClass(status: UserStatus): string {
    return `status-pill status-pill--${status}`;
  }

  getRiskClass(risk: RiskLevel): string {
    return `risk-tag risk-tag--${risk}`;
  }

  getMfaClass(status: MfaStatus): string {
    return `mfa-pill mfa-pill--${status.toLowerCase()}`;
  }
}
