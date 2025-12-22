import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { calculateAPR, formatINR } from '../utils/financialMath';
import ChatAdvisor from './ChatAdvisor';
import { HandCoins, FileText, AlertTriangle, CheckCircle2, UploadCloud, Percent } from 'lucide-react';

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
}

const LoanAudit: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LoanData | null>(null);
    const [effectiveAPR, setEffectiveAPR] = useState<number | null>(null);
    const [extraCost, setExtraCost] = useState<number | null>(null);
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
            const response = await axios.post('http://localhost:8000/api/analyze/loan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const extracted: LoanData = response.data.data;
            setData(extracted);

            // Calculate effective APR
            if (extracted && extracted.loan_amount && extracted.interest_rate_quoted) {
                const totalFees = (extracted.processing_fees || 0) + (extracted.insurance_bundled || 0) + (extracted.other_charges || 0);
                const quotedRateDecimal = extracted.interest_rate_quoted / 100;

                const apr = calculateAPR(
                    extracted.loan_amount,
                    totalFees,
                    extracted.tenure_months || 240,
                    quotedRateDecimal
                );

                setEffectiveAPR(apr);
                setExtraCost(totalFees);
            }

        } catch (err) {
            console.error(err);
            setError("Failed to analyze loan document.");
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                <HandCoins className="text-cyan-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-display font-bold text-white">Loan Decoder</h1>
                                <p className="text-slate-400 text-sm">Upload sanction letter to find hidden fees & true APR</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-slate-700/50 rounded-2xl p-10 hover:border-cyan-500/50 hover:bg-slate-800/30 transition-all text-center group-hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]">
                            <input
                                type="file"
                                id="loan-upload"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="loan-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-full transition-all duration-300 ${file ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:scale-110'}`}>
                                    {file ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-slate-200 text-lg">
                                        {file ? file.name : "Drop loan agreement here"}
                                    </p>
                                    <p className="text-slate-500 text-sm">
                                        {file ? "Ready to audit" : "Supports PDF, JPG, PNG"}
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={!file || loading}
                                className="btn-primary w-full md:w-auto text-sm bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                            >
                                {loading ? "Hunting Hidden Fees..." : "Audit Loan Agreement"}
                            </button>
                        </div>
                        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>}
                    </div>
                </div>

                {/* APR Score Card */}
                <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Effective APR</h3>
                        {effectiveAPR !== null ? (
                            <div className="mt-2">
                                <div className="text-6xl font-display font-bold tracking-tighter text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]">
                                    {(effectiveAPR * 100).toFixed(2)}%
                                </div>
                                <p className="text-sm text-slate-400 mt-2">
                                    Real cost is <span className="text-red-400 font-bold">+{(effectiveAPR * 100 - (data?.interest_rate_quoted || 0)).toFixed(2)}%</span> higher than quoted {(data?.interest_rate_quoted)}%.
                                </p>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-600 font-mono text-sm border border-dashed border-slate-700 rounded-xl mt-4 bg-slate-900/20">
                                AWAITING DATA
                            </div>
                        )}
                    </div>

                    {extraCost !== null && extraCost > 0 && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-red-300 font-bold uppercase tracking-wider">Upfront Loss</span>
                                <AlertTriangle size={14} className="text-red-400" />
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">{formatINR(extraCost)}</div>
                            <p className="text-[10px] text-red-300/70">Lost immediately to processing fees & insurance.</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Key Details */}
                    <div className="md:col-span-2 glass-card p-6">
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                            <FileText className="text-cyan-400" size={20} />
                            Extracted Terms
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Lender</div>
                                <div className="font-semibold text-white text-lg truncate">{data.bank_name}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Loan Amount</div>
                                <div className="font-semibold text-white text-lg">{formatINR(data.loan_amount)}</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Tenure</div>
                                <div className="font-semibold text-white text-lg">{data.tenure_months} Months</div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Processing Fee</div>
                                <div className="font-semibold text-red-400 text-lg">{formatINR(data.processing_fees || 0)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Red Flags */}
                    <div className={`glass-card p-6 ${data.red_flags?.length > 0 ? 'border-red-500/30 bg-red-900/10' : 'border-emerald-500/30'}`}>
                        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                            <AlertTriangle className={data.red_flags?.length > 0 ? "text-red-400" : "text-emerald-400"} size={20} />
                            {data.red_flags?.length > 0 ? "Risk Assessment" : "Safe Loan"}
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
                                <p className="text-emerald-200 font-medium">No hidden fees detected.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {data && <ChatAdvisor context={data} />}
        </div>
    );
};

export default LoanAudit;
