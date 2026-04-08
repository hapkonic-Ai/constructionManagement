'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/password';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('email', email);

    const res = await requestPasswordReset(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(res.success ?? 'Reset link generated');
      setResetLink(res.resetLink ?? null);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen grid place-items-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-zinc-100">
        <h1 className="text-2xl font-bold">Forgot Password</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your account email to generate a reset link.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold disabled:opacity-70"
          >
            {loading ? 'Generating...' : 'Generate Reset Link'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        {success && <p className="mt-4 text-sm text-emerald-400">{success}</p>}
        {resetLink && (
          <p className="mt-2 text-xs break-all text-zinc-300">
            Demo link: <a href={resetLink} className="underline">{resetLink}</a>
          </p>
        )}

        <Link href="/login" className="mt-6 inline-block text-sm text-zinc-400 underline">
          Back to login
        </Link>
      </div>
    </main>
  );
}
