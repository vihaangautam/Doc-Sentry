import React from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, FileText, Upload } from 'lucide-react';

interface LandingPageProps {
    onStartAudit: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartAudit }) => {
    return (
        <div className="flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
                {/* Left Content */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide border border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        CONSUMER WATCHDOG AI
                    </div>

                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                        Don't let the <span className="text-blue-600">fine print</span><br />
                        cost you a fortune.
                    </h1>

                    <p className="text-lg text-slate-500 max-w-lg leading-relaxed">
                        Insurance agents lie. Loan agreements hide fees. Salary offers mislead.
                        Our AI acts as a ruthless financial auditor, extracting the mathematical truth hidden behind the marketing fluff.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button
                            onClick={onStartAudit}
                            className="px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-lg flex items-center gap-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <Upload size={20} />
                            Audit My Document
                        </button>
                        <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold text-lg hover:bg-slate-50 transition-all">
                            Try a Demo
                        </button>
                    </div>
                </div>

                {/* Right Hero Image */}
                <div className="relative">
                    <motion.div
                        className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-slate-200 h-[400px] w-full flex items-center justify-center relative overflow-hidden group">
                            {/* Simulated Document Background */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>

                            {/* Magnifying Glass Overlay Effect */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 backdrop-blur-sm rounded-full border-4 border-white/50 shadow-2xl flex items-center justify-center">
                                <ScanSearch size={64} className="text-white drop-shadow-md opacity-90" />
                            </div>

                            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-xs font-mono text-red-600 border border-red-100">
                                Status: 3 Hidden Clauses Detected
                            </div>
                        </div>
                    </motion.div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-600 rounded-full opacity-10 blur-2xl"></div>
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500 rounded-full opacity-10 blur-2xl"></div>
                </div>
            </motion.div>

            {/* Footer / Trust Strip could go here */}
        </div>
    );
};

export default LandingPage;
