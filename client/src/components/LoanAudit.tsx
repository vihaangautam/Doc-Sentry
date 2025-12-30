import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateAPR, formatINR } from '../utils/financialMath';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ChatAdvisor from './ChatAdvisor';
import { useAuth } from '../context/AuthContext';
import {
    HandCoins,
    FileText,
    AlertTriangle,
    CheckCircle2,
    UploadCloud,
    Calculator,
    PieChart as PieIcon,
    ShieldAlert,
    Zap,
    ChevronDown,
    Landmark
} from 'lucide-react';

// Manual Categorization Logic for Loan Risks
const getRiskCategory = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('floating') || lower.includes('variable') || lower.includes('reset')) return { title: 'Interest Rate Risk', severity: 'high' as const };
    if (lower.includes('penalty') || lower.includes('charge') || lower.includes('fee')) return { title: 'Hidden Charges', severity: 'medium' as const };
    if (lower.includes('insurance') || lower.includes('bundled')) return { title: 'Bundled Insurance', severity: 'medium' as const };
    if (lower.includes('default') || lower.includes('late')) return { title: 'Default Clauses', severity: 'high' as const };
    return { title: 'General Condition', severity: 'low' as const };
};

// Logic for Loan Optimization Tips
const getOptimizationCategory = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('prepayment') || lower.includes('foreclosure')) return { title: 'Prepayment Options' };
    if (lower.includes('transfer') || lower.includes('refinance')) return { title: 'Balance Transfer' };
    if (lower.includes('insurance') || lower.includes('coverage')) return { title: 'Insurance Opt-out' };
    if (lower.includes('tenure') || lower.includes('term')) return { title: 'Tenure Optimization' };
    return { title: 'Loan Structure' };
};

interface LoanData {
    bank_name: string;
    loan_amount: number;
    interest_rate_quoted: number; // e.g. 8.5
    tenure_months: number;
    processing_fees: number;
    insurance_bundled: number;
    other_charges: number;
    emi_amount: number;
    loan_type: string;
    red_flags: string[];
    optimization_tips?: string[]; // Added to match structure, even if empty from backend for now
}

