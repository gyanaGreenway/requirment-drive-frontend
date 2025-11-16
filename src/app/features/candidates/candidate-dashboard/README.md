# Candidate Dashboard - Feature Documentation

## Overview
A dedicated dashboard for candidates to track all their job applications in one place. Candidates can view application statuses, filter by status, see job details, and track their progress through the hiring pipeline.

## Features Implemented

### 1. **Application Tracking**
- View all applications submitted by the candidate
- Track each application status (New, Shortlisted, Hired, Rejected)
- See timeline of status changes for each application
- View HR notes/comments on applications

### 2. **Statistics Dashboard**
- **Total Applications**: Count of all applications submitted
- **New**: Applications awaiting review
- **Shortlisted**: Applications advanced to next stage
- **Hired**: Applications resulting in job offer
- **Rejected**: Applications not progressed

### 3. **Application Cards Display**
Each application card shows:
- **Status Indicator**: Color-coded badge with emoji
- **Job Information**: Title, Department, Location
- **Timeline**: Application date and status change dates
- **HR Notes**: Comments from HR team
- **Action Button**: Link to view full application details

### 4. **Filter by Status**
- Dropdown filter to view applications by specific status
- Options: All, New, Shortlisted, Hired, Rejected
- Real-time filtering and result count

### 5. **Responsive Design**
- Works on desktop, tablet, and mobile devices
- Grid layout adapts to screen size
- Touch-friendly interface

## File Structure

```
src/app/features/candidates/candidate-dashboard/
├── candidate-dashboard.component.ts          # Component logic
├── candidate-dashboard.component.html        # Template with status tracking
├── candidate-dashboard.component.css         # Modern styling
└── candidate-dashboard.component.spec.ts     # Unit tests
```

## Route Configuration

**New Route Added:**
```
/candidate-dashboard
```

Access this route after candidate login to view their application tracking dashboard.

## Component Details

### CandidateDashboardComponent

**Properties:**
- `candidateId`: Currently hardcoded to 1 (should be from auth service)
- `candidate`: Current candidate profile
- `applications`: Array of JobApplication objects
- `jobs`: Map of Job details for quick lookup
- `stats`: Object tracking application counts by status
- `selectedStatus`: Current filter selection
- `loading`: Loading state indicator

**Key Methods:**
- `loadCandidateData()`: Loads candidate info and applications
- `loadJobDetails()`: Fetches job details for all applications
- `calculateStats()`: Counts applications by status
- `getFilteredApplications()`: Returns applications filtered by selected status
- `getStatusClass()`: Returns CSS class for status styling
- `getStatusIcon()`: Returns emoji icon for status
- `formatDate()`: Formats dates to readable format

## Data Flow

1. Component initializes and loads:
   - Candidate profile (from CandidateService)
   - All applications for candidate (from ApplicationService)
   - Job details for each application (from JobService)

2. Statistics are calculated based on application statuses

3. User can filter by status via dropdown

4. Clicking "View Full Details" navigates to application details page

## UI Components

### Stats Grid
- Five stat cards showing application counts
- Color-coded for easy identification
- Hover effects for interactivity

### Filter Section
- Status dropdown with all options
- Result counter showing filtered applications

### Application Cards
- Clean card layout with shadow effects
- Status indicator with icon and label
- Job information (title, department, location)
- Timeline showing application and status change dates
- Notes section from HR (if available)
- Action button to view full details

### Empty State
- Friendly message when no applications exist
- "Browse Jobs" button to create new applications

## Future Enhancements

1. **Authentication Integration**
   - Replace hardcoded `candidateId: 1` with actual user from auth service
   - Add auth guard to protect route

2. **Additional Features**
   - Export applications as PDF
   - Email notifications on status changes
   - Interview schedule display
   - Application notes/comments from candidate
   - Job recommendations based on applications
   - Application withdrawal option

3. **Performance**
   - Pagination for large number of applications
   - Caching of job details
   - Infinite scroll option

4. **Analytics**
   - Application success rate
   - Time-to-hire metrics
   - Interview feedback visualization

## Usage

### For Candidates
1. Log in as a candidate
2. Navigate to `/candidate-dashboard`
3. View all applications with their current status
4. Filter by specific status to focus on relevant applications
5. Click "View Full Details" to see application timeline and HR feedback
6. Browse more jobs to submit additional applications

### For Developers
1. Import `CandidateDashboardComponent` in parent router configuration
2. Add route: `{ path: 'candidate-dashboard', component: CandidateDashboardComponent }`
3. Customize `candidateId` loading from auth service
4. Modify card styling in `candidate-dashboard.component.css` as needed
5. Update ApplicationService queries for different filtering needs

## Styling Notes

- **Color Scheme**: Uses gradient blues/purples (#667eea, #764ba2)
- **Status Colors**: 
  - New: Blue (#667eea)
  - Shortlisted: Orange (#ffa502)
  - Hired: Green (#43e97b)
  - Rejected: Red (#ff6b6b)
- **Breakpoints**: 1024px (tablet), 768px (mobile), 480px (small mobile)

## API Integration

### Services Used:
1. **ApplicationService**
   - `getApplications(filter)`: Fetch candidate's applications

2. **JobService**
   - `getJob(id)`: Fetch individual job details

3. **CandidateService**
   - `getCandidate(id)`: Fetch candidate profile

All services follow existing patterns in the codebase.
