"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export interface Task {
  id: string;
  name: string;
  start: number; // 0-based index for the month/week
  duration: number; // number of units
  status: 'completed' | 'in-progress' | 'delayed' | 'upcoming';
  assignee: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan 27", "Feb 27", "Mar 27", "Apr 27", "May 27", "Jun 27"];

interface GanttChartProps {
  tasks?: Task[];
  title?: string;
}

const DEFAULT_TASKS: Task[] = [
  { id: "1", name: "Site Infrastructure", start: 0, duration: 3, status: "completed", assignee: "MV" },
  { id: "2", name: "Foundation Pouring", start: 2, duration: 4, status: "completed", assignee: "JG" },
  { id: "3", name: "Structural Framing", start: 5, duration: 6, status: "in-progress", assignee: "ET" },
  { id: "4", name: "Utility Installation", start: 8, duration: 3, status: "delayed", assignee: "SC" },
  { id: "5", name: "Exterior Finishing", start: 11, duration: 5, status: "upcoming", assignee: "RF" },
  { id: "6", name: "Interior Fit-out", start: 14, duration: 8, status: "upcoming", assignee: "MV" },
];

export const GanttChart = ({ tasks = DEFAULT_TASKS, title = "Project Master Schedule" }: GanttChartProps) => {
  return (
    <div className="w-full bg-white/50 backdrop-blur-sm rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-zinc-400" />
          <h3 className="font-bold text-zinc-900 uppercase tracking-widest text-xs">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-4 mr-6">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-zinc-400">DONE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-[10px] font-bold text-zinc-400">ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span className="text-[10px] font-bold text-zinc-400">DELAY</span>
            </div>
          </div>
          <button className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-all">
            <ChevronLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <button className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-all">
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header row */}
          <div className="flex border-b border-zinc-100 bg-zinc-50/30">
            <div className="w-64 p-4 shrink-0 border-r border-zinc-100 font-black text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
              Milestone Breakdown
            </div>
            <div className="flex-1 flex">
              {MONTHS.map((month, idx) => (
                <div key={idx} className="flex-1 p-4 text-center border-r border-zinc-50 last:border-r-0 font-bold text-[10px] text-zinc-400 uppercase tracking-widest">
                  {month}
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="relative">
            {tasks.map((task: Task) => (
              <div key={task.id} className="flex border-b border-zinc-50 hover:bg-zinc-50/30 transition-all group">
                <div className="w-64 p-4 shrink-0 border-r border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center text-[10px] text-white font-bold">
                      {task.assignee}
                    </div>
                    <span className="text-sm font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors uppercase tracking-tight">{task.name}</span>
                  </div>
                  {task.status === 'delayed' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                </div>
                
                <div className="flex-1 flex relative py-3">
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {MONTHS.map((_, idx) => (
                      <div key={idx} className="flex-1 border-r border-zinc-50/50 last:border-none"></div>
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div className="flex w-full px-2 relative h-10">
                    <div className="flex-1 flex">
                      <div style={{ flex: task.start }}></div>
                      <motion.div 
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ flex: task.duration }}
                        className={`rounded-xl h-full shadow-lg flex items-center px-4 overflow-hidden origin-left ${
                          task.status === 'completed' ? 'bg-zinc-900 text-white shadow-zinc-200' :
                          task.status === 'in-progress' ? 'bg-amber-500 text-white shadow-amber-100' :
                          task.status === 'delayed' ? 'bg-rose-500 text-white shadow-rose-100' :
                          'bg-zinc-100 text-zinc-400 border border-zinc-200 shadow-none'
                        }`}
                      >
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                          {task.status === 'in-progress' && <Clock className="w-4 h-4 animate-pulse" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {task.status}
                          </span>
                        </div>
                      </motion.div>
                      <div style={{ flex: MONTHS.length - (task.start + task.duration) }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-zinc-50/30 border-t border-zinc-100 flex justify-between items-center">
        <div className="flex gap-4">
           <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest underline cursor-pointer hover:text-zinc-900">Critical Path</div>
           <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest underline cursor-pointer hover:text-zinc-900">Resource Load</div>
        </div>
        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
           FISCAL YEAR 2026-2027
        </div>
      </div>
    </div>
  );
};