const LoanAudit: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LoanData | null>(null);
    const [effectiveAPR, setEffectiveAPR] = useState<number | null>(null);
    const [totalInterest, setTotalInterest] = useState<number | null>(null);
    const [view, setView] = useState<'upload' | 'dashboard'>('upload');
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();

    // Accordion State
    const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
    const [expandedOpt, setExpandedOpt] = useState<number | null>(null);

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

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/analyze/loan', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${session?.access_token}`
                },
            });

            const extracted: LoanData = response.data.data;

            // Mock optimization tips if not present (to match UI structure)
            if (!extracted.optimization_tips) {
                extracted.optimization_tips = [
                    "Check if 'Bundled Insurance' is mandatory. RBI guidelines often make it optional.",
                    "Negotiate the 'Processing Fee'. Many banks waive this for premium profiles.",
                    "Ensure there are no 'Prepayment Penalties' for floating rate loans (RBI mandated)."
                ];
            }

            setData(extracted);

            // Calculations
            if (extracted && extracted.loan_amount && extracted.interest_rate_quoted) {
                const totalFees = (extracted.processing_fees || 0) + (extracted.insurance_bundled || 0) + (extracted.other_charges || 0);
                const quotedRateDecimal = extracted.interest_rate_quoted / 100;
                const tenure = extracted.tenure_months || 240;

                const apr = calculateAPR(
                    extracted.loan_amount,
                    totalFees,
                    tenure,
                    quotedRateDecimal
                );

                // Total Interest Payable = (EMI * Tenure) - Principal
                const totalRepayment = (extracted.emi_amount || 0) * tenure;
                const interest = totalRepayment - extracted.loan_amount;

                setEffectiveAPR(apr);
                setTotalInterest(interest);
                setView('dashboard');
            }
        } catch (err) {
            console.error(err);
            setError("Failed to analyze loan document.");
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!data || !totalInterest) return [];
        return [
            { name: 'Principal', value: data.loan_amount, color: '#06b6d4', desc: 'Loan Amount' }, // Cyan
            { name: 'Interest', value: totalInterest, color: '#ef4444', desc: 'Cost of Borrowing' }, // Red
            { name: 'Fees', value: (data.processing_fees || 0) + (data.insurance_bundled || 0), color: '#fbbf24', desc: 'Upfront Loss' }, // Amber
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
                        <div className="glass-card p-12 relative overflow-hidden group text-center border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="p-4 bg-cyan-500/10 rounded-2xl mb-6 shadow-inner ring-1 ring-cyan-500/20">
                                    <HandCoins className="text-cyan-400" size={48} />
                                </div>

                                <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Loan Decoder</h1>
                                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                                    Find the <span className="text-cyan-400 font-semibold">True Cost</span> of your loan. Reveal hidden fees and effective APR.
                                </p>

                                <div className="w-full max-w-md border-2 border-dashed border-slate-700 rounded-2xl p-10 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group-hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] relative">
                                    <input
                                        type="file"
                                        id="loan-upload"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="flex flex-col items-center gap-4 relative z-10">
                                        <div className={`p-4 rounded-full transition-all duration-300 ${file ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:scale-110'}`}>
                                            {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-slate-200 text-lg">
                                                {file ? file.name : "Drop sanction letter here"}
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {file ? "Ready to audit" : "Supports PDF, JPG, PNG"}
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
                                        className="btn-primary w-full md:w-auto px-8 py-3 text-lg bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] disabled:shadow-none"
                                    >
                                        {loading ? "Hunting Hidden Fees..." : "Audit Loan Agreement"}
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
                        {/* --- ROW 1: METRICS (Fixed Height) --- */}
                        <div className="shrink-0 grid grid-cols-12 gap-6 h-[140px]">
                            {/* Card 1: APR */}
                            <div className="col-span-4 glass-card p-5 bg-cyan-500/5 border-cyan-500/20 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Effective APR</span>
                                    <span className="text-xs font-bold text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">REAL RATE</span>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <div className="text-4xl font-display font-bold text-white tracking-tight">{(effectiveAPR! * 100).toFixed(2)}%</div>
                                    <span className="text-xs text-red-400 font-medium">
                                        (+{((effectiveAPR! * 100) - (data?.interest_rate_quoted || 0)).toFixed(2)}%)
                                    </span>
                                </div>
                            </div>

                            {/* Card 2: EMI */}
                            <div className="col-span-4 glass-card p-5 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Monthly EMI</span>
                                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">OUTFLOW</span>
                                </div>
                                <div className="text-4xl font-display font-bold text-slate-200 tracking-tight">{formatINR(data?.emi_amount || 0)}</div>
                            </div>

                            {/* Card 3: Total Interest */}
                            <div className="col-span-4 glass-card p-5 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-red-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Interest</span>
                                    <span className="text-xs font-bold text-red-500 bg-red-900/10 px-2 py-0.5 rounded">COST</span>
                                </div>
                                <div className="text-4xl font-display font-bold text-slate-200 tracking-tight">{formatINR(totalInterest || 0)}</div>
                            </div>
                        </div>

                        {/* --- ROW 2: MAIN CONTENT --- */}
                        <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 pb-2">

                            {/* COLUMN 1: Payment Breakup */}
                            <div className="col-span-12 lg:col-span-3 glass-card p-0 flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b border-white/5 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <PieIcon size={14} className="text-cyan-400" /> Repayment Breakup
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
                                            <div className="text-xl font-bold text-cyan-400">
                                                {data?.tenure_months}m
                                            </div>
                                            <div className="text-[9px] text-slate-500 uppercase font-bold">Tenure</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                            <span className="text-slate-300">Principal</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(data?.loan_amount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span className="text-slate-300">Interest</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(totalInterest)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                            <span className="text-slate-300">Fees & Charges</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR((data?.processing_fees || 0) + (data?.insurance_bundled || 0))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 2: Risks & Tips */}
                            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 h-full min-h-0">
                                {/* Risk Section */}
                                <div className="flex-1 min-h-0 glass-card p-0 flex flex-col overflow-hidden border-white/10">
                                    <div className="p-4 border-b border-white/5 bg-red-500/5 shrink-0">
                                        <h3 className="font-bold text-red-400 text-sm flex items-center gap-2">
                                            <ShieldAlert size={16} /> Risk Analysis ({data?.red_flags?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                        {data?.red_flags?.length > 0 ? (
                                            data.red_flags.map((flagStr, i) => {
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

                                {/* Optimization Section */}
                                <div className="flex-1 min-h-0 glass-card p-0 flex flex-col overflow-hidden border-white/10">
                                    <div className="p-4 border-b border-white/5 bg-purple-500/5 shrink-0">
                                        <h3 className="font-bold text-purple-400 text-sm flex items-center gap-2">
                                            <Zap size={16} /> Optimization Tips ({data?.optimization_tips?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                        {data?.optimization_tips?.length > 0 ? (
                                            data.optimization_tips.map((tipStr, i) => {
                                                const { title } = getOptimizationCategory(tipStr);
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => setExpandedOpt(expandedOpt === i ? null : i)}
                                                        className={`group border rounded-xl p-4 transition-all cursor-pointer ${expandedOpt === i
                                                            ? 'bg-purple-500/10 border-purple-500/30'
                                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex gap-4">
                                                                <div className="mt-0.5 text-purple-400">
                                                                    <Calculator size={18} />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-slate-200 text-sm mb-1">{title}</h4>
                                                                    <div className={`text-xs text-slate-400 leading-relaxed transition-all ${expandedOpt === i ? 'block' : 'line-clamp-2'}`}>
                                                                        {tipStr}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ChevronDown size={16} className={`text-slate-600 transition-transform mt-1 ${expandedOpt === i ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-slate-500 text-xs">No optimization tips available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 3: Auditor AI */}
                            <div className="col-span-12 lg:col-span-4 glass-card p-0 flex flex-col h-full overflow-hidden border-2 border-slate-800 focus-within:border-cyan-500/30 transition-colors">
                                <div className="p-3 border-b border-white/5 bg-slate-800/50 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                                        <h3 className="font-bold text-slate-200 text-sm">Loan Advisor AI</h3>
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

export default LoanAudit;
