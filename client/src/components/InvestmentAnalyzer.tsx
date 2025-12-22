import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { calculateXIRR, formatINR } from '../utils/financialMath';
import ChatAdvisor from './ChatAdvisor';
import { PiggyBank, FileText, AlertTriangle, TrendingUp, UploadCloud, CheckCircle2 } from 'lucide-react';

interface ExtractionData {
    policy_name: string;
    premium_amount: number;
    payment_frequency: string;
    policy_term_years: number;
    maturity_years: number;
    maturity_benefit_illustration: number;
    red_flags: string[];
}

const InvestmentAnalyzer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ExtractionData | null>(null);
    const [xirr, setXirr] = useState<number | null>(null);
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
        setXirr(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/api/analyze/investment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const extracted = response.data.data;
            setData(extracted);

            // Calculate XIRR locally
            if (extracted && extracted.premium_amount && extracted.maturity_benefit_illustration) {
                const flow = [];
                const annualPremium = extracted.premium_amount;
                const yearsToPay = extracted.policy_term_years || 10;

                // Assume start date is today
                const startDate = new Date();

                // Outflows (Premiums)
                for (let i = 0; i < yearsToPay; i++) {
                    const date = new Date(startDate);
                    date.setFullYear(startDate.getFullYear() + i);
                    flow.push({
                        amount: -Math.abs(annualPremium),
                        date: date
                    });
                }

                // Inflow (Maturity)
                const maturityDate = new Date(startDate);
                maturityDate.setFullYear(startDate.getFullYear() + (extracted.maturity_years || 15));
                flow.push({
                    amount: extracted.maturity_benefit_illustration,
                    date: maturityDate
                });

                const resultXirr = calculateXIRR(flow);
                setXirr(resultXirr);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to analyze document. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero / Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
                {/* Upload Card - Spans 2 cols */}
                <div className="lg:col-span-2 glass-card p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-500/20 rounded-xl">
                                <PiggyBank className="text-indigo-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-white">Investment Audit</h1>
                                <p className="text-slate-400 text-sm">Upload policy illustration to decode real returns</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-10 hover:border-indigo-500/50 hover:bg-slate-800/30 transition-all text-center group-hover:shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                            <input
                                type="file"
                                id="file-upload"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-full transition-all duration-300 ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:scale-110'}`}>
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
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={!file || loading}
                                className="btn-primary w-full md:w-auto text-sm"
                            >
                                {loading ? "Decoding..." : "Run Analysis"}
                            </button>
                        </div>
                        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
                    </div>
                </div>

                {/* XIRR Score Card (Preview/Result) */}
                <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Real Return (XIRR)</h3>
                        {xirr !== null ? (
                            <div className="mt-2">
                                <div className={`text-6xl font-display font-bold tracking-tighter ${xirr < 0.05 ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]' : (xirr < 0.07 ? 'text-amber-400' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]')}`}>
                                    {(xirr * 100).toFixed(2)}%
                                </div>
                                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${xirr < 0.05 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                    {xirr < 0.05 ? <TrendingUp className="rotate-180" size={14} /> : <TrendingUp size={14} />}
                                    <span>{xirr < 0.05 ? "INFLATION LOSER" : "WEALTH BUILDER"}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 font-mono text-sm border border-dashed border-slate-700 rounded-xl mt-4 bg-slate-900/20">
                                AWAITING DATA
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"
                                initial={{ width: "0%" }}
                                animate={{ width: xirr ? `${Math.min(Math.max(xirr * 1000, 10), 100)}%` : "0%" }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                            <span>0% (Loss)</span>
                            <span>6% (Inflation)</span>
                            <span>12% (Nifty)</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Results Grid - Bento Style */}
            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Key Details - Span 2 */}
                    <div className="md:col-span-2 glass-card p-6">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                            <FileText className="text-indigo-400" size={20} />
                            Extracted Parameters
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Policy Name</div>
                                <div className="font-semibold text-white text-lg truncate" title={data.policy_name}>{data.policy_name}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Annual Premium</div>
                                <div className="font-semibold text-white text-lg">{formatINR(data.premium_amount)}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Duration</div>
                                <div className="font-semibold text-white text-lg">{data.policy_term_years} Years</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Expected Maturity</div>
                                <div className="font-semibold text-emerald-400 text-lg">{formatINR(data.maturity_benefit_illustration)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Red Flags - Span 1 */}
                    <div className={`glass-card p-6 ${data.red_flags?.length > 0 ? 'border-red-500/30 bg-red-900/10' : 'border-emerald-500/30'}`}>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                            <AlertTriangle className={data.red_flags?.length > 0 ? "text-red-400" : "text-emerald-400"} size={20} />
                            {data.red_flags?.length > 0 ? "Risk Assessment" : "Safe Investment"}
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
                                <p className="text-emerald-200 font-medium">No hidden clauses detected.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {data && <ChatAdvisor context={data} />}
        </div>
    );
};

export default InvestmentAnalyzer;
