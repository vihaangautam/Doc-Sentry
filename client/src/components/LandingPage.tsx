import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ScanSearch, FileText, Upload, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const onStartAudit = () => navigate('/login');
    return (
        <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] mix-blend-screen"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10"
            >
                {/* Left Content */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <ShieldCheck size={14} />
                        Hello User •ᴗ•
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-[1.1] tracking-tight">
                        Don't let the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                            fine print
                        </span>
                        <br />
                        cost you.
                    </h1>

                    <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                        Insurance agents lie. Loan agreements hide fees. Salary offers mislead.
                        <span className="text-slate-200 font-medium"> DocSentry acts as your ruthless financial auditor</span>,
                        extracting the mathematical truth hidden behind the marketing fluff.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            onClick={onStartAudit}
                            className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg flex items-center gap-3 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Upload size={20} />
                                Audit My Document
                            </span>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>

                        <button className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600 rounded-xl font-bold text-lg flex items-center gap-3 transition-all backdrop-blur-md">
                            <Zap size={20} className="text-amber-400" />
                            Live Demo
                        </button>
                    </div>

                    <div className="flex items-center gap-6 pt-4 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>No SignUp Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span>100% Private</span>
                        </div>
                    </div>
                </div>

                {/* Right Hero Image / Visual */}
                <div className="relative">
                    <motion.div
                        className="relative z-10 glass-card p-2 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-xl"
                        whileHover={{ scale: 1.02, rotate: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] group">
                            {/* Abstract Grid/Data Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

                            {/* Floating UI Elements Simulation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                                <div className="relative z-20 bg-[#0B0F19] border border-slate-700/50 rounded-xl p-6 shadow-2xl w-3/4 max-w-sm">
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg">
                                            <ShieldCheck className="text-red-500" size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider">Detection Alert</div>
                                            <div className="text-white font-bold">Hidden Fee Found</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-slate-800 rounded-full"></div>
                                        <div className="h-2 w-2/3 bg-slate-800 rounded-full"></div>
                                        <p className="text-xs text-red-200 font-mono">
                                            &gt; Clause 14.B: "Annual maintenance fee of 2.5% applies."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Scan Line Effect */}
                            <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_#6366f1] top-0 animate-scan"></div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default LandingPage;
