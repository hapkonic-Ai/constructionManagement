'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Maximize2, Settings2, Search } from 'lucide-react';
import { GanttChart, Task } from '@/components/dashboard/GanttChart';
import { Card, CardContent } from '@/components/ui/card';

const VIEW_OPTIONS = ['month', 'quarter', 'year'] as const;
type ViewMode = (typeof VIEW_OPTIONS)[number];

type ProjectApi = {
  id: string;
  title: string;
  status: string;
};

type GanttTaskApi = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  progress: number;
  assignedTo: string | null;
};

function monthDiff(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

function toInitials(name: string | null | undefined): string {
  if (!name) return 'NA';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || 'NA';
}

function taskStatus(progress: number, projectStatus: string): Task['status'] {
  if (progress >= 100) return 'completed';
  const normalized = projectStatus.toUpperCase();
  if (normalized.includes('DELAY')) return 'delayed';
  if (progress > 0) return 'in-progress';
  return 'upcoming';
}

export default function GlobalGanttPage() {
  const [view, setView] = useState<ViewMode>('month');
  const [search, setSearch] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadGantt() {
      setLoading(true);
      setError(null);

      try {
        const projectsRes = await fetch('/api/projects', { cache: 'no-store' });
        const projectsPayload = await projectsRes.json();

        if (!projectsRes.ok || !Array.isArray(projectsPayload?.data)) {
          throw new Error(projectsPayload?.error?.message || 'Failed to load projects');
        }

        const projects = projectsPayload.data as ProjectApi[];

        const taskResults = await Promise.all(
          projects.map(async (project) => {
            const res = await fetch(`/api/projects/${project.id}/gantt`, { cache: 'no-store' });
            const payload = await res.json();
            if (!res.ok || !Array.isArray(payload?.data)) return [];

            return (payload.data as GanttTaskApi[]).map((task) => ({
              projectTitle: project.title,
              projectStatus: project.status,
              task,
            }));
          }),
        );

        const flat = taskResults.flat();
        const starts = flat.map((item) => new Date(item.task.startDate).getTime()).filter((value) => Number.isFinite(value));
        const baseline = starts.length > 0 ? new Date(Math.min(...starts)) : new Date();

        const mapped: Task[] = flat.map((item) => {
          const startAt = new Date(item.task.startDate);
          const endAt = new Date(item.task.endDate);
          const rawStart = Math.max(0, monthDiff(baseline, startAt));
          const rawDuration = Math.max(1, monthDiff(startAt, endAt) + 1);
          const start = Math.min(17, rawStart);
          const duration = Math.min(18 - start, rawDuration);

          return {
            id: item.task.id,
            name: `[${item.projectTitle}] ${item.task.title}`,
            start,
            duration: Math.max(1, duration),
            status: taskStatus(item.task.progress, item.projectStatus),
            assignee: toInitials(item.task.assignedTo),
          };
        });

        if (!mounted) return;
        setTasks(mapped);
        setProjectCount(projects.length);
      } catch (loadErr) {
        if (!mounted) return;
        setError(loadErr instanceof Error ? loadErr.message : 'Failed to load gantt data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadGantt();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tasks;
    return tasks.filter((task) => task.name.toLowerCase().includes(term));
  }, [tasks, search]);

  const stats = useMemo(() => {
    const delayed = tasks.filter((task) => task.status === 'delayed').length;
    const active = tasks.filter((task) => task.status === 'in-progress').length;
    const done = tasks.filter((task) => task.status === 'completed').length;
    const upcoming = tasks.filter((task) => task.status === 'upcoming').length;
    return { delayed, active, done, upcoming };
  }, [tasks]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Global Schedule</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Integrated timeline of all platform-wide construction milestones from Neon DB.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 active:scale-95 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800">
            <Download className="h-4 w-4" />
            <span>Export Master Plan</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
            <Maximize2 className="h-4 w-4" />
            <span>Fullscreen Mode</span>
          </button>
        </div>
      </div>

      <Card className="border-none bg-zinc-100/50 backdrop-blur-md dark:bg-zinc-900/50">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setView(option)}
                className={`rounded-md px-6 py-1.5 text-xs font-bold uppercase tracking-widest transition-all ${
                  view === option
                    ? 'bg-zinc-900 text-white shadow-md dark:bg-zinc-50 dark:text-zinc-900'
                    : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search milestones..."
                className="h-9 w-56 rounded-lg border border-zinc-200 bg-white pl-9 pr-4 text-xs tracking-tight transition-all focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <button className="flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              <Settings2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Configuration</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-zinc-500">Loading Gantt tasks from Neon storage...</p>}
      {error && <p className="text-sm text-rose-500">{error}</p>}
      {!loading && !error && filteredTasks.length === 0 && (
        <p className="text-sm text-zinc-500">No Gantt milestones available for the current search.</p>
      )}

      {!error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GanttChart tasks={filteredTasks} title="Consolidated Platform Timeline — Neon Synced" />
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: 'Delayed Tasks', value: String(stats.delayed), color: 'text-rose-500' },
          { label: 'In Progress', value: String(stats.active), color: 'text-amber-500' },
          { label: 'Completed Tasks', value: String(stats.done), color: 'text-emerald-500' },
          { label: 'Active Projects', value: String(projectCount), color: 'text-zinc-900 dark:text-zinc-50' },
        ].map((stat) => (
          <Card key={stat.label} className="border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
            <CardContent className="p-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{stat.label}</p>
              <p className={`text-2xl font-bold tracking-tighter ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
