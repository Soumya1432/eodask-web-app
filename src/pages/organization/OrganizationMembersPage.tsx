import React, { useEffect, useState } from 'react';
import { useOrganizationContext, OrgRoleGate } from '@/contexts/OrganizationContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import type { OrganizationRole, IOrganizationMember } from '@/types';

const ROLE_OPTIONS: { value: OrganizationRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'GUEST', label: 'Guest' },
];

export const OrganizationMembersPage: React.FC = () => {
  const { organization, userRole } = useOrganizationContext();
  const { user } = useAuth();
  const {
    members,
    invitations,
    isLoading,
    error,
    fetchMembers,
    fetchInvitations,
    addMember,
    updateMemberRole,
    removeMember,
    createInvitation,
    cancelInvitation,
    clearOrganizationError,
  } = useOrganizations();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationRole>('MEMBER');

  useEffect(() => {
    if (organization?.id) {
      fetchMembers(organization.id);
      fetchInvitations(organization.id);
    }
  }, [organization?.id, fetchMembers, fetchInvitations]);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (organization?.id && inviteEmail) {
      createInvitation(organization.id, inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleUpdateRole = (memberId: string, newRole: OrganizationRole) => {
    if (organization?.id) {
      updateMemberRole(organization.id, memberId, newRole);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (organization?.id && confirm('Are you sure you want to remove this member?')) {
      removeMember(organization.id, memberId);
    }
  };

  const handleCancelInvitation = (invitationId: string) => {
    if (organization?.id && confirm('Are you sure you want to cancel this invitation?')) {
      cancelInvitation(organization.id, invitationId);
    }
  };

  if (!organization) {
    return <LoadingSpinner />;
  }

  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN' || isOwner;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your organization's team members and invitations
          </p>
        </div>
        <OrgRoleGate minRole="ADMIN">
          <Button onClick={() => setShowInviteModal(true)}>Invite Member</Button>
        </OrgRoleGate>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={clearOrganizationError}
            className="text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Members ({members.length})
          </h2>
        </div>
        {isLoading && members.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currentUserId={user?.id}
                isOwner={isOwner}
                isAdmin={isAdmin}
                onUpdateRole={handleUpdateRole}
                onRemove={handleRemoveMember}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Pending Invitations */}
      <OrgRoleGate minRole="MANAGER">
        {invitations.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Pending Invitations ({invitations.filter((i) => i.status === 'PENDING').length})
              </h2>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {invitations
                .filter((i) => i.status === 'PENDING')
                .map((invitation) => (
                  <li key={invitation.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invitation.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Invited as {invitation.role.toLowerCase()} &middot; Expires{' '}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <OrgRoleGate minRole="ADMIN">
                      <button
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="text-red-600 dark:text-red-400 hover:underline text-sm"
                      >
                        Cancel
                      </button>
                    </OrgRoleGate>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </OrgRoleGate>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invite Team Member
            </h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface MemberRowProps {
  member: IOrganizationMember;
  currentUserId?: string;
  isOwner: boolean;
  isAdmin: boolean;
  onUpdateRole: (userId: string, role: OrganizationRole) => void;
  onRemove: (userId: string) => void;
}

const MemberRow: React.FC<MemberRowProps> = ({
  member,
  currentUserId,
  isOwner,
  isAdmin,
  onUpdateRole,
  onRemove,
}) => {
  const isCurrentUser = member.userId === currentUserId;
  const isMemberOwner = member.role === 'OWNER';
  const canEdit = isOwner && !isCurrentUser && !isMemberOwner;
  const canRemove = (isOwner || isAdmin) && !isCurrentUser && !isMemberOwner;

  return (
    <li className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {member.user.avatar ? (
          <img
            src={member.user.avatar}
            alt=""
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
            {member.user.firstName[0]}
            {member.user.lastName[0]}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {member.user.firstName} {member.user.lastName}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
            )}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {canEdit ? (
          <select
            value={member.role}
            onChange={(e) => onUpdateRole(member.userId, e.target.value as OrganizationRole)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              isMemberOwner
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                : member.role === 'ADMIN'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {member.role}
          </span>
        )}
        {canRemove && (
          <button
            onClick={() => onRemove(member.userId)}
            className="text-red-600 dark:text-red-400 hover:underline text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </li>
  );
};

export default OrganizationMembersPage;
