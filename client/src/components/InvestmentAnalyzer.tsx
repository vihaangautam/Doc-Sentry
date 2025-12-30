import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateXIRR, formatINR } from '../utils/financialMath';
import { API_BASE_URL } from '../apiConfig';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ChatAdvisor from './ChatAdvisor';
import { useAuth } from '../context/AuthContext';
import {
    PiggyBank,
    AlertTriangle,
    TrendingUp,
    UploadCloud,
    CheckCircle2,
    PieChart as PieIcon,
    ShieldAlert,
    Zap,
    ChevronDown,
} from 'lucide-react';

// --- INDIAN CONTEXT LOGIC START ---

// 1. Risk Categorization optimized for Indian Insurance/Investments
const getRiskCategory = (text: string) => {
    const lower = text.toLowerCase();

    // High Severity (Wealth Killers)
    if (lower.includes('surrender') || lower.includes('discontinuance'))
        return { title: 'High Surrender Charges', severity: 'high' as const };
    if (lower.includes('mortality') || lower.includes('admin') || lower.includes('allocation'))
        return { title: 'High Hidden Charges', severity: 'high' as const };
    if (lower.includes('lock-in') && lower.includes('5 years'))
        return { title: '5-Year Lock-in (ULIP)', severity: 'medium' as const };

    // Medium Severity (Inflation/Market)
    if (lower.includes('inflation') || lower.includes('real return'))
        return { title: 'Inflation Risk', severity: 'medium' as const };
    if (lower.includes('market') || lower.includes('equity') || lower.includes('nav'))
        return { title: 'Market Volatility', severity: 'medium' as const };

    return { title: 'Policy Condition', severity: 'low' as const };
};

// 2. Opportunity Categorization (Tax & Optimization)
const getOpportunityCategory = (text: string) => {
    const lower = text.toLowerCase();

    if (lower.includes('80c')) return { title: 'Tax Deduction (Sec 80C)' };
    if (lower.includes('10(10d)')) return { title: 'Tax-Free Maturity' };
    if (lower.includes('switch') || lower.includes('fund')) return { title: 'Fund Switching Option' };
    if (lower.includes('paid-up')) return { title: 'Make Policy Paid-Up?' };
    if (lower.includes('term') || lower.includes('cover')) return { title: 'Insurance Adequacy' };

    return { title: 'Growth Strategy' };
};

// --- INDIAN CONTEXT LOGIC END ---

interface ExtractionData {
    policy_name: string;
    premium_amount: number;
    payment_frequency: string; // "Monthly", "Annual", etc.
    policy_term_years: number;
    maturity_years: number;
    maturity_benefit_illustration: number;
    red_flags: string[];
    opportunities?: string[];
}

const InvestmentAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ExtractionData | null>(null);
    const [xirr, setXirr] = useState<number | null>(null);
    const [netProfit, setNetProfit] = useState<number | null>(null);
    const [totalInvested, setTotalInvested] = useState<number | null>(null);
    const [view, setView] = useState<'upload' | 'dashboard'>('upload');
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();

    // Accordion State
    const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
    const [expandedOpp, setExpandedOpp] = useState<number | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setData(null);
        setXirr(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Replace with your backend URL

            // ... existing imports ...

            // ... inside component ...
            const response = await axios.post(`${API_BASE_URL}/api/analyze/investment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${session?.access_token}`
                },
            });

            const extracted: ExtractionData = response.data.data;
            console.log("Final Investment Data:", extracted);

            // Mock opportunities if missing (Indian Context defaults)
            if (!extracted.opportunities || extracted.opportunities.length === 0) {
                extracted.opportunities = [
                    "Check if 'Maturity Proceeds' are tax-free under Section 10(10D).",
                    "Premium paid qualifies for tax deduction under Section 80C (up to 1.5L).",
                    "If returns are < 6%, consider making the policy 'Paid-Up' to stop losses."
                ];
            }

            setData(extracted);

            // --- ROBUST CALCULATION LOGIC (FIXED XIRR BUG) ---
            const safeNum = (val: any) => Number(val) || 0;
            const installmentPremium = safeNum(extracted.premium_amount);
            const termYears = safeNum(extracted.policy_term_years) || 10;
            const maturityVal = safeNum(extracted.maturity_benefit_illustration);
            const frequency = extracted.payment_frequency?.toLowerCase() || 'annual';

            // 1. Determine Payment Frequency Multiplier
            let paymentsPerYear = 1;
            if (frequency.includes('mon')) paymentsPerYear = 12;
            else if (frequency.includes('quart')) paymentsPerYear = 4;
            else if (frequency.includes('half')) paymentsPerYear = 2;

            // 2. Calculate Actual Total Invested
            const totalPaymentsCount = termYears * paymentsPerYear;
            const totalInv = installmentPremium * totalPaymentsCount;
            const profit = maturityVal - totalInv;

            setTotalInvested(totalInv);
            setNetProfit(profit);

            // 3. Generate Correct Cash Flows for XIRR
            if (installmentPremium > 0 && maturityVal > 0) {
                const flow = [];
                const startDate = new Date();

                // Generate Outflows based on Frequency
                for (let i = 0; i < totalPaymentsCount; i++) {
                    const date = new Date(startDate);

                    // Logic to increment date correctly based on frequency
                    if (paymentsPerYear === 12) {
                        date.setMonth(startDate.getMonth() + i);
                    } else if (paymentsPerYear === 4) {
                        date.setMonth(startDate.getMonth() + (i * 3));
                    } else if (paymentsPerYear === 2) {
                        date.setMonth(startDate.getMonth() + (i * 6));
                    } else {
                        date.setFullYear(startDate.getFullYear() + i);
                    }

                    // Cash outflow is negative
                    flow.push({ amount: -Math.abs(installmentPremium), date: date });
                }

                // Generate Inflow (Maturity)
                const maturityDate = new Date(startDate);
                maturityDate.setFullYear(startDate.getFullYear() + (extracted.maturity_years || 15));

                // Cash inflow is positive
                flow.push({ amount: maturityVal, date: maturityDate });

                const resultXirr = calculateXIRR(flow);
                setXirr(resultXirr);
            }

            setView('dashboard');

        } catch (err) {
            console.error(err);
            setError("Failed to analyze document. Please check the file format.");
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!totalInvested || !netProfit) return [];
        return [
            { name: 'Invested', value: totalInvested, color: '#6366f1', desc: 'Principal' }, // Indigo
            { name: 'Profit', value: netProfit, color: '#10b981', desc: 'Growth' }, // Emerald
        ].filter(item => item.value > 0);
    };

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {view === 'upload' ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-2xl mx-auto py-12"
                    >
                        {/* Centered Upload Hero */}
                        <div className="glass-card p-12 relative overflow-hidden group text-center border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="p-4 bg-indigo-500/10 rounded-2xl mb-6 shadow-inner ring-1 ring-indigo-500/20">
                                    <PiggyBank className="text-indigo-400" size={48} />
                                </div>

                                <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Investment Audit</h1>
                                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                                    Decode your policy. Reveal the <span className="text-indigo-400 font-semibold">Real XIRR</span> vs the Agent's Promise.
                                </p>

                                <div className="w-full max-w-md border-2 border-dashed border-slate-700 rounded-2xl p-10 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group-hover:shadow-[inset_0_0_20px_rgba(99,102,241,0.05)] relative">
                                    <input
                                        type="file"
                                        id="invest-upload"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="flex flex-col items-center gap-4 relative z-10">
                                        <div className={`p-4 rounded-full transition-all duration-300 ${file ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:scale-110'}`}>
                                            {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-slate-200 text-lg">
                                                {file ? file.name : "Drop policy file here"}
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {file ? "Ready to analyze" : "Supports PDF, JPG, PNG"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    className="mt-8"
                                    animate={{ opacity: file ? 1 : 0.5, y: file ? 0 : 10 }}
                                >
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={!file || loading}
                                        className="btn-primary w-full md:w-auto px-8 py-3 text-lg bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:shadow-none"
                                    >
                                        {loading ? "Decoding Returns..." : "Analyze Investment"}
                                    </button>
                                </motion.div>
                                {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, scale: 0.99 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col gap-6 h-[calc(100vh-100px)] overflow-hidden"
                    >
                        {/* --- ROW 1: METRICS --- */}
                        <div className="shrink-0 grid grid-cols-12 gap-6 h-[140px]">
                            {/* Card 1: XIRR */}
                            <div className="col-span-4 glass-card p-5 bg-indigo-500/5 border-indigo-500/20 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Real Return (XIRR)</span>
                                    <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">ANNUALIZED</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <div className={`text-4xl font-display font-bold tracking-tight ${xirr! < 0.06 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {(xirr! * 100).toFixed(2)}%
                                    </div>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {xirr! < 0.06 ? 'Below Inflation (6%)' : 'Beats Inflation'}
                                    </span>
                                </div>
                            </div>

                            {/* Card 2: Net Profit */}
                            <div className="col-span-4 glass-card p-5 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Net Profit</span>
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">GAIN</span>
                                </div>
                                <div className="text-4xl font-display font-bold text-slate-200 tracking-tight">{formatINR(netProfit || 0)}</div>
                            </div>

                            {/* Card 3: Maturity Value */}
                            <div className="col-span-4 glass-card p-5 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Maturity Value</span>
                                    <span className="text-xs font-bold text-blue-500 bg-blue-900/10 px-2 py-0.5 rounded">OUTPUT</span>
                                </div>
                                <div className="text-4xl font-display font-bold text-slate-200 tracking-tight">{formatINR(data?.maturity_benefit_illustration || 0)}</div>
                            </div>
                        </div>

                        {/* --- ROW 2: MAIN CONTENT --- */}
                        <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 pb-2">

                            {/* COLUMN 1: Growth Chart */}
                            <div className="col-span-12 lg:col-span-3 glass-card p-0 flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b border-white/5 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <PieIcon size={14} className="text-indigo-400" /> Wealth Ratio
                                    </h3>
                                </div>
                                <div className="h-[40%] min-h-[160px] shrink-0 flex items-center justify-center relative p-4 border-b border-white/5">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={getChartData()}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {getChartData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => formatINR(value)} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-indigo-400">
                                                {((netProfit || 0) / (totalInvested || 1) * 100).toFixed(0)}%
                                            </div>
                                            <div className="text-[9px] text-slate-500 uppercase font-bold">Absolute Return</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            <span className="text-slate-300">Invested</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(totalInvested ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-slate-300">Profit</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(netProfit ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-slate-400">Policy Term</span>
                                        <span className="font-mono text-slate-200">{data?.policy_term_years} Years</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-slate-400">Maturity after</span>
                                        <span className="font-mono text-slate-200">{data?.maturity_years} Years</span>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 2: Risks & Opportunities */}
                            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 h-full min-h-0">

                                {/* Risk Section */}
                                <div className="flex-1 min-h-0 glass-card p-0 flex flex-col overflow-hidden border-white/10">
                                    <div className="p-4 border-b border-white/5 bg-red-500/5 shrink-0">
                                        <h3 className="font-bold text-red-400 text-sm flex items-center gap-2">
                                            <ShieldAlert size={16} /> Risk Factors ({data?.red_flags?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                        {(data?.red_flags?.length || 0) > 0 ? (
                                            (data?.red_flags || []).map((flagStr, i) => {
                                                const { title, severity } = getRiskCategory(flagStr);
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => setExpandedRisk(expandedRisk === i ? null : i)}
                                                        className={`group border rounded-xl p-4 transition-all cursor-pointer ${expandedRisk === i
                                                            ? 'bg-red-500/10 border-red-500/30'
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-4">
                                                                <div className={`mt-0.5 ${severity === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                                                                    <AlertTriangle size={18} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="font-bold text-slate-200 text-sm">{title}</h4>
                                                                        {severity === 'high' && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">High</span>}
                                                                    </div>
                                                                    <div className={`text-xs text-slate-400 leading-relaxed transition-all ${expandedRisk === i ? 'block' : 'line-clamp-2'}`}>
                                                                        {flagStr}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ChevronDown size={16} className={`text-slate-600 transition-transform mt-1 ${expandedRisk === i ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-500 text-sm">
                                                <CheckCircle2 size={16} /> No critical risks found.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Opportunity Section */}
                                <div className="flex-1 min-h-0 glass-card p-0 flex flex-col overflow-hidden border-white/10">
                                    <div className="p-4 border-b border-white/5 bg-indigo-500/5 shrink-0">
                                        <h3 className="font-bold text-indigo-400 text-sm flex items-center gap-2">
                                            <TrendingUp size={16} /> Wealth Opportunities ({data?.opportunities?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                        {(data?.opportunities?.length || 0) > 0 ? (
                                            (data?.opportunities || []).map((tipStr, i) => {
                                                const { title } = getOpportunityCategory(tipStr);
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => setExpandedOpp(expandedOpp === i ? null : i)}
                                                        className={`group border rounded-xl p-4 transition-all cursor-pointer ${expandedOpp === i
                                                            ? 'bg-indigo-500/10 border-indigo-500/30'
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-4">
                                                                <div className="mt-0.5 text-indigo-400">
                                                                    <Zap size={18} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-slate-200 text-sm mb-1">{title}</h4>
                                                                    <div className={`text-xs text-slate-400 leading-relaxed transition-all ${expandedOpp === i ? 'block' : 'line-clamp-2'}`}>
                                                                        {tipStr}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ChevronDown size={16} className={`text-slate-600 transition-transform mt-1 ${expandedOpp === i ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-slate-500 text-xs">No opportunities identified.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* COLUMN 3: Advisor AI */}
                            <div className="col-span-12 lg:col-span-4 glass-card p-0 flex flex-col h-full overflow-hidden border-2 border-slate-800 focus-within:border-indigo-500/30 transition-colors">
                                <div className="p-3 border-b border-white/5 bg-slate-800/50 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                        <h3 className="font-bold text-slate-200 text-sm">Wealth Advisor AI</h3>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-950/20 relative min-h-0">
                                    <ChatAdvisor context={data} embedded={true} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InvestmentAnalyzer;