'use client';

import { useEffect, useState } from 'react';

type Project = { id: string; title: string };
type ProgressItem = { id: string; note: string; createdAt: string; project: { title: string } };
type DeviationItem = {
  id: string;
  type: 'TIMELINE' | 'COST';
  delta: number;
  reason: string;
  approvedAt: string | null;
  project: { title: string };
};
type OnsiteProject = {
  id: string;
  title: string;
  status: string;
  avgTaskProgress: number;
  taskCount: number;
  membersCount: number;
  lastUpdate: { id: string; createdAt: string; note: string } | null;
  pendingTimelineDeviations: number;
};

export default function COOWorkbench({ initialProjectId }: { initialProjectId?: string } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [deviations, setDeviations] = useState<DeviationItem[]>([]);
  const [onsite, setOnsite] = useState<OnsiteProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [projectId, setProjectId] = useState('');
  const [note, setNote] = useState('');
  const [devType, setDevType] = useState<'TIMELINE' | 'COST'>('TIMELINE');
  const [devDelta, setDevDelta] = useState(1);
  const [devReason, setDevReason] = useState('');

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, progressRes, deviationsRes, onsiteRes] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }),
        fetch('/api/progress', { cache: 'no-store' }),
        fetch('/api/deviations', { cache: 'no-store' }),
        fetch('/api/onsite-progress', { cache: 'no-store' }),
      ]);

      const projectsPayload = await projectsRes.json();
      const progressPayload = await progressRes.json();
      const deviationsPayload = await deviationsRes.json();
      const onsitePayload = await onsiteRes.json();

      if (!projectsRes.ok) throw new Error(projectsPayload?.error?.message || 'Failed to load projects');
      if (!progressRes.ok) throw new Error(progressPayload?.error?.message || 'Failed to load progress');
      if (!deviationsRes.ok) throw new Error(deviationsPayload?.error?.message || 'Failed to load deviations');
      if (!onsiteRes.ok) throw new Error(onsitePayload?.error?.message || 'Failed to load onsite progress');

      const loadedProjects = (projectsPayload.data ?? []) as Project[];
      setProjects(loadedProjects);
      setProgress((progressPayload.data ?? []) as ProgressItem[]);
      setDeviations((deviationsPayload.data ?? []) as DeviationItem[]);
      setOnsite((onsitePayload.data ?? []) as OnsiteProject[]);
      if (!projectId && loadedProjects.length > 0) {
        setProjectId(initialProjectId && loadedProjects.some((project) => project.id === initialProjectId)
          ? initialProjectId
          : loadedProjects[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load COO workspace');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [initialProjectId]);

  async function submitProgress() {
    if (!projectId || !note.trim()) return;
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, note: note.trim(), attachments: [] }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to submit progress');
      return;
    }
    setNote('');
    await loadData();
  }

  async function submitDeviation() {
    if (!projectId || !devReason.trim()) return;
    const response = await fetch('/api/deviations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        type: devType,
        delta: devDelta,
        reason: devReason.trim(),
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to raise deviation');
      return;
    }
    setDevReason('');
    setDevDelta(1);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">COO Workbench</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Submit execution updates and raise timeline/cost deviations.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Submit Progress</h2>
          <div className="mt-3 space-y-3">
            {initialProjectId ? (
              <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900/40">
                {projects.find((project) => project.id === projectId)?.title ?? 'Selected project'}
              </div>
            ) : (
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            )}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Daily / weekly progress note" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <button type="button" onClick={submitProgress} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Post Progress</button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Raise Deviation</h2>
          <div className="mt-3 space-y-3">
            {initialProjectId ? (
              <div className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900/40">
                {projects.find((project) => project.id === projectId)?.title ?? 'Selected project'}
              </div>
            ) : (
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            )}
            <div className="grid grid-cols-2 gap-3">
              <select value={devType} onChange={(e) => setDevType(e.target.value as 'TIMELINE' | 'COST')} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
                <option value="TIMELINE">TIMELINE</option>
                <option value="COST">COST</option>
              </select>
              <input type="number" value={devDelta} onChange={(e) => setDevDelta(Number(e.target.value) || 0)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            </div>
            <textarea value={devReason} onChange={(e) => setDevReason(e.target.value)} rows={3} placeholder="Why this deviation occurred" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <button type="button" onClick={submitDeviation} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Raise Deviation</button>
          </div>
        </section>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}
      {loading && <p className="text-sm text-zinc-500">Loading workspace...</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Recent Progress</h2>
          <div className="mt-3 space-y-2">
            {progress.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-semibold">{item.project.title}</p>
                <p className="text-zinc-600 dark:text-zinc-300">{item.note}</p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Recent Deviations</h2>
          <div className="mt-3 space-y-2">
            {deviations.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{item.project.title}</p>
                  <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{item.approvedAt ? 'Approved' : 'Pending'}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">{item.type} • {item.reason}</p>
                <p className="mt-1 text-xs text-zinc-500">Delta: {item.delta}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-bold">Onsite Progress by Project</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {onsite.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{item.title}</p>
                <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{item.status}</span>
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                Worker progress: {item.avgTaskProgress}% across {item.taskCount} tasks • Team {item.membersCount}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Pending timeline deviations: {item.pendingTimelineDeviations}
                {item.lastUpdate ? ` • Last update ${new Date(item.lastUpdate.createdAt).toLocaleString()}` : ''}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
