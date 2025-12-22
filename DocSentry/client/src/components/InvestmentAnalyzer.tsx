import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { calculateXIRR, formatINR } from '../utils/financialMath';
import ChatAdvisor from './ChatAdvisor';
import { PiggyBank, FileText, AlertTriangle } from 'lucide-react';

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

                // Outflows (Premiums)
                const frequency = extracted.payment_frequency?.toLowerCase().includes("month") ? 12 : 1;
                const yearsToPay = extracted.policy_term_years || 10;
                const annualPremium = extracted.premium_amount;

                // Assume start date is today
                const startDate = new Date();

                for (let i = 0; i < yearsToPay; i++) {
                    const date = new Date(startDate);
                    date.setFullYear(startDate.getFullYear() + i);

                    flow.push({
                        amount: -Math.abs(annualPremium), // Outflow
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
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card p-12 text-center bg-white border border-slate-200 shadow-xl mb-8">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <PiggyBank size={40} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Policy Document</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload your endowment plan or ULIP illustration (PDF/Image) to uncover the real rate of return.</p>

                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <label className="block w-full cursor-pointer group">
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                                <div className="flex flex-col items-center gap-2">
                                    {file ? (
                                        <span className="text-emerald-700 font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                                    ) : (
                                        <>
                                            <span className="text-slate-400 text-sm">Click to Browse or Drag File</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </label>

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? "Analyzing..." : "Load \"Jeevan Trap\" Sample"}
                        </button>
                    </div>
                    {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                </div>


                {data && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {/* Results Card */}
                        <div className="card p-8 bg-white">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <FileText className="text-slate-400" size={20} />
                                <h3 className="text-lg font-bold text-slate-800">Extracted Details</h3>
                            </div>

                            <ul className="space-y-4 text-sm">
                                <li className="flex justify-between items-center"><span className="text-slate-500">Policy Name</span> <span className="font-semibold text-slate-900">{data.policy_name}</span></li>
                                <li className="flex justify-between items-center"><span className="text-slate-500">Premium</span> <span className="font-semibold text-slate-900">{formatINR(data.premium_amount)} / year</span></li>
                                <li className="flex justify-between items-center"><span className="text-slate-500">Term</span> <span className="font-semibold text-slate-900">{data.policy_term_years} Years</span></li>
                                <li className="flex justify-between items-center"><span className="text-slate-500">Maturity (Est)</span> <span className="font-semibold text-slate-900">{formatINR(data.maturity_benefit_illustration)}</span></li>
                            </ul>

                            {data.red_flags && data.red_flags.length > 0 && (
                                <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle size={16} className="text-red-600" />
                                        <h4 className="text-red-700 font-bold text-sm">Red Flags Detected</h4>
                                    </div>
                                    <ul className="list-disc pl-5 text-xs text-red-600 space-y-1">
                                        {data.red_flags.map((flag, i) => <li key={i}>{flag}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* XIRR Card */}
                        <div className="card p-8 bg-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500"></div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2">Real Rate of Return (XIRR)</h3>
                            <p className="text-xs text-slate-400 mb-6">Internal Rate of Return based on cashflows</p>

                            {xirr !== null ? (
                                <>
                                    <div className={`text-7xl font-extrabold my-6 ${xirr < 0.05 ? 'text-red-500' : (xirr < 0.07 ? 'text-yellow-500' : 'text-emerald-500')}`}>
                                        {(xirr * 100).toFixed(2)}%
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${xirr < 0.05 ? 'bg-red-100 text-red-700' : (xirr < 0.07 ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700')}`}>
                                        {xirr < 0.05
                                            ? "TERRIBLE RETURN"
                                            : (xirr < 0.07 ? "BEATS INFLATION (BARELY)" : "GOOD RETURN")}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-6 max-w-xs">
                                        {xirr < 0.05 ? "This policy generates returns worse than a savings account. You are losing money versus inflation." : "Comparable to a standard Fixed Deposit, but with typical insurance lock-in periods."}
                                    </p>
                                </>
                            ) : (
                                <p className="text-slate-400 italic">Analysis required to calculate returns.</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {data && <ChatAdvisor context={data} />}
            </motion.div>
        </div>
    );
};

export default InvestmentAnalyzer;
