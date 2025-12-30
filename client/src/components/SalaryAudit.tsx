import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '../utils/financialMath';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ChatAdvisor from './ChatAdvisor';
import { useAuth } from '../context/AuthContext';
import {
    Banknote,
    AlertTriangle,
    CheckCircle2,
    UploadCloud,
    PieChart as PieIcon,
    ShieldAlert,
    ChevronDown,
    Zap,
    Calculator
} from 'lucide-react';

// Manual Categorization Logic for risk
const getRiskCategory = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('tax') || lower.includes('tds')) return { title: 'Tax Liability', severity: 'high' as const };
    if (lower.includes('pf') || lower.includes('provident')) return { title: 'PF Compliance', severity: 'medium' as const };
    if (lower.includes('notice') || lower.includes('bond') || lower.includes('separation')) return { title: 'Exit Policy', severity: 'high' as const };
    if (lower.includes('variable') || lower.includes('performance') || lower.includes('bonus')) return { title: 'Variable Pay Risk', severity: 'medium' as const };
    if (lower.includes('gratutity') || lower.includes('insurance')) return { title: 'Benefits Gap', severity: 'medium' as const };
    return { title: 'General Anomaly', severity: 'low' as const };
};

// Manual Categorization Logic for negotiation tips
const getNegotiationCategory = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('bonus') || lower.includes('joining') || lower.includes('sign')) return { title: 'Joining Bonus' };
    if (lower.includes('relocation') || lower.includes('moving')) return { title: 'Relocation Package' };
    if (lower.includes('variable') || lower.includes('base') || lower.includes('fix')) return { title: 'Base vs Variable' };
    if (lower.includes('esop') || lower.includes('equity') || lower.includes('stock')) return { title: 'Equity / ESOPs' };
    if (lower.includes('notice') || lower.includes('buyout')) return { title: 'Notice Period Buyout' };
    return { title: 'Salary Structure' };
};

interface SalaryData {
    company_name: string;
    ctc_annual: number;
    basic_salary_monthly: number;
    hra_monthly: number;
    special_allowance_monthly: number;
    total_gross_monthly: number;
    pf_employee_monthly: number;
    pf_employer_annual: number;
    professional_tax_monthly: number;
    gratuity_annual: number;
    insurance_benefit_annual: number;
    variable_performance_bonus_annual: number;
    other_deductions_monthly: number;
    red_flags: string[];
    negotiation_tips?: string[];
}

