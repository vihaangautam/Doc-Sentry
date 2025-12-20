import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { formatINR } from '../utils/financialMath';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ChatAdvisor from './ChatAdvisor';
import { Banknote, FileText, AlertTriangle, Wallet } from 'lucide-react';

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
            { name: 'In-Hand Salary', value: inHandMonthly * 12, color: '#10b981' }, // Annualized
            { name: 'PF & Gratuity (Future)', value: (data.pf_employer_annual || 0) + (data.gratuity_annual || 0) + ((data.pf_employee_monthly || 0) * 12), color: '#3b82f6' },
            { name: 'Taxes & Deductions', value: ((data.professional_tax_monthly || 0) * 12) + ((data.insurance_benefit_annual || 0)), color: '#ef4444' },
            { name: 'Variable/Bonus', value: data.variable_performance_bonus_annual || 0, color: '#a855f7' },
        ].filter(item => item.value > 0);
    };

    return (
        <div className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="card p-12 text-center bg-white border border-slate-200 shadow-xl mb-8">
                    <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Banknote size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Salary Reality</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload your Job Offer Letter or Salary Slip (PDF/Image) to find your real In-Hand salary.</p>

                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                        <label className="block w-full cursor-pointer group">
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className={`border-2 border-dashed rounded-xl p-8 transition-colors ${file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'}`}>
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
                            className="w-full btn-primary bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? "Decrypting CTC..." : "Reveal True Salary"}
                        </button>
                    </div>
                    {error && <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
                </div>

                {data && inHandMonthly !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        {/* Breakdown Card */}
                        <div className="card p-8 bg-white">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <FileText className="text-slate-400" size={20} />
                                <h3 className="text-lg font-bold text-slate-800">CTC Breakdown ({data.company_name})</h3>
                            </div>

                            <div className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                                {formatINR(data.ctc_annual)}
                                <span className="text-sm text-slate-400 font-normal ml-2">/ Year CTC</span>
                            </div>

                            <div className="my-8 p-6 bg-emerald-50 border border-emerald-100 rounded-xl relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 text-emerald-100 opacity-50">
                                    <Wallet size={100} />
                                </div>
                                <p className="text-xs text-emerald-600 uppercase tracking-widest font-bold mb-1 relative z-10">Real Monthly In-Hand</p>
                                <p className="text-4xl font-extrabold text-emerald-700 relative z-10">{formatINR(inHandMonthly)}</p>
                            </div>

                            <ul className="space-y-3 text-sm text-slate-600">
                                <li className="flex justify-between p-2 rounded hover:bg-slate-50"><span>Basic + Allowances (Monthly)</span> <span className="font-semibold text-slate-900">{formatINR(data.total_gross_monthly || (data.basic_salary_monthly + data.hra_monthly + data.special_allowance_monthly))}</span></li>
                                <li className="flex justify-between p-2 rounded hover:bg-red-50 text-red-600"><span>PF Deduction (Employee)</span> <span className="font-semibold">-{formatINR(data.pf_employee_monthly || 0)}</span></li>
                                <li className="flex justify-between p-2 rounded hover:bg-purple-50 text-purple-600"><span>Variable/Bonus (Annual)</span> <span className="font-semibold">{formatINR(data.variable_performance_bonus_annual || 0)}</span></li>
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

                        {/* Chart Card */}
                        <div className="card p-8 bg-white flex flex-col items-center">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Where is your money going?</h3>
                            <div className="w-full h-[300px] text-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getChartData()}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {getChartData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: any) => formatINR(value)}
                                            contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}

                {data && <ChatAdvisor context={data} />}
            </motion.div>
        </div>
    );
};

export default SalaryAudit;
