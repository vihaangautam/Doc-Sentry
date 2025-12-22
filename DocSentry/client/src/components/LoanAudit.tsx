import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { calculateAPR, formatINR } from '../utils/financialMath';
import ChatAdvisor from './ChatAdvisor';
import { HandCoins, FileText, AlertTriangle, Percent } from 'lucide-react';

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
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card p-12 text-center bg-white border border-slate-200 shadow-xl mb-8">
                    <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HandCoins size={40} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Loan Decoder</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload your loan agreement or sanction letter (PDF/Image) to find hidden fees and effective APR.</p>

                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <label className="block w-full cursor-pointer group">
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                                <div className="flex flex-col items-center gap-2">
                                    {file ? (
                                        <span className="text-blue-700 font-medium text-sm truncate max-w-[200px]">{file.name}</span>
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
                            {loading ? "Hunting Hidden Fees..." : "Audit Loan Agreement"}
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
                        {/* Extracted Card */}
                        <div className="card p-8 bg-white">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <FileText className="text-slate-400" size={20} />
                                <h3 className="text-lg font-bold text-slate-800">Extracted Loan Terms</h3>
                            </div>
                            <ul className="space-y-4 text-sm">
                                <li className="flex justify-between items-center"><span className="text-slate-500">Bank</span> <span className="font-semibold text-slate-900">{data.bank_name}</span></li>
                                <li className="flex justify-between items-center"><span className="text-slate-500">Loan Amount</span> <span className="font-semibold text-slate-900">{formatINR(data.loan_amount)}</span></li>
                                <li className="flex justify-between items-center"><span className="text-slate-500">Quoted Rate</span> <span className="font-semibold text-slate-900">{data.interest_rate_quoted}%</span></li>
                                <li className="flex justify-between items-center"><span className="text-slate-500">Processing Fees</span> <span className="font-semibold text-red-600">{formatINR(data.processing_fees || 0)}</span></li>
                                <li className="flex justify-between items-center"><span className="text-slate-500">Insurance Bundled</span> <span className="font-semibold text-red-600">{formatINR(data.insurance_bundled || 0)}</span></li>
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

                        {/* APR Card */}
                        <div className="card p-8 bg-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-orange-500 to-red-500"></div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Effective APR</h3>
                            <p className="text-xs text-slate-400 mb-6">The true annual cost including all fees</p>

                            {effectiveAPR !== null ? (
                                <>
                                    <div className="flex items-baseline justify-center gap-3 my-4">
                                        <div className="text-2xl text-slate-400 line-through decoration-red-400 decoration-2">
                                            {data.interest_rate_quoted}%
                                        </div>
                                        <div className="text-7xl font-extrabold text-red-600">
                                            {(effectiveAPR * 100).toFixed(2)}%
                                        </div>
                                    </div>

                                    <p className="text-sm font-semibold text-slate-700">
                                        Your real interest rate is <span className="text-red-600">+{(effectiveAPR * 100 - data.interest_rate_quoted).toFixed(2)}%</span> higher than quoted.
                                    </p>

                                    {extraCost !== null && extraCost > 0 && (
                                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg w-full max-w-xs">
                                            <p className="text-xs text-red-600 uppercase tracking-widest font-bold mb-1">Upfront Loss</p>
                                            <p className="text-2xl font-bold text-red-700">{formatINR(extraCost)}</p>
                                            <p className="text-xs text-red-500/80 mt-1">lost to fees/insurance immediately</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-slate-400">Could not calculate APR.</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {data && <ChatAdvisor context={data} />}
            </motion.div>
        </div>
    );
};

export default LoanAudit;
