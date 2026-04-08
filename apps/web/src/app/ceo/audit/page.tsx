'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  User, 
  Shield, 
  AlertCircle, 
  FileText,
  MousePointer2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockLogs = [
  {
    id: '1',
    user: 'Alex Stratos',
    role: 'CEO',
    action: 'Approved Budget Increase',
    target: 'Azure Tower Phase 1',
    timestamp: '2026-04-05 09:24 AM',
    type: 'critical',
    ip: '192.168.1.42'
  },
  {
    id: '2',
    user: 'Sarah Chen',
    role: 'Project Lead',
    action: 'Raised Deviation Alert',
    target: 'Helsinki Tech Hub',
    timestamp: '2026-04-05 08:15 AM',
    type: 'warning',
    ip: '10.0.4.112'
  },
  {
    id: '3',
    user: 'John Doe',
    role: 'Site Admin',
    action: 'Updated Workforce Allocation',
    target: 'Neo-Berlin Residential',
    timestamp: '2026-04-04 05:30 PM',
    type: 'info',
    ip: '172.16.0.8'
  },
  {
    id: '4',
    user: 'System Bot',
    role: 'Automated',
    action: 'Snapshot Generated',
    target: 'Global Portfolio',
    timestamp: '2026-04-04 12:00 AM',
    type: 'system',
    ip: 'internal'
  },
  {
    id: '5',
    user: 'Alex Stratos',
    role: 'CEO',
    action: 'Modified Access Permissions',
    target: 'Tokyo Sky Gardens',
    timestamp: '2026-04-03 02:45 PM',
    type: 'critical',
    ip: '192.168.1.42'
  },
  {
    id: '6',
    user: 'Elena Torres',
    role: 'CFO',
    action: 'Finalized Q1 Financials',
    target: 'Platform-wide',
    timestamp: '2026-04-02 11:30 AM',
    type: 'critical',
    ip: '192.168.1.15'
  }
];

const typeStyles = {
  critical: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-zinc-900 dark:bg-zinc-50',
  system: 'bg-zinc-400',
};

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Audit Transparency</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Comprehensive immutable logs of all CEO-level and cross-project actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800">
            <Download className="h-4 w-4" />
            <span>Generate PDF Report</span>
          </button>
          <button className="p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search logs by action or target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-xs transition-all focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 cursor-pointer hover:bg-white dark:hover:bg-zinc-800">Events: All</Badge>
          <Badge variant="outline" className="h-8 px-3 cursor-pointer hover:bg-white dark:hover:bg-zinc-800">Actors: All</Badge>
          <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors ml-4">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Type</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actor</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Action performed</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Target</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Timestamp</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">IP ADDRESS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {mockLogs.map((log, idx) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <td className="p-4">
                      <div className={`h-2.5 w-2.5 rounded-full ${typeStyles[log.type as keyof typeof typeStyles]}`} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{log.user}</p>
                          <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{log.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {log.target}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                      {log.timestamp}
                    </td>
                    <td className="p-4 text-[10px] font-mono text-zinc-400 uppercase group-hover:text-zinc-600 transition-colors">
                      {log.ip}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Security Context Side */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/20">
          <CardContent className="p-6 flex items-start gap-4">
            <Shield className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">Security Integrity</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/60 leading-relaxed">
                All platform actions are cryptographically signed and stored in immutable ledger clusters.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 dark:bg-zinc-50 border-none shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <CardContent className="p-6 relative">
            <Lock className="h-6 w-6 text-white dark:text-zinc-900 mb-4 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-white dark:text-zinc-900 mb-1">Privileged Access</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Your CEO account has master transparency rights. All underlying logs are accessible.
            </p>
          </CardContent>
        </Card>

        <Card className="border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <AlertCircle className="h-6 w-6 text-zinc-300 mb-2" />
            <p className="text-xs text-zinc-500 italic">No anomalies detected in the last 72 hours of operations.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
