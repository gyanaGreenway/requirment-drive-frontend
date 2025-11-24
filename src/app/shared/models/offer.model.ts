export type OfferStatus =
  | 'Accepted'
  | 'Pending'
  | 'Negotiation'
  | 'Draft'
  | 'Declined'
  | 'Withdrawn'
  | 'Expired';

export interface OfferLetter {
  id: string;
  candidateId?: number;
  candidateName: string;
  candidateEmail?: string;
  jobId?: number;
  role: string;
  recruiter?: string | null;
  recruiterId?: number;
  recruiterName?: string | null;
  sentOn?: Date | string | null;
  targetStart?: Date | string | null;
  status: OfferStatus;
  lastTouched?: Date | string | null;
  compensation?: string | null;
  location?: string | null;
  attachments?: number | null;
  notes?: string | null;
  acceptanceProbability?: number | null;
  offerLink?: string | null;
  metadata?: Record<string, any>;
}

export interface OfferFilter {
  status?: OfferStatus | string;
  recruiterId?: number;
  candidateId?: number;
  jobId?: number;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
