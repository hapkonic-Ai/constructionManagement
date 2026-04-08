'use client';

import { useEffect, useMemo, useState } from 'react';

type Project = { id: string; title: string };
type Budget = { id: string; projectId: string; allocated: number; spent: number; updatedAt: string };
type Deviation = { id: string; type: string; delta: number; reason: string; approvedAt: string | null; project: { id: string; title: string } };
type Requirement = {
  id: string;
  summary: string;
  notes: string | null;
  requestedAmount: number;
  additionalCost: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  createdAt: string;
  project: { id: string; title: string };
  cmo: { name: string };
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function CFOWorkbench({ initialProjectId }: { initialProjectId?: string } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [projectId, setProjectId] = useState('');
  const [allocated, setAllocated] = useState(0);
  const [spent, setSpent] = useState(0);
  const [reviewNote, setReviewNote] = useState('');
  const [allocateByRequirement, setAllocateByRequirement] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setError(null);
    try {
      const [projectsRes, budgetsRes, deviationsRes, requirementsRes] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }),
        fetch('/api/budgets', { cache: 'no-store' }),
        fetch('/api/deviations', { cache: 'no-store' }),
        fetch('/api/requirements', { cache: 'no-store' }),
      ]);

      const projectsPayload = await projectsRes.json();
      const budgetsPayload = await budgetsRes.json();
      const deviationsPayload = await deviationsRes.json();
      const requirementsPayload = await requirementsRes.json();

      if (!projectsRes.ok) throw new Error(projectsPayload?.error?.message || 'Failed to load projects');
      if (!budgetsRes.ok) throw new Error(budgetsPayload?.error?.message || 'Failed to load budgets');
      if (!deviationsRes.ok) throw new Error(deviationsPayload?.error?.message || 'Failed to load deviations');
      if (!requirementsRes.ok) throw new Error(requirementsPayload?.error?.message || 'Failed to load requirements');

      const loadedProjects = (projectsPayload.data ?? []) as Project[];
      setProjects(loadedProjects);
      setBudgets((budgetsPayload.data ?? []) as Budget[]);
      setDeviations((deviationsPayload.data ?? []) as Deviation[]);
      const loadedRequirements = (requirementsPayload.data ?? []) as Requirement[];
      setRequirements(loadedRequirements);

      const allocMap: Record<string, number> = {};
      loadedRequirements.forEach((item) => {
        allocMap[item.id] = item.requestedAmount;
      });
      setAllocateByRequirement(allocMap);

      if (!projectId && loadedProjects.length > 0) {
        setProjectId(initialProjectId && loadedProjects.some((project) => project.id === initialProjectId)
          ? initialProjectId
          : loadedProjects[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load CFO workspace');
    }
  }

  useEffect(() => {
    void loadData();
  }, [initialProjectId]);

  async function allocateBudget() {
    if (!projectId || allocated < 0 || spent < 0) return;
    const response = await fetch('/api/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, allocated, spent }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to allocate budget');
      return;
    }
    setAllocated(0);
    setSpent(0);
    await loadData();
  }

  async function reviewRequirement(id: string, status: 'APPROVED' | 'REJECTED') {
    const response = await fetch('/api/requirements', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        status,
        reviewNote: reviewNote || undefined,
        allocatedAmount: status === 'APPROVED' ? allocateByRequirement[id] : undefined,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to review requirement');
      return;
    }
    setReviewNote('');
    await loadData();
  }

  async function approveDeviation(id: string) {
    const response = await fetch('/api/deviations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to approve deviation');
      return;
    }
    await loadData();
  }

  const filteredRequirements = useMemo(
    () => requirements.filter((item) => item.project.id === projectId),
    [requirements, projectId],
  );
  const filteredDeviations = useMemo(
    () => deviations.filter((item) => item.project.id === projectId),
    [deviations, projectId],
  );
  const filteredBudgets = useMemo(
    () => budgets.filter((item) => item.projectId === projectId),
    [budgets, projectId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">CFO Workbench</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Review CMO requirement files, approve funding, allocate budgets, and handle delay/extra-cost requests per project.
        </p>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-bold">Project Scope</h2>
        {initialProjectId ? (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900/40">
            {projects.find((project) => project.id === projectId)?.title ?? 'Selected project'}
          </div>
        ) : (
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-bold">Allocate Budget</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <input type="number" value={allocated} onChange={(e) => setAllocated(Number(e.target.value) || 0)} placeholder="Allocated" className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          <input type="number" value={spent} onChange={(e) => setSpent(Number(e.target.value) || 0)} placeholder="Spent" className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          <button type="button" onClick={allocateBudget} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Save</button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="text-lg font-bold">CMO Requirement Files</h2>
        <input value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Review note (optional)" className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        <div className="mt-3 space-y-2">
          {filteredRequirements.length === 0 && <p className="text-sm text-zinc-500">No requirement files for this project.</p>}
          {filteredRequirements.map((item) => (
            <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{item.summary}</p>
                <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{item.status}</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300">CMO: {item.cmo.name} • Requested: {formatMoney(item.requestedAmount)}</p>
              {item.additionalCost > 0 && <p className="text-xs text-amber-600 dark:text-amber-400">Extra requirement: {formatMoney(item.additionalCost)}</p>}
              {!item.status || item.status === 'SUBMITTED' ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    value={allocateByRequirement[item.id] ?? item.requestedAmount}
                    onChange={(e) =>
                      setAllocateByRequirement((current) => ({
                        ...current,
                        [item.id]: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-40 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <button type="button" onClick={() => reviewRequirement(item.id, 'APPROVED')} className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">Approve + Allocate</button>
                  <button type="button" onClick={() => reviewRequirement(item.id, 'REJECTED')} className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700">Reject</button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Budget Ledger</h2>
          <div className="mt-3 space-y-2">
            {filteredBudgets.slice(0, 12).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-semibold">Allocated {formatMoney(item.allocated)} • Spent {formatMoney(item.spent)}</p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(item.updatedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Delays / Extra Requirements</h2>
          <div className="mt-3 space-y-2">
            {filteredDeviations.length === 0 && <p className="text-sm text-zinc-500">No deviations for this project.</p>}
            {filteredDeviations.slice(0, 12).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{item.type} • Delta {item.delta}</p>
                  <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{item.approvedAt ? 'Approved' : 'Pending'}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">{item.reason}</p>
                {!item.approvedAt && (
                  <button type="button" onClick={() => approveDeviation(item.id)} className="mt-2 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                    Approve Deviation
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
