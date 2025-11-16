import { ApplicationStatus } from './application.model';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.New]: 'New',
  [ApplicationStatus.Shortlisted]: 'Shortlisted',
  [ApplicationStatus.Rejected]: 'Rejected',
  [ApplicationStatus.Hired]: 'Hired'
};
