import React from 'react';
import { motion } from 'framer-motion';
import {
    LineChart,
    Line,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    FileText,
    AlertTriangle,
    ArrowUpRight,
    TrendingUp,
    Activity,
    PiggyBank,
    HandCoins,
    Banknote,
    ChevronRight,
    Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';

const dummyData = [
    { name: 'Mon', audits: 40, risks: 24 },
    { name: 'Tue', audits: 30, risks: 13 },
    { name: 'Wed', audits: 20, risks: 58 },
    { name: 'Thu', audits: 27, risks: 39 },
    { name: 'Fri', audits: 18, risks: 48 },
    { name: 'Sat', audits: 23, risks: 38 },
    { name: 'Sun', audits: 34, risks: 43 },
];

const Overview: React.FC = () => {
    return (
        <div className="space-y-8">
            {/* Valid Greeting */}
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Welcome to DocSentry</h1>
                <p className="text-slate-400 mt-1">Your premium financial document analysis platform</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Card 1: Total Audits (Cyan) */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-400 transition-colors">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Total Audits</p>
                                <h3 className="text-3xl font-bold text-white mt-1">247</h3>
                            </div>
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                <FileText size={20} />
                            </div>
                        </div>

                        <div className="h-16 w-full -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dummyData}>
                                    <Line type="monotone" dataKey="audits" stroke="#22d3ee" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-cyan-500 text-xs font-bold mt-2 flex items-center gap-1">
                            +12.3% <span className="text-slate-500 font-normal">from last month</span>
                        </p>
                    </div>
                </div>

                {/* Card 2: Risk Flags (Red) */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-red-500/30 relative overflow-hidden group hover:border-red-400 transition-colors">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Risk Flags</p>
                                <h3 className="text-3xl font-bold text-white mt-1">18</h3>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <AlertTriangle size={20} />
                            </div>
                        </div>

                        <div className="h-16 w-full -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dummyData}>
                                    <Line type="monotone" dataKey="risks" stroke="#ef4444" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                            -8.2% <span className="text-slate-500 font-normal">from last month</span>
                        </p>
                    </div>
                </div>

                {/* Card 3: Avg Savings (Green) */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-400 transition-colors">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Avg. Savings</p>
                                <h3 className="text-3xl font-bold text-white mt-1">$3.2K</h3>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <ArrowUpRight size={20} />
                            </div>
                        </div>

                        {/* Simple visual bar instead of chart */}
                        <div className="mt-6">
                            <div className="flex items-end gap-1 h-10">
                                <div className="w-2 bg-emerald-500/20 rounded-t h-[40%]"></div>
                                <div className="w-2 bg-emerald-500/20 rounded-t h-[60%]"></div>
                                <div className="w-2 bg-emerald-500/40 rounded-t h-[50%]"></div>
                                <div className="w-2 bg-emerald-500/60 rounded-t h-[80%]"></div>
                                <div className="w-2 bg-emerald-500 rounded-t h-[100%] shadow-[0_0_10px_#10b981]"></div>
                            </div>
                        </div>
                        <p className="text-emerald-500 text-xs font-bold mt-4 flex items-center gap-1">
                            +13.5% <span className="text-slate-500 font-normal">from last month</span>
                        </p>
                    </div>
                </div>

                {/* Card 4: Circular Gauge (Right) */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-indigo-500/30 flex items-center justify-center relative">
                    <div className="w-32 h-32 relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="58"
                                stroke="#10b981"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray="364"
                                strokeDashoffset="90" // 75% filled
                                strokeLinecap="round"
                                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-2xl font-bold text-white">$4.5K</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split View: Recent Audits & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Audits List (Span 2) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Recent Audits</h2>
                        <button className="text-sm text-indigo-400 hover:text-indigo-300">View all</button>
                    </div>

                    <div className="space-y-3">
                        {/* Item 1 */}
                        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800/50 flex items-center justify-between hover:bg-[#1f2937] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Acme Corp</h4>
                                    <p className="text-slate-500 text-xs">Investment Audit • 2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low Risk</span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">Completed</span>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="p-4 rounded-xl bg-[#111827] border border-cyan-500/30 flex items-center justify-between hover:bg-[#1f2937] transition-colors group shadow-[0_0_15px_rgba(34,211,238,0.05)]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">TechStart Inc</h4>
                                    <p className="text-slate-500 text-xs">Loan Audit • 5 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium Risk</span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 animate-pulse">In Progress</span>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800/50 flex items-center justify-between hover:bg-[#1f2937] transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <Banknote size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Global Solutions</h4>
                                    <p className="text-slate-500 text-xs">Salary Audit • 1 day ago</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low Risk</span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">Completed</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions (Span 1) */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Quick Actions</h2>

                    <Link to="/investment" className="block group">
                        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp size={24} />
                                <span className="font-bold">Investment Analysis</span>
                            </div>
                            <p className="text-indigo-100 text-xs opacity-80">Review investment documents</p>
                        </div>
                    </Link>

                    <Link to="/loan" className="block group">
                        <div className="p-4 rounded-xl bg-[#1e293b] border border-slate-700 hover:border-slate-600 hover:bg-[#253248] transition-all group-hover:scale-[1.02]">
                            <div className="flex items-center gap-3 mb-2 text-slate-200">
                                <HandCoins size={24} />
                                <span className="font-bold">Loan Audit</span>
                            </div>
                            <p className="text-slate-500 text-xs">Analyze loan agreements</p>
                        </div>
                    </Link>

                    <Link to="/salary" className="block group">
                        <div className="p-4 rounded-xl bg-[#1e293b] border border-green-900/30 hover:border-green-500/50 hover:bg-[#142320] transition-all group-hover:scale-[1.02] relative overflow-hidden">
                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-3 mb-2 text-emerald-400">
                                <Banknote size={24} />
                                <span className="font-bold">Salary Review</span>
                            </div>
                            <p className="text-slate-500 text-xs">Audit compensation docs</p>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Overview;
