import React, { useState, useEffect } from 'react';
import { Mail, Copy, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailGeneratorProps {
    category: string;
    companyName: string;
    tipContext: string;
}

const getTemplate = (category: string, company: string, context: string) => {
    const subjectPrefix = `Discussion regarding ${company} Offer`;
    const companyStr = company || "the company";

    switch (category.toLowerCase()) {
        case 'joining bonus':
        case 'joining bonus / sign-on':
            return {
                subject: `${subjectPrefix} - Signing Bonus`,
                body: `Dear Hiring Team,\n\nI am very excited about the opportunity to join ${companyStr}.\n\nRegarding the offer, I noticed there is no signing bonus involved. Given my immediate availability and the fact that I am foregoing a bonus at my current role, would it be possible to include a one-time signing bonus?\n\nLooking forward to your thoughts.\n\nBest regards,`
            };
        case 'relocation package':
            return {
                subject: `${subjectPrefix} - Relocation Assistance`,
                body: `Dear Hiring Team,\n\nI am excited to move forward with ${companyStr}.\n\nSince this role requires relocation, I would like to discuss if there is any support available for moving expenses. A relocation package would greatly assist with a smooth transition.\n\nBest regards,`
            };
        case 'base vs variable':
            return {
                subject: `${subjectPrefix} - Salary Structure`,
                body: `Dear Hiring Team,\n\nThank you for the detailed offer.\n\nI noticed a significant portion of the CTC is variable. Would it be possible to restructure a part of the variable pay into the fixed base salary to ensure more stability?\n\nBest regards,`
            };
        case 'equity / esops':
            return {
                subject: `${subjectPrefix} - Equity Component`,
                body: `Dear Hiring Team,\n\nI am excited about the long-term vision of ${companyStr}.\n\nI would love to be more invested in the company's success. Is there any flexibility to increase the ESOP/Equity component of the offer?\n\nBest regards,`
            };
        case 'notice period buyout':
            return {
                subject: `${subjectPrefix} - Notice Period Buyout`,
                body: `Dear Hiring Team,\n\nMy current notice period is quite long. However, my current employer is open to an early release if the notice period is bought out.\n\nWould ${companyStr} be open to covering the buyout amount to drastically reduce my joining time?\n\nBest regards,`
            };
        default:
            return {
                subject: `${subjectPrefix} - Salary Query`,
                body: `Dear Hiring Team,\n\nThank you for the offer to join ${companyStr}.\n\nI have a specific query regarding: "${context}".\n\nIs there flexibility to discuss this component of the compensation structure to better align with market standards?\n\nBest regards,`
            };
    }
}

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({ category, companyName, tipContext }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [template, setTemplate] = useState({ subject: '', body: '' });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTemplate(getTemplate(category, companyName, tipContext));
        }
    }, [isOpen, category, companyName, tipContext]);

    const handleCopy = () => {
        const fullText = `Subject: ${template.subject}\n\n${template.body}`;
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all w-fit group"
            >
                <Mail size={14} />
                Draft Negotiation Email
                <Sparkles size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                                    <Mail size={18} className="text-emerald-400" />
                                    Draft Email: {category}
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Subject Line</label>
                                    <input
                                        value={template.subject}
                                        onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Email Body</label>
                                    <textarea
                                        value={template.body}
                                        onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                                        rows={8}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500/50 text-sm leading-relaxed resize-none font-sans"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center">
                                <span className="text-xs text-slate-500">Edit before sending</span>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${copied
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                            : 'bg-white text-slate-900 hover:bg-slate-200'
                                        }`}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? 'Copied to Clipboard!' : 'Copy Text'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
