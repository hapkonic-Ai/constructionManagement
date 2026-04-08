import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 right-20 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      
      {/* Subtle Mesh Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-zinc-950/50 to-zinc-950 pointer-events-none"></div>

      <div className="relative z-10 w-full px-4 flex justify-center py-12">
        <RegisterForm />
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center animate-fade-in pointer-events-none">
        <p className="text-zinc-600 text-xs font-medium tracking-widest uppercase">
          Nexus OS &bull; Institutional Grade Infrastructure
        </p>
      </div>
    </main>
  );
}
