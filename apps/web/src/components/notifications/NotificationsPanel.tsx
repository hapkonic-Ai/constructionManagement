'use client';

import { useEffect, useMemo, useState } from 'react';

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export default function NotificationsPanel() {
  const [rows, setRows] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !Array.isArray(payload?.data)) {
        throw new Error(payload?.error?.message || 'Failed to load notifications');
      }
      setRows(payload.data as NotificationRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const unreadCount = useMemo(() => rows.filter((r) => !r.readAt).length, [rows]);

  async function markRead(id: string) {
    const res = await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setRows((curr) => curr.map((r) => (r.id === id ? { ...r, readAt: new Date().toISOString() } : r)));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Notifications</h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {unreadCount} unread
        </span>
      </div>

      {loading && <p className="text-zinc-500">Loading notifications...</p>}
      {error && <p className="text-rose-500">{error}</p>}

      <div className="space-y-3">
        {!loading && !error && rows.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400">No notifications yet.</p>
        )}
        {rows.map((n) => (
          <div key={n.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{n.title}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{n.body}</p>
                <p className="mt-2 text-xs text-zinc-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.readAt ? (
                <button
                  type="button"
                  onClick={() => void markRead(n.id)}
                  className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Mark read
                </button>
              ) : (
                <span className="text-xs text-emerald-600 dark:text-emerald-400">Read</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
