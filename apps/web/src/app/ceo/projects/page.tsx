'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

type ProjectApi = {
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
  _count: {
    members: number;
    ganttTasks: number;
    deviations: number;
    progressUpdates: number;
  };
  budgets: Array<{
    allocated: number;
    spent: number;
  }>;
};

type UiProject = {
  id: string;
  name: string;
  location: string;
  status: 'on-track' | 'delayed' | 'deviation';
  progress: number;
  budget: string;
  efficiency: number;
  team: number;
  risk: 'Low' | 'Medium' | 'High' | 'None';
  chartData: Array<{ value: number }>;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function mapStatus(status: string): UiProject['status'] {
  const normalized = status.toUpperCase();
  if (normalized.includes('DELAY')) return 'delayed';
  if (normalized.includes('DEVIATION') || normalized.includes('RISK')) return 'deviation';
  return 'on-track';
}

function mapRisk(deviations: number): UiProject['risk'] {
  if (deviations === 0) return 'None';
  if (deviations <= 2) return 'Low';
  if (deviations <= 5) return 'Medium';
  return 'High';
}

function formatMoney(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function toUiProject(project: ProjectApi): UiProject {
  const status = mapStatus(project.status);
  const team = Math.max(project._count.members, 1);
  const progress = Math.min(100, Math.max(5, project._count.progressUpdates * 8));
  const allocated = project.budgets.reduce((acc, curr) => acc + curr.allocated, 0);
  const spent = project.budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const efficiency = allocated > 0
    ? Math.max(1, Math.min(100, Math.round((spent / allocated) * 100)))
    : Math.max(60, 100 - project._count.deviations * 5);

  const chartData = [
    { value: Math.max(5, progress - 25) },
    { value: Math.max(10, progress - 20) },
    { value: Math.max(15, progress - 15) },
    { value: Math.max(20, progress - 10) },
    { value: Math.max(30, progress - 5) },
    { value: progress },
  ];

  return {
    id: project.id,
    name: project.title,
    location: project.location || 'Location not set',
    status,
    progress,
    budget: formatMoney(allocated || spent || 0),
    efficiency,
    team,
    risk: mapRisk(project._count.deviations),
    chartData,
  };
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<UiProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !Array.isArray(payload?.data)) {
          throw new Error(payload?.error?.message || 'Failed to load projects');
        }

        if (!mounted) return;
        setProjects(payload.data.map(toUiProject));
      } catch (error) {
        if (!mounted) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load projects');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || project.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [projects, searchTerm, filter]);

  async function createProject() {
    if (!newProjectTitle.trim()) {
      setCreateError('Project name is required');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newProjectTitle.trim(),
          location: newProjectLocation.trim() || undefined,
          description: newProjectDescription.trim() || undefined,
          status: 'ACTIVE',
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error?.message || 'Failed to create project');
      }

      const created: ProjectApi = {
        ...payload.data,
        _count: {
          members: 0,
          ganttTasks: 0,
          deviations: 0,
          progressUpdates: 0,
        },
        budgets: [],
      };

      setProjects((current) => [toUiProject(created), ...current]);
      setIsCreateModalOpen(false);
      setNewProjectTitle('');
      setNewProjectLocation('');
      setNewProjectDescription('');
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Project Portfolio</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage and monitor platform-wide construction initiatives.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          <span>Initialize Project</span>
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search projects by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm transition-all focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-50 dark:focus:ring-zinc-50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {['all', 'on-track', 'delayed', 'deviation'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />
          <button className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">Loading projects from Neon storage...</p>}
      {loadError && <p className="text-sm text-rose-500">{loadError}</p>}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredProjects.map((project) => (
          <motion.div key={project.id} variants={itemVariants}>
            <Link href={`/ceo/projects/${project.id}`}>
              <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className={`absolute top-0 right-0 h-1 w-24 rounded-bl-xl ${
                    project.status === 'on-track' ? 'bg-emerald-500' :
                    project.status === 'delayed' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />

                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{project.name}</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{project.location}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">{project.status.replace('-', ' ')}</Badge>
                    </div>

                    <div className="h-16 w-full -mx-2 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={project.chartData}>
                          <defs>
                            <linearGradient id={`gradient-${project.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={project.status === 'on-track' ? '#10b981' : project.status === 'delayed' ? '#f59e0b' : '#f43f5e'} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={project.status === 'on-track' ? '#10b981' : project.status === 'delayed' ? '#f59e0b' : '#f43f5e'} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={project.status === 'on-track' ? '#10b981' : project.status === 'delayed' ? '#f59e0b' : '#f43f5e'}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient-${project.id})`}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-y border-zinc-100 dark:border-zinc-800 py-4 mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Budget</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{project.budget}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Efficiency</p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{project.efficiency}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Workforce</p>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-zinc-400" />
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{project.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">Risk</p>
                        <Badge
                          className={
                            project.risk === 'Low' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400' :
                            project.risk === 'Medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-400' :
                            project.risk === 'High' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400' :
                            'bg-zinc-100 text-zinc-700 dark:bg-zinc-800'
                          }
                          variant="secondary"
                        >
                          {project.risk}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-500 dark:text-zinc-400">Total Completion</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-50">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1.5" />
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-4">
                      <div className="text-xs text-zinc-400">Persisted in Neon DB</div>
                      <button className="p-1 px-3 rounded-lg text-xs font-bold text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1">
                        View Details
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {!isLoading && filteredProjects.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          <Search className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">No projects found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}
            className="mt-4 text-sm font-bold text-zinc-900 hover:underline dark:text-zinc-50"
          >
            Clear all filters
          </button>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCreateModalOpen(false)}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="border-b border-zinc-100 p-6 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Initialize New Initiative</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Creates a real project record in Neon-backed storage.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Project Name</label>
                <input
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Nexus Gardens"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Location</label>
                <input
                  type="text"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
                <textarea
                  rows={3}
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Describe the strategic scope and location..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 p-2.5 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/50"
                />
              </div>

              {createError && <p className="text-sm text-rose-500">{createError}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-950/50">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={isCreating}
                className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-2 text-sm font-bold text-white shadow-lg disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-900"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCreating ? 'Deploying...' : 'Deploy Initiative'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
