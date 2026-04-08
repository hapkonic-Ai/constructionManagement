'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPassword } from '@/app/actions/password';

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing reset token');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('token', token);
    formData.append('password', password);

    const res = await resetPassword(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess('Password updated. Redirecting to login...');
      setTimeout(() => router.push('/login'), 1200);
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-zinc-100">
      <h1 className="text-2xl font-bold">Reset Password</h1>
      <p className="mt-2 text-sm text-zinc-400">Set your new account password.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-indigo-500"
        />
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold disabled:opacity-70"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
      {success && <p className="mt-4 text-sm text-emerald-400">{success}</p>}

      <Link href="/login" className="mt-6 inline-block text-sm text-zinc-400 underline">
        Back to login
      </Link>
    </div>
  );
}
