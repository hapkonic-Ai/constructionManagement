import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = '' } = await searchParams;

  return (
    <main className="min-h-screen grid place-items-center bg-zinc-950 px-4">
      <ResetPasswordForm token={token} />
    </main>
  );
}