const SalaryAudit: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SalaryData | null>(null);
    const [inHandMonthly, setInHandMonthly] = useState<number | null>(null);
    const [deductionsMonthly, setDeductionsMonthly] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'upload' | 'dashboard'>('upload');
    const { session } = useAuth();

    // Accordion expansion state
    const [expandedRisk, setExpandedRisk] = useState<number | null>(null);
    const [expandedNeg, setExpandedNeg] = useState<number | null>(null);

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
            const response = await axios.post('http://localhost:8000/api/analyze/salary', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${session?.access_token}`
                },
            });
            const extracted: SalaryData = response.data.data;
            console.log("Raw Extracted Data:", extracted);

            // --- ROBUST CALCULATION LOGIC START ---
            const safeNum = (val: any) => Number(val) || 0;

            const basic = safeNum(extracted.basic_salary_monthly);
            const hra = safeNum(extracted.hra_monthly);
            const special = safeNum(extracted.special_allowance_monthly);
            const grossProvided = safeNum(extracted.total_gross_monthly);

            // 1. Determine Actual Monthly Gross
            // If gross is 0 or missing, calculate it from components
            const monthlyGross = grossProvided > 0 ? grossProvided : (basic + hra + special);

            // 2. Auto-Calculate Missing Statutory Deductions

            // PF Logic: If extracted PF is 0 but Basic > 0, assume 12% mandatory deduction
            let pf = safeNum(extracted.pf_employee_monthly);
            if (pf === 0 && basic > 0) {
                pf = basic * 0.12;
                console.log("Auto-calculated PF:", pf);
            }

            // ESI Logic: If Gross < 21,000, Employee contributes 0.75%
            let esi = 0;
            if (monthlyGross < 21000 && monthlyGross > 0) {
                esi = monthlyGross * 0.0075;
                console.log("Auto-calculated ESI:", esi);
            }

            // Professional Tax Logic: If 0, assume standard ~200 INR (varies by state, but safer to assume deduction)
            let proTax = safeNum(extracted.professional_tax_monthly);
            if (proTax === 0 && monthlyGross > 0) {
                proTax = 200;
            }

            const otherDeductions = safeNum(extracted.other_deductions_monthly);

            // 3. Calculate Totals
            // We combine ESI into 'otherDeductions' for simplicity in the UI if ESI doesn't have its own field
            const totalMonthlyDeductions = pf + proTax + otherDeductions + esi;
            const inHand = monthlyGross - totalMonthlyDeductions;

            console.log("Final Calc:", { monthlyGross, totalMonthlyDeductions, inHand });

            // 4. Update Data Object for UI Consistency
            // We update the extracted object so the List View matches the calculated totals
            const processedData: SalaryData = {
                ...extracted,
                pf_employee_monthly: pf,
                professional_tax_monthly: proTax,
                other_deductions_monthly: otherDeductions + esi, // Rolling ESI into others for display
                total_gross_monthly: monthlyGross
            };

            setData(processedData);
            setInHandMonthly(inHand);
            setDeductionsMonthly(totalMonthlyDeductions);
            setView('dashboard');
            // --- ROBUST CALCULATION LOGIC END ---

        } catch (err) {
            console.error(err);
            setError("Failed to analyze salary document. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!data || !inHandMonthly) return [];

        // Ensure values are numbers for chart
        const safeVal = (n: any) => Number(n) || 0;

        return [
            { name: 'In-Hand', value: inHandMonthly * 12, color: '#10b981', desc: 'Liquid Cash' }, // Emerald
            { name: 'PF/Gratuity', value: (safeVal(data.pf_employer_annual) + safeVal(data.gratuity_annual) + (safeVal(data.pf_employee_monthly) * 12)), color: '#3b82f6', desc: 'Locked Retirement' }, // Blue
            { name: 'Taxes', value: ((safeVal(data.professional_tax_monthly) * 12) + safeVal(data.insurance_benefit_annual)), color: '#ef4444', desc: 'Deductions' }, // Red
            { name: 'Variable', value: safeVal(data.variable_performance_bonus_annual), color: '#a855f7', desc: 'Performance Based' }, // Purple
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
                        <div className="glass-card p-12 relative overflow-hidden group text-center border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl mb-6 shadow-inner ring-1 ring-emerald-500/20">
                                    <Banknote className="text-emerald-400" size={48} />
                                </div>

                                <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-tight">Salary Reality Check</h1>
                                <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
                                    Decode your offer letter. Find out your <span className="text-emerald-400 font-semibold">Real In-Hand</span> vs. Cost-to-Company (CTC).
                                </p>

                                <div className="w-full max-w-md border-2 border-dashed border-slate-700 rounded-2xl p-10 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group-hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] relative">
                                    <input
                                        type="file"
                                        id="salary-upload"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="flex flex-col items-center gap-4 relative z-10">
                                        <div className={`p-4 rounded-full transition-all duration-300 ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:scale-110'}`}>
                                            {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-slate-200 text-lg">
                                                {file ? file.name : "Drop offer letter here"}
                                            </p>
                                            <p className="text-slate-500 text-sm">
                                                {file ? "Ready to reveal truth" : "Supports PDF, JPG, PNG"}
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
                                        className="btn-primary w-full md:w-auto px-8 py-3 text-lg bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:shadow-none"
                                    >
                                        {loading ? "Decrypting Salary..." : "Reveal True Salary"}
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
                            {/* Card 1: In-Hand */}
                            <div className="col-span-4 glass-card p-5 bg-emerald-500/5 border-emerald-500/20 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Net In-Hand</span>
                                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">LIQUID</span>
                                </div>
                                <div className="text-4xl font-display font-bold text-white tracking-tight">{formatINR(inHandMonthly ?? 0)}</div>
                            </div>

                            {/* Card 2: Deductions */}
                            <div className="col-span-4 glass-card p-5 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-red-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Deductions</span>
                                    <span className="text-xs font-bold text-red-500 bg-red-900/10 px-2 py-0.5 rounded">LOSS</span>
                                </div>
                                <div className="text-4xl font-display font-bold text-slate-200 tracking-tight">{formatINR(deductionsMonthly || 0)}</div>
                            </div>

                            {/* Card 3: Annual CTC */}
                            <div className="col-span-4 glass-card p-5 flex flex-col justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Annual CTC</span>
                                    <span className="text-xs font-bold text-blue-500 bg-blue-900/10 px-2 py-0.5 rounded">GROSS</span>
                                </div>
                                <div className="text-4xl font-display font-bold text-slate-200 tracking-tight">{formatINR(data?.ctc_annual || 0)}</div>
                            </div>
                        </div>

                        {/* --- ROW 2: MAIN CONTENT (Fills remaining space) --- */}
                        <div className="flex-1 min-h-0 grid grid-cols-12 gap-6 pb-2">

                            {/* COLUMN 1: Salary Structure (Ledger) */}
                            <div className="col-span-12 lg:col-span-3 glass-card p-0 flex flex-col h-full overflow-hidden">
                                <div className="p-4 border-b border-white/5 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                                        <PieIcon size={14} className="text-emerald-400" /> Salary Structure
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
                                            <div className="text-xl font-bold text-emerald-400">
                                                {((data?.ctc_annual || (data?.total_gross_monthly ?? 0) * 12)
                                                    ? ((inHandMonthly ?? 0) / (data?.ctc_annual || (data?.total_gross_monthly ?? 0) * 12) * 100)
                                                    : 0).toFixed(0)}%
                                            </div>
                                            <div className="text-[9px] text-slate-500 uppercase font-bold">In-Hand</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-slate-300">Basic Pay</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(data?.basic_salary_monthly ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="text-slate-300">HRA</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(data?.hra_monthly ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                            <span className="text-slate-300">Allowances</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(data?.special_allowance_monthly ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                            <span className="text-slate-300">PF (Employee)</span>
                                        </div>
                                        {/* Uses the safe, auto-calculated PF from data object */}
                                        <span className="font-mono font-medium text-slate-200">{formatINR(data?.pf_employee_monthly ?? 0)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <span className="text-slate-300">Prof. Tax</span>
                                        </div>
                                        <span className="font-mono font-medium text-slate-200">{formatINR(data?.professional_tax_monthly ?? 0)}</span>
                                    </div>
                                    {(data?.other_deductions_monthly ?? 0) > 0 && (
                                        <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                <span className="text-slate-300">Other / ESI</span>
                                            </div>
                                            <span className="font-mono font-medium text-slate-200">{formatINR(data?.other_deductions_monthly ?? 0)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* COLUMN 2: Risks & Negotiation (5 cols) */}
                            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 h-full min-h-0">
                                {/* Risk Section (Flex-1) */}
                                <div className="flex-1 min-h-0 glass-card p-0 flex flex-col overflow-hidden border-white/10">
                                    <div className="p-4 border-b border-white/5 bg-red-500/5 shrink-0">
                                        <h3 className="font-bold text-red-400 text-sm flex items-center gap-2">
                                            <ShieldAlert size={16} /> Critical Risks ({data?.red_flags?.length || 0})
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

                                                                    <div className={`text-xs text-slate-400 leading-relaxed transition-all ${expandedRisk === i ? 'block' : 'line-clamp-2'
                                                                        }`}>
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
                                                <CheckCircle2 size={16} /> No critical risks detected.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Negotiation Section (Flex-1) */}
                                <div className="flex-1 min-h-0 glass-card p-0 flex flex-col overflow-hidden border-white/10">
                                    <div className="p-4 border-b border-white/5 bg-purple-500/5 shrink-0">
                                        <h3 className="font-bold text-purple-400 text-sm flex items-center gap-2">
                                            <Zap size={16} /> Leverage Points ({data?.negotiation_tips?.length || 0})
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                                        {(data?.negotiation_tips?.length || 0) > 0 ? (
                                            (data?.negotiation_tips || []).map((tipStr, i) => {
                                                const { title } = getNegotiationCategory(tipStr);
                                                return (
                                                    <div
                                                        key={i}
                                                        onClick={() => setExpandedNeg(expandedNeg === i ? null : i)}
                                                        className={`group border rounded-xl p-4 transition-all cursor-pointer ${expandedNeg === i
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
                                                                    <div className={`text-xs text-slate-400 leading-relaxed transition-all ${expandedNeg === i ? 'block' : 'line-clamp-2'
                                                                        }`}>
                                                                        {tipStr}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <ChevronDown size={16} className={`text-slate-600 transition-transform mt-1 ${expandedNeg === i ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-slate-500 text-xs">AI is generating leverage...</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* COLUMN 3: Auditor AI (Fills height) */}
                            <div className="col-span-12 lg:col-span-4 glass-card p-0 flex flex-col h-full overflow-hidden border-2 border-slate-800 focus-within:border-emerald-500/30 transition-colors">
                                <div className="p-3 border-b border-white/5 bg-slate-800/50 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <h3 className="font-bold text-slate-200 text-sm">Auditor AI</h3>
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

export default SalaryAudit;