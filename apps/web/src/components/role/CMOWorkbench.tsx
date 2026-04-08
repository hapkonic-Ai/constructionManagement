'use client';

import { useEffect, useMemo, useState } from 'react';

type Project = { id: string; title: string };
type Material = { id: string; name: string; quantity: number; unitCost: number; totalCost: number; projectId: string };
type LabourCost = { id: string; category: string; estimatedCost: number; projectId: string };
type Design = { id: string; title: string; status: string; order: number; project: { id: string; title: string } };
type Requirement = {
  id: string;
  summary: string;
  notes: string | null;
  requestedAmount: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  project: { id: string; title: string };
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function CMOWorkbench({ initialProjectId }: { initialProjectId?: string } = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [labourCosts, setLabourCosts] = useState<LabourCost[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState('');

  const [materialName, setMaterialName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState(0);

  const [category, setCategory] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(0);

  const [requirementSummary, setRequirementSummary] = useState('');
  const [requirementNotes, setRequirementNotes] = useState('');
  const [additionalCost, setAdditionalCost] = useState(0);

  async function loadData() {
    setError(null);
    try {
      const [projectsRes, materialsRes, costsRes, designsRes, requirementsRes] = await Promise.all([
        fetch('/api/projects', { cache: 'no-store' }),
        fetch('/api/materials', { cache: 'no-store' }),
        fetch('/api/costs', { cache: 'no-store' }),
        fetch('/api/designs', { cache: 'no-store' }),
        fetch('/api/requirements', { cache: 'no-store' }),
      ]);

      const projectsPayload = await projectsRes.json();
      const materialsPayload = await materialsRes.json();
      const costsPayload = await costsRes.json();
      const designsPayload = await designsRes.json();
      const requirementsPayload = await requirementsRes.json();

      if (!projectsRes.ok) throw new Error(projectsPayload?.error?.message || 'Failed to load projects');
      if (!materialsRes.ok) throw new Error(materialsPayload?.error?.message || 'Failed to load materials');
      if (!costsRes.ok) throw new Error(costsPayload?.error?.message || 'Failed to load costs');
      if (!designsRes.ok) throw new Error(designsPayload?.error?.message || 'Failed to load designs');
      if (!requirementsRes.ok) throw new Error(requirementsPayload?.error?.message || 'Failed to load requirements');

      const loadedProjects = (projectsPayload.data ?? []) as Project[];
      setProjects(loadedProjects);
      setMaterials((materialsPayload.data ?? []) as Material[]);
      setLabourCosts((costsPayload.data?.labourCosts ?? []) as LabourCost[]);
      setDesigns((designsPayload.data ?? []) as Design[]);
      setRequirements((requirementsPayload.data ?? []) as Requirement[]);

      if (!projectId && loadedProjects.length > 0) {
        setProjectId(initialProjectId && loadedProjects.some((project) => project.id === initialProjectId)
          ? initialProjectId
          : loadedProjects[0].id);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load CMO workspace');
    }
  }

  useEffect(() => {
    void loadData();
  }, [initialProjectId]);

  async function addMaterial() {
    if (!projectId || !materialName.trim()) return;
    const response = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        name: materialName.trim(),
        quantity,
        unitCost,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to add material');
      return;
    }
    setMaterialName('');
    setQuantity(1);
    setUnitCost(0);
    await loadData();
  }

  async function addLabourCost() {
    if (!projectId || !category.trim()) return;
    const response = await fetch('/api/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        category: category.trim(),
        estimatedCost,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to add labour cost');
      return;
    }
    setCategory('');
    setEstimatedCost(0);
    await loadData();
  }

  async function submitRequirement() {
    if (!projectId || !requirementSummary.trim()) return;
    const response = await fetch('/api/requirements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        summary: requirementSummary.trim(),
        notes: requirementNotes.trim() || undefined,
        additionalCost,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setError(payload?.error?.message || 'Failed to submit requirement file');
      return;
    }
    setRequirementSummary('');
    setRequirementNotes('');
    setAdditionalCost(0);
    await loadData();
  }

  const projectName = (id: string) => projects.find((project) => project.id === id)?.title ?? id;

  const filteredDesigns = useMemo(
    () => designs.filter((design) => design.project.id === projectId),
    [designs, projectId],
  );
  const filteredRequirements = useMemo(
    () => requirements.filter((item) => item.project.id === projectId),
    [requirements, projectId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">CMO Workbench</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          View designs, define raw materials/labour, and submit requirement files per project.
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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Design Visibility</h2>
          <div className="mt-3 space-y-2">
            {filteredDesigns.length === 0 && <p className="text-sm text-zinc-500">No designs for this project yet.</p>}
            {filteredDesigns.map((design) => (
              <div key={design.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{design.title}</p>
                  <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{design.status}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">Order {design.order}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Submit Requirement File</h2>
          <div className="mt-3 space-y-3">
            <input value={requirementSummary} onChange={(e) => setRequirementSummary(e.target.value)} placeholder="Requirement summary" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <textarea value={requirementNotes} onChange={(e) => setRequirementNotes(e.target.value)} rows={3} placeholder="Notes / context" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <input type="number" value={additionalCost} onChange={(e) => setAdditionalCost(Number(e.target.value) || 0)} placeholder="Additional cost" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <button type="button" onClick={submitRequirement} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Submit to CFO</button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Add Material</h2>
          <div className="mt-3 space-y-3">
            <input value={materialName} onChange={(e) => setMaterialName(e.target.value)} placeholder="Material name" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 0)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
              <input type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value) || 0)} className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            </div>
            <button type="button" onClick={addMaterial} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">Save Material</button>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Add Labour Cost</h2>
          <div className="mt-3 space-y-3">
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Labour category" className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value) || 0)} className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            <button type="button" onClick={addLabourCost} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white">Save Labour Cost</button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Materials</h2>
          <div className="mt-3 space-y-2">
            {materials.filter((item) => item.projectId === projectId).slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-semibold">{item.name}</p>
                <p className="text-zinc-600 dark:text-zinc-300">Qty {item.quantity} • Total {formatMoney(item.totalCost)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Labour</h2>
          <div className="mt-3 space-y-2">
            {labourCosts.filter((item) => item.projectId === projectId).slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-semibold">{item.category}</p>
                <p className="text-zinc-600 dark:text-zinc-300">{formatMoney(item.estimatedCost)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold">Requirement Files</h2>
          <div className="mt-3 space-y-2">
            {filteredRequirements.slice(0, 8).map((item) => (
              <div key={item.id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{item.summary}</p>
                  <span className="rounded-md border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700">{item.status}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300">{formatMoney(item.requestedAmount)}</p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
