'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Briefcase, AlertTriangle, TrendingUp, Users, ArrowUpRight, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/dashboard/StatCard';

type DashboardProject = {
  id: string;
  title: string;
  location: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  _count: {
    members: number;
    ganttTasks: number;
    deviations: number;
    progressUpdates: number;
  };
  budgets: Array<{ allocated: number; spent: number }>;
  deviations: Array<{
    id: string;
    type: string;
    delta: number;
    reason: string;
    approvedAt: string | null;
  }>;
  progressUpdates: Array<{
    id: string;
    note: string;
    createdAt: string;
    coo: {
      id: string;
      name: string;
      role: string;
    };
  }>;
};

type Activity = {
  id: string;
  kind: 'progress' | 'deviation';
  projectId: string;
  projectTitle: string;
  text: string;
  at: string;
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

export default function CEODashboard() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !Array.isArray(payload?.data)) {
          throw new Error(payload?.error?.message || 'Failed to load portfolio data');
        }

        if (!mounted) return;
        setProjects(payload.data as DashboardProject[]);
      } catch (loadErr) {
        if (!mounted) return;
        setError(loadErr instanceof Error ? loadErr.message : 'Failed to load portfolio data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const activeProjects = projects.length;
    const allBudgets = projects.flatMap((project) => project.budgets);
    const allocated = allBudgets.reduce((sum, item) => sum + item.allocated, 0);
    const spent = allBudgets.reduce((sum, item) => sum + item.spent, 0);
    const budgetHealth = allocated > 0 ? Math.max(0, Math.min(100, Math.round((spent / allocated) * 100))) : 0;
    const pendingDeviations = projects.flatMap((project) => project.deviations).filter((item) => !item.approvedAt).length;
    const platformUsers = projects.reduce((sum, project) => sum + project._count.members, 0);

    return {
      activeProjects,
      budgetHealth,
      pendingDeviations,
      platformUsers,
    };
  }, [projects]);

  const activities = useMemo<Activity[]>(() => {
    const progressActivities = projects.flatMap((project) =>
      project.progressUpdates.map((item) => ({
        id: `progress-${item.id}`,
        kind: 'progress' as const,
        projectId: project.id,
        projectTitle: project.title,
        text: `${item.coo.name} shared progress: ${item.note}`,
        at: item.createdAt,
      })),
    );

    const deviationActivities = projects.flatMap((project) =>
      project.deviations.map((item) => ({
        id: `deviation-${item.id}`,
        kind: 'deviation' as const,
        projectId: project.id,
        projectTitle: project.title,
        text: `Deviation ${item.type}: ${item.reason}`,
        at: item.approvedAt ?? project.createdAt,
      })),
    );

    return [...progressActivities, ...deviationActivities]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);
  }, [projects]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Executive Portfolio</h1>
        <p className="max-w-2xl leading-relaxed text-zinc-500 dark:text-zinc-400">
          Real-time project visibility from Neon-backed storage across execution, budget, risk, and operations.
        </p>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading CEO portfolio from Neon DB...</p>}
      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Projects"
          value={String(stats.activeProjects)}
          icon={Briefcase}
          delta={{ value: 'Live', isPositive: true }}
          description="Total projects currently in execution."
          delay={0.1}
        />
        <StatCard
          label="Budget Utilization"
          value={`${stats.budgetHealth}%`}
          icon={TrendingUp}
          delta={{ value: 'Live', isPositive: true }}
          description="Spent vs allocated budget across projects."
          delay={0.2}
        />
        <StatCard
          label="Pending Deviations"
          value={String(stats.pendingDeviations)}
          icon={AlertTriangle}
          delta={{ value: 'Live', isPositive: stats.pendingDeviations < 3 }}
          description="Open deviations pending approval."
          delay={0.3}
        />
        <StatCard
          label="Assigned Members"
          value={String(stats.platformUsers)}
          icon={Users}
          delta={{ value: 'Live', isPositive: true }}
          description="Users assigned to project teams."
          delay={0.4}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Active Projects</h2>
            <Link href="/ceo/projects" className="text-sm font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400">
              Manage All Projects
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {projects.slice(0, 6).map((project) => {
              const status = mapStatus(project.status);
              const allocated = project.budgets.reduce((sum, item) => sum + item.allocated, 0);
              const spent = project.budgets.reduce((sum, item) => sum + item.spent, 0);
              const progress = Math.min(100, Math.max(5, project._count.progressUpdates * 8));

              return (
                <Link key={project.id} href={`/ceo/projects/${project.id}`}>
                  <Card className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{project.title}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{project.location || 'Location not set'}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {status.replace('-', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>Completion</span>
                          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-zinc-400">Budget</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{formatMoney(allocated || spent || 0)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-400">Team</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{project._count.members}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">System Pulse</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length === 0 && <p className="text-sm text-zinc-500">No activity recorded yet.</p>}
              {activities.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/ceo/projects/${activity.projectId}`}
                  className="block rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="mb-1 flex items-center gap-2">
                    {activity.kind === 'progress' ? (
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{activity.projectTitle}</p>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">{activity.text}</p>
                  <p className="mt-1 text-xs text-zinc-400">{new Date(activity.at).toLocaleString()}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950">
            <CardContent className="space-y-3 p-6">
              <h4 className="font-bold tracking-tight">Executive Actions</h4>
              <p className="text-xs leading-relaxed text-zinc-300 dark:text-zinc-600">
                Drill into project delivery, budgets, and risks directly from persistent Neon data.
              </p>
              <Link
                href="/ceo/projects"
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-xs font-bold transition-colors hover:bg-white/20 dark:bg-zinc-900/10 dark:hover:bg-zinc-900/20"
              >
                Open Portfolio Details
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
