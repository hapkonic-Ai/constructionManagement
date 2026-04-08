'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, Construction } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
      <div className="p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-zinc-900">
              <Construction className="h-8 w-8 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">Velocity Nexus</h2>
          <p className="mt-2 text-zinc-400">Welcome back to the future of construction</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-zinc-300">Password</label>
              <button
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 group"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Sign In <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <button 
              onClick={() => router.push('/register')}
              className="font-semibold text-white hover:text-indigo-400 transition-colors underline-offset-4 hover:underline"
            >
              Sign up for early access
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
