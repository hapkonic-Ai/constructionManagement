"use client";

import React from "react";
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Zap, 
  Star,
  Activity,
  MoreVertical,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";

const STAFF_DATA = [
  { name: "Marcus Vane", role: "Project Director", project: "Azure Tower", utilization: 92, efficiency: 98, status: "Active" },
  { name: "Elena Thorne", role: "Site Lead", project: "Project Helios", utilization: 85, efficiency: 74, status: "On Leave" },
  { name: "Julian Graves", role: "Structural Engineer", project: "Neo-Genesis", utilization: 100, efficiency: 91, status: "Active" },
  { name: "Sarah Chen", role: "Safety Inspector", project: "Azure Tower", utilization: 45, efficiency: 88, status: "Active" },
  { name: "Robert Fox", role: "Logistics Mgr", project: "Project Helios", utilization: 78, efficiency: 82, status: "Active" },
];

const SPECIALIZATION_DATA = [
  { name: "Engineering", value: 35, color: "#18181b" },
  { name: "Operations", value: 25, color: "#71717a" },
  { name: "Safety", value: 15, color: "#a1a1aa" },
  { name: "Logistics", value: 25, color: "#e4e4e7" },
];

export default function PeoplePage() {
  return (
    <div className="flex flex-col gap-8 p-8 bg-zinc-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-zinc-400" />
            Resource Allocation
          </h1>
          <p className="text-zinc-500 mt-1 uppercase text-[11px] font-bold tracking-widest">
            Cross-Project Personnel Matrix
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search personnel..." 
              className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all w-64 shadow-sm"
            />
          </div>
          <button className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all shadow-sm">
            <Filter className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
      </div>

      {/* Top Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Workforce Distribution */}
        <Card className="border-zinc-200 shadow-sm bg-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Force Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SPECIALIZATION_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SPECIALIZATION_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
              {SPECIALIZATION_DATA.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{s.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Efficiency */}
        <Card className="border-zinc-200 shadow-sm bg-zinc-900 text-white overflow-hidden relative">
          <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 opacity-10 rotate-12" />
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Global Efficiency Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-6xl font-black italic tracking-tighter">88.4</span>
              <Badge className="bg-emerald-500 text-white border-none font-bold">+2.1%</Badge>
            </div>
            <p className="text-zinc-400 text-xs mt-4">Calculated across 124 active field personnel and supervisors.</p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between text-[10px] font-bold text-zinc-500">
                <span>UTILIZATION RATE</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-1 bg-zinc-800" indicatorClassName="bg-white" />
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border-zinc-200 shadow-sm bg-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-zinc-400">Top Strategic Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {STAFF_DATA.slice(0, 3).map((staff) => (
              <div key={staff.name} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-sm">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{staff.name}</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-medium">{staff.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                    <TrendingUp className="w-3 h-3" />
                    {staff.efficiency}%
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">EFFICIENCY</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Staff Table */}
      <Card className="border-zinc-200 shadow-sm bg-white/70 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Personnel</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Assigned Workspace</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Load</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Efficiency</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody>
              {STAFF_DATA.map((staff) => (
                <tr key={staff.name} className="border-b border-zinc-50 hover:bg-zinc-50/30 transition-all cursor-pointer group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-white font-bold">
                         {staff.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{staff.name}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">{staff.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-zinc-300" />
                        <span className="text-xs font-bold text-zinc-900">{staff.project}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 uppercase font-medium ml-4.5">PORTFOLIO A</span>
                    </div>
                  </td>
                  <td className="p-5 min-w-[150px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900" style={{ width: `${staff.utilization}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-zinc-900">{staff.utilization}%</span>
                    </div>
                  </td>
                  <td className="p-5">
                     <Badge variant="outline" className={`${
                       staff.efficiency > 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                       staff.efficiency > 70 ? 'bg-zinc-50 text-zinc-700 border-zinc-200' :
                       'bg-rose-50 text-rose-700 border-rose-100'
                     } text-[10px] font-black px-2 tracking-tighter`}>
                       {staff.efficiency}% SCORE
                     </Badge>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-300'}`}></div>
                       <span className="text-xs text-zinc-600 font-medium">{staff.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all inline-block" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-zinc-50/30 border-t border-zinc-100 flex justify-center">
          <button className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] hover:text-zinc-900 transition-colors">
            Visualize Full Workforce Graph
          </button>
        </div>
      </Card>
    </div>
  );
}
