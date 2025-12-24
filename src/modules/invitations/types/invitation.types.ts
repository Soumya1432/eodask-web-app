import type { Project } from '@/modules/projects/types';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  token: string;
  projectId: string;
  project?: Project;
  inviterId: string;
  inviter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationState {
  // Current invitation (for accept/reject flow)
  currentInvitation: Invitation | null;
  currentInvitationLoading: boolean;
  currentInvitationError: string | null;

  // Project invitations
  projectInvitations: Invitation[];
  projectInvitationsLoading: boolean;
  projectInvitationsError: string | null;

  // Operation states
  accepting: boolean;
  rejecting: boolean;
  creating: boolean;
  cancelling: boolean;
  operationError: string | null;
  operationSuccess: string | null;

  // Accepted project (after accepting invitation)
  acceptedProject: Project | null;
}
