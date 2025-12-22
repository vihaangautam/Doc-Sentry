import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/financialMath';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChatAdvisor from './ChatAdvisor';
import { Banknote, FileText, AlertTriangle, Wallet, CheckCircle2, UploadCloud } from 'lucide-react';

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
}

const SalaryAudit: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SalaryData | null>(null);
    const [inHandMonthly, setInHandMonthly] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

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
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const extracted: SalaryData = response.data.data;
            setData(extracted);

            // Calculate In-Hand
            let monthlyGross = extracted.total_gross_monthly ||
                ((extracted.basic_salary_monthly || 0) + (extracted.hra_monthly || 0) + (extracted.special_allowance_monthly || 0));

            const monthlyDeductions = (extracted.pf_employee_monthly || 0) + (extracted.professional_tax_monthly || 0) + (extracted.other_deductions_monthly || 0);

            const inHand = monthlyGross - monthlyDeductions;
            setInHandMonthly(inHand);

        } catch (err) {
            console.error(err);
            setError("Failed to analyze salary document.");
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!data || !inHandMonthly) return [];
        return [
            { name: 'In-Hand', value: inHandMonthly * 12, color: '#10b981' }, // Emerald
            { name: 'PF/Gratuity (Locked)', value: (data.pf_employer_annual || 0) + (data.gratuity_annual || 0) + ((data.pf_employee_monthly || 0) * 12), color: '#3b82f6' }, // Blue
            { name: 'Taxes/Deductions', value: ((data.professional_tax_monthly || 0) * 12) + ((data.insurance_benefit_annual || 0)), color: '#ef4444' }, // Red
            { name: 'Variable/Bonus', value: data.variable_performance_bonus_annual || 0, color: '#a855f7' }, // Purple
        ].filter(item => item.value > 0);
    };

    return (
        <div className="space-y-6">
            {/* Hero / Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {/* Upload Card */}
                <div className="lg:col-span-2 glass-card p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                <Banknote className="text-emerald-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-white">Salary Reality</h1>
                                <p className="text-slate-400 text-sm">Decode offer letters & payslips to find true in-hand salary</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-10 hover:border-emerald-500/50 hover:bg-slate-800/30 transition-all text-center group-hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                            <input
                                type="file"
                                id="salary-upload"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="salary-upload" className="cursor-pointer flex flex-col items-center gap-4">
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
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={!file || loading}
                                className="btn-primary w-full md:w-auto text-sm bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                            >
                                {loading ? "Decrypting Salary..." : "Reveal True Salary"}
                            </button>
                        </div>
                        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
                    </div>
                </div>

                {/* Score/Preview Card */}
                <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Detailed Breakdown</h3>
                        <div className="h-64 flex items-center justify-center">
                            {data ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getChartData()}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {getChartData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B0F19" strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => formatINR(value)}
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '12px' }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-slate-600 font-mono text-xs p-8 border border-dashed border-slate-700 rounded-xl bg-slate-900/20">
                                    NO DATA ANALYZED
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {data && inHandMonthly !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Key Details Grid */}
                    <div className="md:col-span-2 glass-card p-6">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                            <FileText className="text-emerald-400" size={20} />
                            Monthly Reality
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 col-span-2">
                                <div className="text-emerald-400 text-xs uppercase tracking-wide mb-1">Real In-Hand Salary</div>
                                <div className="font-display font-bold text-emerald-300 text-3xl drop-shadow-lg">{formatINR(inHandMonthly)}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Total Gross</div>
                                <div className="font-semibold text-white text-lg">{formatINR(data.total_gross_monthly)}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">PF Deduction</div>
                                <div className="font-semibold text-red-300 text-lg">-{formatINR(data.pf_employee_monthly || 0)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Red Flags */}
                    <div className={`glass-card p-6 ${data.red_flags?.length > 0 ? 'border-red-500/30 bg-red-900/10' : 'border-emerald-500/30'}`}>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                            <AlertTriangle className={data.red_flags?.length > 0 ? "text-red-400" : "text-emerald-400"} size={20} />
                            {data.red_flags?.length > 0 ? "Issues Found" : "Clean Offer"}
                        </h3>

                        {data.red_flags?.length > 0 ? (
                            <ul className="space-y-3">
                                {data.red_flags.map((flag, i) => (
                                    <li key={i} className="flex gap-2 text-sm text-red-200 bg-red-500/10 p-3 rounded-lg border border-red-500/10">
                                        <span className="text-red-500">•</span>
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>
                                <p className="text-emerald-200 font-medium">Valid structure.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {data && <ChatAdvisor context={data} />}
        </div>
    );
};

export default SalaryAudit;
