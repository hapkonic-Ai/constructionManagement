'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type ProjectDetail = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  ceo: {
    id: string;
    name: string;
    email: string;
  };
  members: Array<{
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      role: string;
      email: string;
    };
  }>;
  budgets: Array<{
    id: string;
    allocated: number;
    spent: number;
  }>;
  materials: Array<{
    id: string;
    name: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  labourCosts: Array<{
    id: string;
    category: string;
    estimatedCost: number;
  }>;
  designs: Array<{
    id: string;
    title: string;
    status: string;
    order: number;
  }>;
  progressUpdates: Array<{
    id: string;
    note: string;
    createdAt: string;
  }>;
  deviations: Array<{
    id: string;
    type: string;
    delta: number;
    reason: string;
    approvedAt: string | null;
  }>;
  _count: {
    members: number;
    ganttTasks: number;
    deviations: number;
    progressUpdates: number;
  };
};

function mapStatus(status: string): 'on-track' | 'delayed' | 'deviation' {
  const normalized = status.toUpperCase();
  if (normalized.includes('DELAY')) return 'delayed';
  if (normalized.includes('DEVIATION') || normalized.includes('RISK')) return 'deviation';
  return 'on-track';
}

function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${params.id}`, { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !payload?.data) {
          throw new Error(payload?.error?.message || 'Failed to load project');
        }

        if (!mounted) return;
        setProject(payload.data as ProjectDetail);
      } catch (loadErr) {
        if (!mounted) return;
        setError(loadErr instanceof Error ? loadErr.message : 'Failed to load project');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (params.id) {
      void loadProject();
    }

    return () => {
      mounted = false;
    };
  }, [params.id]);

  const budget = useMemo(() => {
    const allocated = project?.budgets.reduce((acc, item) => acc + item.allocated, 0) ?? 0;
    const spent = project?.budgets.reduce((acc, item) => acc + item.spent, 0) ?? 0;
    const utilization = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

    return {
      allocated,
      spent,
      remaining: Math.max(allocated - spent, 0),
      utilization,
    };
  }, [project]);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading project from Neon storage...</p>;
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-500">{error ?? 'Project not found'}</p>
        <Link href="/ceo/projects" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Back to Portfolio
        </Link>
      </div>
    );
  }

  const status = mapStatus(project.status);
  const progress = Math.min(100, Math.max(5, project._count.progressUpdates * 8));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Link
            href="/ceo/projects"
            className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{project.title}</h1>
            <Badge className={status === 'on-track' ? 'bg-emerald-500/10 text-emerald-600' : status === 'delayed' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'}>
              {status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {project.location || 'Location not set'}
            </div>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Created {new Date(project.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Completion</p>
            <h3 className="mt-1 text-2xl font-black text-zinc-900 dark:text-zinc-50">{progress}%</h3>
            <Progress value={progress} className="mt-4 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Budget Spent</p>
            <h3 className="mt-1 text-2xl font-black text-zinc-900 dark:text-zinc-50">{formatMoney(budget.spent)}</h3>
            <p className="mt-1 text-xs text-zinc-500">of {formatMoney(budget.allocated)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Team Members</p>
            <h3 className="mt-1 text-2xl font-black text-zinc-900 dark:text-zinc-50">{project._count.members}</h3>
            <p className="mt-1 text-xs text-zinc-500">Assigned in project scope</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Deviations</p>
            <h3 className="mt-1 text-2xl font-black text-zinc-900 dark:text-zinc-50">{project._count.deviations}</h3>
            <p className="mt-1 text-xs text-zinc-500">Flagged risk events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
            {project.description && <p>{project.description}</p>}
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /> CEO: {project.ceo.name} ({project.ceo.email})</div>
            <div className="flex items-center gap-2"><Activity className="h-4 w-4" /> Progress updates: {project._count.progressUpdates}</div>
            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Gantt tasks: {project._count.ganttTasks}</div>
            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Remaining budget: {formatMoney(budget.remaining)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leadership</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.members.length === 0 && (
              <p className="text-sm text-zinc-500">No project members assigned yet.</p>
            )}
            {project.members.slice(0, 6).map((member) => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-900 dark:text-zinc-50">{member.user.name}</span>
                <Badge variant="outline">{member.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Materials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.materials.length === 0 && (
              <p className="text-sm text-zinc-500">No materials recorded yet.</p>
            )}
            {project.materials.slice(0, 8).map((material) => (
              <div key={material.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {material.name} ({material.quantity})
                </span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatMoney(material.totalCost)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Labour Costs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.labourCosts.length === 0 && (
              <p className="text-sm text-zinc-500">No labour costs recorded yet.</p>
            )}
            {project.labourCosts.slice(0, 8).map((cost) => (
              <div key={cost.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{cost.category}</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatMoney(cost.estimatedCost)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.designs.length === 0 && (
              <p className="text-sm text-zinc-500">No design packages created yet.</p>
            )}
            {project.designs.slice(0, 8).map((design) => (
              <div key={design.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {design.order}. {design.title}
                </span>
                <Badge variant="outline">{design.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Operational Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.progressUpdates.length === 0 && project.deviations.length === 0 && (
              <p className="text-sm text-zinc-500">No recent updates or deviations logged.</p>
            )}
            {project.progressUpdates.slice(0, 4).map((update) => (
              <div key={update.id} className="space-y-1 text-sm">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Progress Update</p>
                <p className="text-zinc-600 dark:text-zinc-400">{update.note}</p>
                <p className="text-xs text-zinc-500">{new Date(update.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {project.deviations.slice(0, 4).map((deviation) => (
              <div key={deviation.id} className="space-y-1 text-sm">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Deviation: {deviation.type} ({deviation.delta})
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">{deviation.reason}</p>
                <p className="text-xs text-zinc-500">
                  {deviation.approvedAt ? `Approved ${new Date(deviation.approvedAt).toLocaleString()}` : 'Pending approval'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
