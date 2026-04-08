'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  FilePlus, 
  TrendingUp,
  LucideIcon 
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'deviation' | 'milestone' | 'update' | 'design' | 'cost';
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  project: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'deviation',
    user: { name: 'Sarah Chen', role: 'COO' },
    content: 'Raised a cost deviation for Project Helios: +$12,400 due to material surge.',
    timestamp: '2 hours ago',
    project: 'Project Helios',
  },
  {
    id: '2',
    type: 'design',
    user: { name: 'Marcus Aurelius', role: 'CTO' },
    content: 'Released final architectural specs for the Azure Tower foundations.',
    timestamp: '5 hours ago',
    project: 'Azure Tower',
  },
  {
    id: '3',
    type: 'update',
    user: { name: 'John Smith', role: 'Site Manager' },
    content: 'Submitted daily progress report. 45% completion reached on structural phase.',
    timestamp: '8 hours ago',
    project: 'Project Helios',
  },
  {
    id: '4',
    type: 'milestone',
    user: { name: 'Alex Stratos', role: 'CEO' },
    content: 'Acknowledged project kickoff for Neo-Genesis Plaza.',
    timestamp: '1 day ago',
    project: 'Neo-Genesis Plaza',
  },
];

const iconMap: Record<ActivityItem['type'], LucideIcon> = {
  deviation: AlertCircle,
  milestone: CheckCircle2,
  update: MessageSquare,
  design: FilePlus,
  cost: TrendingUp,
};

const colorMap: Record<ActivityItem['type'], string> = {
  deviation: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
  milestone: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  update: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  design: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  cost: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
};

export const ActivityLog: React.FC = () => {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Recent Activity
        </h3>
        <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
          View All Logs
        </button>
      </div>

      <div className="space-y-6">
        {mockActivities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4 pl-0"
            >
              {/* Timeline Connector */}
              {index !== mockActivities.length - 1 && (
                <div className="absolute top-10 left-[18px] bottom-[-24px] w-px bg-zinc-200 dark:bg-zinc-800" />
              )}
              
              <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorMap[activity.type]}`}>
                <Icon className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {activity.user.name}
                    <span className="ml-2 inline-flex items-center rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 uppercase tracking-tighter">
                      {activity.user.role}
                    </span>
                  </p>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {activity.content}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                    {activity.project}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
