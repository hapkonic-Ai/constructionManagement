'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MoreVertical, 
  Calendar, 
  Users, 
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

interface Project {
  id: string;
  slug: string;
  name: string;
  status: 'on-track' | 'delayed' | 'deviation';
  progress: number;
  startDate: string;
  endDate: string;
  teamSize: number;
  budget: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    slug: 'azure-tower',
    name: 'Azure Tower Phase 1',
    status: 'on-track',
    progress: 68,
    startDate: 'Jan 2026',
    endDate: 'Dec 2026',
    teamSize: 24,
    budget: '$4.2M',
  },
  {
    id: '2',
    slug: 'project-helios',
    name: 'Project Helios - Solar Farm',
    status: 'deviation',
    progress: 32,
    startDate: 'Mar 2026',
    endDate: 'Oct 2027',
    teamSize: 12,
    budget: '$18.5M',
  },
  {
    id: '3',
    slug: 'neo-genesis-plaza',
    name: 'Neo-Genesis Plaza',
    status: 'delayed',
    progress: 15,
    startDate: 'May 2026',
    endDate: 'Jun 2028',
    teamSize: 45,
    budget: '$85.0M',
  },
];

const statusStyles = {
  'on-track': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  'delayed': 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
  'deviation': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
};

const statusLabels = {
  'on-track': 'On Track',
  'delayed': 'Delayed',
  'deviation': 'Deviation',
};

export const ProjectGrid: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {mockProjects.map((project, index) => (
        <Link 
          key={project.id} 
          href={`/ceo/projects/${project.slug}`}
          className="group"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex flex-col h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 backdrop-blur-xl transition-all hover:border-zinc-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[project.status]}`}>
                  {statusLabels[project.status]}
                </div>
                <button className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 stop-propagation" onClick={(e) => e.preventDefault()}>
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              <h4 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-600 dark:group-hover:text-amber-400 transition-colors">
                {project.name}
              </h4>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium tracking-tight">PROGRESSION</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={`h-full rounded-full ${
                        project.status === 'on-track' ? 'bg-emerald-500' : 
                        project.status === 'delayed' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-zinc-400" />
                    <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">{project.teamSize} STAFFED</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-zinc-100 p-4 dark:border-zinc-800 bg-zinc-50/30 group-hover:bg-zinc-50 transition-colors">
              <div className="flex w-full items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>PROJECT PROFILE</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
      
      {/* Create New Project Placeholder Card */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: mockProjects.length * 0.1 }}
        className="flex flex-col items-center justify-center min-h-[220px] rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-6 transition-all hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/20 dark:hover:border-amber-500/30 shadow-inner"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-800">
          <span className="text-2xl text-zinc-400 font-light">+</span>
        </div>
        <span className="mt-4 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] px-2 text-center leading-relaxed">
          Initialize Site
        </span>
      </motion.button>
    </div>
  );
};
