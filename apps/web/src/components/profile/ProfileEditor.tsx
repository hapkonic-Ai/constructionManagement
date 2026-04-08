'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';

type ProfileEditorProps = {
  userId: string;
  initialName: string;
  initialAvatarUrl: string | null;
  initialBio: string | null;
  initialContact: string | null;
  canEdit: boolean;
};

export default function ProfileEditor({
  userId,
  initialName,
  initialAvatarUrl,
  initialBio,
  initialContact,
  canEdit,
}: ProfileEditorProps) {
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? '');
  const [bio, setBio] = useState(initialBio ?? '');
  const [contact, setContact] = useState(initialContact ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('name', name);
    formData.append('avatarUrl', avatarUrl);
    formData.append('bio', bio);
    formData.append('contact', contact);

    const res = await updateProfile(formData);
    if (res.error) setError(res.error);
    if (res.success) setSuccess(res.success);

    setSaving(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit || saving}
          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">Avatar URL</label>
        <input
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          disabled={!canEdit || saving}
          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">Contact</label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          disabled={!canEdit || saving}
          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="text-sm text-zinc-600 dark:text-zinc-300">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          disabled={!canEdit || saving}
          className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      {error && <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>}
      {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

      {canEdit && (
        <button
          disabled={saving}
          className="rounded-xl bg-zinc-900 px-4 py-2 font-semibold text-white disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      )}
    </form>
  );
}
