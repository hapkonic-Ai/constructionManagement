import NotificationsPanel from '@/components/notifications/NotificationsPanel';

export default function SuperAdminNotificationsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto max-w-4xl">
        <NotificationsPanel />
      </div>
    </main>
  );
}
