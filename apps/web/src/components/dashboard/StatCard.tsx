'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  delta,
  description,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl transition-all hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:shadow-none"
    >
      {/* Background Sparkle Effect */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-zinc-100/50 blur-3xl transition-colors group-hover:bg-amber-100/30 dark:bg-zinc-800/50 dark:group-hover:bg-amber-900/10" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value}
          </h3>
          
          {delta && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`flex items-center text-xs font-semibold ${
                  delta.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {delta.isPositive ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {delta.value}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                vs last month
              </span>
            </div>
          )}
        </div>
        
        <div className="rounded-xl bg-zinc-100 p-3 text-zinc-600 transition-colors group-hover:bg-amber-100 group-hover:text-amber-600 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-amber-900/30 dark:group-hover:text-amber-400">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {description && (
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </motion.div>
  );
};
