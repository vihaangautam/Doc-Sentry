import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';
import {
    FileText,
    AlertTriangle,
    TrendingUp,
    HandCoins,
    Banknote,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface AuditRecord {
    id: string;
    created_at: string;
    filename: string;
    audit_type: 'salary' | 'loan' | 'investment';
    status: string;
    analysis_json: any;
}

const Overview: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAudits: 0,
        riskFlags: 0,
        avgSavings: 0,
        potentialValue: 0
    });
    const [recentAudits, setRecentAudits] = useState<AuditRecord[]>([]);
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('audits')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    setHasData(true);
                    setRecentAudits(data.slice(0, 5));

                    // Calculate Stats
                    let risks = 0;
                    let savings = 0; // Mock calculation logic for now as data structure varies
                    let value = 0;

                    data.forEach(audit => {
                        const json = audit.analysis_json || {};
                        // Defensive checks based on audit type
                        if (json.red_flags && Array.isArray(json.red_flags)) {
                            risks += json.red_flags.length;
                        }

                        // Rough estimations for value (just for demo purposes until backend standardizes)
                        if (audit.audit_type === 'investment') {
                            value += (json.maturity_benefit_illustration || 0);
                        } else if (audit.audit_type === 'salary') {
                            value += (json.ctc_annual || 0);
                        }
                    });

                    setStats({
                        totalAudits: data.length,
                        riskFlags: risks,
                        avgSavings: 0, // Placeholder until we define "Savings" rigorously
                        potentialValue: value
                    });
                } else {
                    setHasData(false);
                }

            } catch (err) {
                console.error("Error fetching audits:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    // Chart Data (Mocking trend for now based on stats)
    const chartData = [
        { name: 'Mon', value: stats.totalAudits > 0 ? 1 : 0 },
        { name: 'Tue', value: stats.totalAudits > 2 ? 3 : 0 },
        { name: 'Wed', value: stats.totalAudits > 5 ? 2 : 0 },
        { name: 'Thu', value: stats.totalAudits > 8 ? 5 : 0 },
        { name: 'Fri', value: stats.totalAudits },
    ];

    return (
        <div className="space-y-8">
            {/* Valid Greeting */}
            <div>
                <h1 className="text-3xl font-display font-bold text-white">Welcome back</h1>
                <p className="text-slate-400 mt-1">Your privacy-first financial dashboard.</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Card 1: Total Audits */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-400 transition-colors">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Total Audits</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.totalAudits}</h3>
                            </div>
                            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                <FileText size={20} />
                            </div>
                        </div>

                        <div className="h-16 w-full -ml-2 min-w-0 min-h-[64px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Card 2: Risk Flags */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-red-500/30 relative overflow-hidden group hover:border-red-400 transition-colors">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Risk Flags Found</p>
                                <h3 className="text-3xl font-bold text-white mt-1">{stats.riskFlags}</h3>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <AlertTriangle size={20} />
                            </div>
                        </div>
                        {/* Reusing same chart for visual consistency/placeholder */}
                        <div className="h-16 w-full -ml-2 min-w-0 min-h-[64px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Card 3: Potential Value */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-400 transition-colors">
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Analyzed Value</p>
                                <h3 className="text-3xl font-bold text-white mt-1">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(stats.potentialValue)}
                                </h3>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Banknote size={20} />
                            </div>
                        </div>
                        <div className="mt-6 flex items-end gap-1 h-10">
                            <div className="w-2 bg-emerald-500/20 rounded-t h-[40%]"></div>
                            <div className="w-2 bg-emerald-500/40 rounded-t h-[60%]"></div>
                            <div className="w-2 bg-emerald-500/60 rounded-t h-[80%]"></div>
                        </div>
                    </div>
                </div>

                {/* Card 4: Action */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-indigo-500/30 relative overflow-hidden group hover:border-indigo-400 transition-colors flex flex-col justify-center items-center text-center cursor-pointer">
                    <Link to="/salary" className="w-full h-full flex flex-col items-center justify-center">
                        <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="font-bold text-white">New Audit</h3>
                        <p className="text-slate-500 text-xs mt-1">Upload a document</p>
                    </Link>
                </div>
            </div>

            {/* Split View: Recent Audits & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Recent Audits List (Span 2) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Recent Audits</h2>
                    </div>

                    <div className="space-y-3">
                        {!hasData ? (
                            <div className="p-8 rounded-xl bg-[#111827] border border-slate-800 border-dashed text-center">
                                <p className="text-slate-400 mb-4">No audits found yet.</p>
                                <Link to="/salary" className="text-indigo-400 hover:text-indigo-300 font-medium">Start your first audit &rarr;</Link>
                            </div>
                        ) : (
                            recentAudits.map((audit) => (
                                <div key={audit.id} className="p-4 rounded-xl bg-[#111827] border border-slate-800/50 flex items-center justify-between hover:bg-[#1f2937] transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${audit.audit_type === 'salary' ? 'bg-emerald-500/10 text-emerald-400' :
                                            audit.audit_type === 'loan' ? 'bg-cyan-500/10 text-cyan-400' :
                                                'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            {audit.audit_type === 'salary' ? <Banknote size={20} /> :
                                                audit.audit_type === 'loan' ? <HandCoins size={20} /> :
                                                    <TrendingUp size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm capitalize">{audit.filename}</h4>
                                            <p className="text-slate-500 text-xs capitalize">
                                                {audit.audit_type} Audit • {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 capitalize">{audit.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
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
                        </div>
                    </Link>

                    <Link to="/loan" className="block group">
                        <div className="p-4 rounded-xl bg-[#1e293b] border border-slate-700 hover:border-slate-600 hover:bg-[#253248] transition-all group-hover:scale-[1.02]">
                            <div className="flex items-center gap-3 mb-2 text-slate-200">
                                <HandCoins size={24} />
                                <span className="font-bold">Loan Audit</span>
                            </div>
                        </div>
                    </Link>

                    <Link to="/salary" className="block group">
                        <div className="p-4 rounded-xl bg-[#1e293b] border border-green-900/30 hover:border-green-500/50 hover:bg-[#142320] transition-all group-hover:scale-[1.02] relative overflow-hidden">
                            <div className="flex items-center gap-3 mb-2 text-emerald-400">
                                <Banknote size={24} />
                                <span className="font-bold">Salary Review</span>
                            </div>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Overview;
