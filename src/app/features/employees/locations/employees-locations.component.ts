import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type RegionFilter = 'all' | 'amer' | 'emea' | 'apac';
type FocusFilter = 'all' | 'innovation' | 'delivery' | 'support';

interface LocationProfile {
  id: string;
  city: string;
  country: string;
  region: RegionFilter;
  focus: FocusFilter;
  leader: string;
  headcount: number;
  capacity: number;
  remoteRatio: number;
  opened: Date;
  timezone: string;
  keyTeams: string[];
  workspaceMix: string;
  upcomingEvents: string[];
}

interface LocationMetric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'app-employees-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees-locations.component.html',
  styleUrls: ['./employees-locations.component.css']
})
export class EmployeesLocationsComponent {
  readonly overview = 'Map the reach of our hybrid workforce, from global hubs to satellite offices, with instant signal on capacity and remote mix.';

  readonly regionFilters: { id: RegionFilter; label: string }[] = [
    { id: 'all', label: 'All regions' },
    { id: 'amer', label: 'Americas' },
    { id: 'emea', label: 'EMEA' },
    { id: 'apac', label: 'APAC' }
  ];

  readonly focusFilters: { id: FocusFilter; label: string }[] = [
    { id: 'all', label: 'All site focus' },
    { id: 'innovation', label: 'Innovation hubs' },
    { id: 'delivery', label: 'Delivery centres' },
    { id: 'support', label: 'Support & operations' }
  ];

  selectedRegion: RegionFilter = 'all';
  selectedFocus: FocusFilter = 'all';
  searchTerm = '';

  readonly locations: LocationProfile[] = [
    {
      id: 'LOC-3001',
      city: 'Bengaluru',
      country: 'India',
      region: 'apac',
      focus: 'innovation',
      leader: 'Aakash Rao',
      headcount: 120,
      capacity: 150,
      remoteRatio: 0.35,
      opened: new Date('2018-06-01'),
      timezone: 'IST (UTC+5:30)',
      keyTeams: ['Platform Engineering', 'Site Reliability', 'Talent Analytics'],
      workspaceMix: 'Flexible seating · 12 collaboration labs',
      upcomingEvents: ['Architecture open house · Nov 27', 'Campus hiring day · Dec 12']
    },
    {
      id: 'LOC-3002',
      city: 'Berlin',
      country: 'Germany',
      region: 'emea',
      focus: 'innovation',
      leader: 'Amelia Chen',
      headcount: 64,
      capacity: 80,
      remoteRatio: 0.48,
      opened: new Date('2020-04-15'),
      timezone: 'CET (UTC+1)',
      keyTeams: ['Experience Design', 'Product Research', 'Brand Studio'],
      workspaceMix: 'Design studios · Immersive prototyping lab',
      upcomingEvents: ['Accessibility clinic · Nov 29', 'Design lab showcase · Dec 6']
    },
    {
      id: 'LOC-3003',
      city: 'Toronto',
      country: 'Canada',
      region: 'amer',
      focus: 'support',
      leader: 'Olivia Becker',
      headcount: 58,
      capacity: 70,
      remoteRatio: 0.62,
      opened: new Date('2019-09-02'),
      timezone: 'EST (UTC-5)',
      keyTeams: ['Customer Success', 'Enablement', 'Revenue Operations'],
      workspaceMix: 'Hybrid touchdown spaces · Client war rooms',
      upcomingEvents: ['Customer advisory summit · Dec 3']
    },
    {
      id: 'LOC-3004',
      city: 'Singapore',
      country: 'Singapore',
      region: 'apac',
      focus: 'delivery',
      leader: 'Haruka Sato',
      headcount: 46,
      capacity: 60,
      remoteRatio: 0.41,
      opened: new Date('2021-02-18'),
      timezone: 'SGT (UTC+8)',
      keyTeams: ['Customer Success', 'Professional Services'],
      workspaceMix: 'Client briefing centre · 24x7 support bay',
      upcomingEvents: ['Partner training camp · Dec 9']
    }
  ];

  get metrics(): LocationMetric[] {
    return [
      {
        label: 'Global headcount',
        value: `${this.totalHeadcount}`,
        delta: '+18 YoY growth',
        trend: 'up'
      },
      {
        label: 'Remote mix',
        value: `${this.remoteShare}%`,
        delta: 'Balanced hybrid adoption',
        trend: 'flat'
      },
      {
        label: 'Average occupancy',
        value: `${this.averageOccupancy}%`,
        delta: 'Stay under 85% for comfort',
        trend: 'down'
      },
      {
        label: 'Site leadership NPS',
        value: '62',
        delta: '+6 vs last quarter',
        trend: 'up'
      }
    ];
  }

  get filteredLocations(): LocationProfile[] {
    return this.locations.filter(location => {
      const matchesRegion = this.selectedRegion === 'all' || location.region === this.selectedRegion;
      const matchesFocus = this.selectedFocus === 'all' || location.focus === this.selectedFocus;
      const matchesSearch = this.matchesSearch(location);
      return matchesRegion && matchesFocus && matchesSearch;
    });
  }

  get totalHeadcount(): number {
    return this.locations.reduce((acc, location) => acc + location.headcount, 0);
  }

  get remoteShare(): number {
    if (!this.locations.length) {
      return 0;
    }
    const totalRemote = this.locations.reduce((acc, location) => acc + location.remoteRatio * location.headcount, 0);
    const overallShare = totalRemote / this.totalHeadcount;
    return Math.round(overallShare * 100);
  }

  get averageOccupancy(): number {
    if (!this.locations.length) {
      return 0;
    }
    const totalCapacity = this.locations.reduce((acc, location) => acc + location.capacity, 0);
    const occupancy = (this.totalHeadcount / totalCapacity) * 100;
    return Math.round(occupancy);
  }

  setRegion(filter: RegionFilter): void {
    this.selectedRegion = filter;
  }

  setFocus(filter: FocusFilter): void {
    this.selectedFocus = filter;
  }

  getOccupancyClass(location: LocationProfile): string {
    const occupancy = this.getCapacityUsage(location);
    if (occupancy >= 90) {
      return 'occupancy-pill occupancy-pill--high';
    }
    if (occupancy <= 70) {
      return 'occupancy-pill occupancy-pill--low';
    }
    return 'occupancy-pill occupancy-pill--balanced';
  }

  getCapacityUsage(location: LocationProfile): number {
    return Math.round((location.headcount / location.capacity) * 100);
  }

  getRemoteBadge(location: LocationProfile): string {
    const share = Math.round(location.remoteRatio * 100);
    if (share >= 60) {
      return `Remote-first · ${share}%`; 
    }
    if (share >= 40) {
      return `Hybrid core · ${share}%`;
    }
    return `Office-centric · ${share}%`;
  }

  trackByLocation(_: number, location: LocationProfile): string {
    return location.id;
  }

  private matchesSearch(location: LocationProfile): boolean {
    if (!this.searchTerm.trim()) {
      return true;
    }
    const term = this.searchTerm.toLowerCase();
    return (
      `${location.city}, ${location.country}`.toLowerCase().includes(term) ||
      location.leader.toLowerCase().includes(term) ||
      location.keyTeams.some(team => team.toLowerCase().includes(term))
    );
  }
}
