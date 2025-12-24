/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../hooks';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: '',
    bio: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskAssigned: true,
    taskDue: true,
    weeklyDigest: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(res => setTimeout(res, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials()
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <p className="text-sm mt-1 capitalize text-gray-500">
              {user?.role?.toLowerCase() || 'member'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 mb-6">
        <div className="flex justify-between mb-6">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          {!isEditing && (
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {['name', 'phone'].map(field => (
            <div key={field}>
              <label className="block text-sm mb-1 capitalize">{field}</label>
              {isEditing ? (
                <input
                  value={(formData as any)[field]}
                  onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-transparent"
                />
              ) : (
                <p className="py-2">{(formData as any)[field] || '-'}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm mb-1">Email</label>
            <p className="py-2">{formData.email}</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Bio</label>
            {isEditing ? (
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border bg-transparent"
              />
            ) : (
              <p className="py-2">{formData.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-6">Notifications</h3>

        {[
          ['email', 'Email Notifications'],
          ['push', 'Push Notifications'],
          ['taskAssigned', 'Task Assigned'],
          ['taskDue', 'Task Due'],
          ['weeklyDigest', 'Weekly Digest'],
        ].map(([key, label]) => (
          <div key={key} className="flex justify-between items-center mb-4">
            <p className="font-medium">{label}</p>
            <Toggle
              enabled={(notifications as any)[key]}
              onToggle={() =>
                setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
