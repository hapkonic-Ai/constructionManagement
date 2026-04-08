'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import { register } from '@/app/actions/auth';

const ROLES = ["CEO", "CTO", "CDO", "COO", "CMO", "CFO"] as const;

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('CEO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);

    try {
      const result = await register(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/login?registered=true');
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
          <h2 className="text-3xl font-bold tracking-tight text-white font-outfit">Join Velocity</h2>
          <p className="mt-2 text-zinc-400">Deploy your construction empire with precision</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-md">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Executive Role</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
                <Briefcase className="h-5 w-5" />
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-4 text-white transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-zinc-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-300 ml-1">Password</label>
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
            <p className="text-[10px] text-zinc-500 mt-1 ml-1 font-medium italic">Minimum 8 characters with high entropy</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 group"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Create Account <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-800/50 pt-6">
          <p className="text-sm text-zinc-500">
            Already have an account?{' '}
            <button 
              onClick={() => router.push('/login')}
              className="font-semibold text-white hover:text-indigo-400 transition-colors underline-offset-4 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
