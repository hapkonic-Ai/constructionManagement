'use client';

import { useEffect, useMemo, useState } from 'react';

type Project = {
  id: string;
  title: string;
};

type Design = {
  id: string;
  projectId: string;
  title: string;
  status: 'DRAFT' | 'READY' | 'RELEASED' | 'ACKNOWLEDGED';
  order: number;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  releasedAt: string | null;
  project?: { id: string; title: string };
  timeline?: { milestones: string[]; estimatedDays: number } | null;
};

type DesignWorkbenchProps = {
  roleLabel: 'CTO' | 'CDO';
  initialProjectId?: string;
};

function toDateInputValue(value: string | null | undefined) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

export default function DesignWorkbench({ roleLabel, initialProjectId }: DesignWorkbenchProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [createTitle, setCreateTitle] = useState('');
  const [createOrder, setCreateOrder] = useState(1);
  const [createMilestones, setCreateMilestones] = useState('');
  const [createEstimatedDays, setCreateEstimatedDays] = useState(7);
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const [updateDesignId, setUpdateDesignId] = useState('');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateOrder, setUpdateOrder] = useState(1);
  const [updateStatus, setUpdateStatus] = useState<Design['status']>('DRAFT');
  const [updateMilestones, setUpdateMilestones] = useState('');
  const [updateEstimatedDays, setUpdateEstimatedDays] = useState(7);
  const [updateStartDate, setUpdateStartDate] = useState('');
  const [updateEndDate, setUpdateEndDate] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  async function loadData(projectFilterId?: string) {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsRes, designsRes] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }),
        fetch(`/api/designs${projectFilterId ? `?projectId=${projectFilterId}` : ''}`, { cache: 'no-store' }),
      ]);

      const projectsPayload = await projectsRes.json();
      const designsPayload = await designsRes.json();

      if (!projectsRes.ok || !Array.isArray(projectsPayload?.data)) {
        throw new Error(projectsPayload?.error?.message || 'Failed to load projects');
      }
      if (!designsRes.ok || !Array.isArray(designsPayload?.data)) {
        throw new Error(designsPayload?.error?.message || 'Failed to load designs');
      }

      const loadedProjects = projectsPayload.data as Project[];
      const loadedDesigns = designsPayload.data as Design[];

      setProjects(loadedProjects);
      setDesigns(loadedDesigns);

      if (!selectedProjectId && loadedProjects.length > 0) {
        setSelectedProjectId(initialProjectId && loadedProjects.some((project) => project.id === initialProjectId)
          ? initialProjectId
          : loadedProjects[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load design workspace');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [initialProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    void loadData(selectedProjectId);
  }, [selectedProjectId]);

  const sortedDesigns = useMemo(() => [...designs].sort((a, b) => a.order - b.order), [designs]);

  const selectedDesign = useMemo(
    () => sortedDesigns.find((design) => design.id === updateDesignId) ?? null,
    [sortedDesigns, updateDesignId],
  );

  useEffect(() => {
    if (!selectedDesign) return;
    setUpdateTitle(selectedDesign.title);
    setUpdateOrder(selectedDesign.order);
    setUpdateStatus(selectedDesign.status);
    setUpdateMilestones((selectedDesign.timeline?.milestones ?? []).join(', '));
    setUpdateEstimatedDays(selectedDesign.timeline?.estimatedDays ?? 7);
    setUpdateStartDate(toDateInputValue(selectedDesign.plannedStartAt));
    setUpdateEndDate(toDateInputValue(selectedDesign.plannedEndAt));
  }, [selectedDesign]);

  async function createDesign() {
    if (!selectedProjectId || !createTitle.trim()) return;
    setSubmittingCreate(true);
    setError(null);
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          title: createTitle.trim(),
          order: createOrder,
          plannedStartAt: createStartDate ? new Date(`${createStartDate}T00:00:00.000Z`).toISOString() : undefined,
          plannedEndAt: createEndDate ? new Date(`${createEndDate}T00:00:00.000Z`).toISOString() : undefined,
          milestones: createMilestones.split(',').map((item) => item.trim()).filter(Boolean),
          estimatedDays: createEstimatedDays,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Failed to create design');

      setCreateTitle('');
      setCreateMilestones('');
      setCreateStartDate('');
      setCreateEndDate('');
      await loadData(selectedProjectId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create design');
    } finally {
      setSubmittingCreate(false);
    }
  }

  async function updateDesign() {
    if (!updateDesignId) return;
    setSubmittingUpdate(true);
    setError(null);
    try {
      const response = await fetch('/api/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updateDesignId,
          title: updateTitle.trim(),
          order: updateOrder,
          status: updateStatus,
          plannedStartAt: updateStartDate ? new Date(`${updateStartDate}T00:00:00.000Z`).toISOString() : null,
          plannedEndAt: updateEndDate ? new Date(`${updateEndDate}T00:00:00.000Z`).toISOString() : null,
          milestones: updateMilestones.split(',').map((item) => item.trim()).filter(Boolean),
          estimatedDays: updateEstimatedDays,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.error?.message || 'Failed to update design');

      await loadData(selectedProjectId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update design');
    } finally {
      setSubmittingUpdate(false);
    }
  }

  async function releaseDesign(id: string) {
    const response = await fetch(`/api/designs/${id}/release`, { method: 'POST' });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to release design');
      return;
    }
    await loadData(selectedProjectId);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">{roleLabel}</p>
        <h1 className="mt-1 text-3xl font-black">Design Workbench</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage design delivery flow per project: create, update, sequence, and set planned dates.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-bold">Project Scope</h2>
        {initialProjectId ? (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900/40">
            {projects.find((project) => project.id === selectedProjectId)?.title ?? 'Selected project'}
          </div>
        ) : (
          <select
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Create Design Item</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={createTitle}
              onChange={(event) => setCreateTitle(event.target.value)}
              placeholder="Design title"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="number"
              min={1}
              value={createOrder}
              onChange={(event) => setCreateOrder(Number(event.target.value) || 1)}
              placeholder="Queue order"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="date"
              value={createStartDate}
              onChange={(event) => setCreateStartDate(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="date"
              value={createEndDate}
              onChange={(event) => setCreateEndDate(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="number"
              min={1}
              value={createEstimatedDays}
              onChange={(event) => setCreateEstimatedDays(Number(event.target.value) || 7)}
              placeholder="Estimated days"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              value={createMilestones}
              onChange={(event) => setCreateMilestones(event.target.value)}
              placeholder="Milestones (comma separated)"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <button
            type="button"
            onClick={createDesign}
            disabled={submittingCreate || !selectedProjectId || !createTitle.trim()}
            className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {submittingCreate ? 'Creating...' : 'Create Design'}
          </button>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Update Delivery Flow</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              value={updateDesignId}
              onChange={(event) => setUpdateDesignId(event.target.value)}
              className="md:col-span-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Select design</option>
              {sortedDesigns.map((design) => (
                <option key={design.id} value={design.id}>
                  {design.title} (Order {design.order})
                </option>
              ))}
            </select>
            <input
              value={updateTitle}
              onChange={(event) => setUpdateTitle(event.target.value)}
              placeholder="Design title"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="number"
              min={1}
              value={updateOrder}
              onChange={(event) => setUpdateOrder(Number(event.target.value) || 1)}
              placeholder="Queue order"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <select
              value={updateStatus}
              onChange={(event) => setUpdateStatus(event.target.value as Design['status'])}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="READY">READY</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RELEASED">RELEASED</option>
            </select>
            <input
              type="number"
              min={1}
              value={updateEstimatedDays}
              onChange={(event) => setUpdateEstimatedDays(Number(event.target.value) || 7)}
              placeholder="Estimated days"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="date"
              value={updateStartDate}
              onChange={(event) => setUpdateStartDate(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="date"
              value={updateEndDate}
              onChange={(event) => setUpdateEndDate(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              value={updateMilestones}
              onChange={(event) => setUpdateMilestones(event.target.value)}
              placeholder="Milestones (comma separated)"
              className="md:col-span-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={updateDesign}
              disabled={submittingUpdate || !updateDesignId}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submittingUpdate ? 'Updating...' : 'Save Update'}
            </button>
            {updateDesignId && (
              <button
                type="button"
                onClick={() => releaseDesign(updateDesignId)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Release Design
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-bold">Design Queue</h2>
        {isLoading && <p className="mt-3 text-sm text-zinc-500">Loading design queue...</p>}
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        {!isLoading && sortedDesigns.length === 0 && <p className="mt-3 text-sm text-zinc-500">No designs available for this project.</p>}
        <div className="mt-4 space-y-3">
          {sortedDesigns.map((design) => (
            <div key={design.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{design.title}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {design.project?.title || design.projectId} • Order {design.order}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Planned: {toDateInputValue(design.plannedStartAt) || '-'} to {toDateInputValue(design.plannedEndAt) || '-'}
                    {' • '}ETA: {design.timeline?.estimatedDays ?? '-'} days
                  </p>
                </div>
                <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{design.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
