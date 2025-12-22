import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, PiggyBank, HandCoins, Banknote, MessageSquareText } from 'lucide-react';
import LandingPage from './components/LandingPage';
import InvestmentAnalyzer from './components/InvestmentAnalyzer';
import LoanAudit from './components/LoanAudit';
import SalaryAudit from './components/SalaryAudit';

const AppContent: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const location = useLocation();

  const activeTabClass = "bg-white text-blue-600 shadow-md border-b-2 border-blue-600";
  const inactiveTabClass = "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" onClick={() => setShowDashboard(false)} className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <ScanLine className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 leading-none">Fine Print <span className="text-blue-600">X-Ray</span></span>
              <span className="text-[0.65rem] text-slate-400 font-medium tracking-wider uppercase">Powered by DocSentry</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Sample Reports</a>
          </nav>

          <button
            onClick={() => setShowDashboard(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            Start Audit
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {!showDashboard ? (
            <motion.div
              key="landing"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage onStartAudit={() => setShowDashboard(true)} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto px-6 py-12"
            >
              {/* Tabs Navigation */}
              <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex mb-12 overflow-hidden">
                <button
                  onClick={() => { }}
                  className={`flex-1 flex flex-col items-center justify-center py-6 gap-3 rounded-lg transition-all duration-300 ${location.pathname === '/investment' || location.pathname === '/' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 relative' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Link to="/investment" className="absolute inset-0"></Link>
                  <PiggyBank size={28} className={location.pathname === '/investment' || location.pathname === '/' ? "text-blue-600" : "text-slate-400"} />
                  <span className="font-bold text-sm">Investment Audit</span>
                  {(location.pathname === '/' || location.pathname === '/investment') && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>

                <div className="w-px bg-slate-100 my-4"></div>

                <button
                  className={`flex-1 flex flex-col items-center justify-center py-6 gap-3 rounded-lg transition-all duration-300 ${location.pathname === '/loan' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 relative' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Link to="/loan" className="absolute inset-0"></Link>
                  <HandCoins size={28} className={location.pathname === '/loan' ? "text-blue-600" : "text-slate-400"} />
                  <span className="font-bold text-sm">Loan Decoder</span>
                  {location.pathname === '/loan' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>

                <div className="w-px bg-slate-100 my-4"></div>

                <button
                  className={`flex-1 flex flex-col items-center justify-center py-6 gap-3 rounded-lg transition-all duration-300 ${location.pathname === '/salary' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 relative' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Link to="/salary" className="absolute inset-0"></Link>
                  <Banknote size={28} className={location.pathname === '/salary' ? "text-blue-600" : "text-slate-400"} />
                  <span className="font-bold text-sm">Salary Reality</span>
                  {location.pathname === '/salary' && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              </div>

              {/* Module Content */}
              <div className="relative">
                <Routes>
                  <Route path="/" element={<InvestmentAnalyzer />} />
                  <Route path="/investment" element={<InvestmentAnalyzer />} />
                  <Route path="/loan" element={<LoanAudit />} />
                  <Route path="/salary" element={<SalaryAudit />} />
                </Routes>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ScanLine className="text-blue-500" size={24} />
              <span className="text-lg font-bold text-white">Fine Print <span className="text-blue-500">X-Ray</span></span>
            </div>
            <p className="text-sm max-w-xs">
              An AI-powered consumer watchdog tool designed to decode complex financial documents and reveal the mathematical truth.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Supported Docs</h4>
            <ul className="space-y-2 text-sm">
              <li>Life Insurance Policies</li>
              <li>Home Loan Agreements</li>
              <li>Job Offer Letters (CTC)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Disclaimer</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2025 DocSentry / Fine Print X-Ray. All rights reserved. <br />
          Disclaimer: This tool provides estimates based on extracted data. It does not constitute professional financial or legal advice.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
