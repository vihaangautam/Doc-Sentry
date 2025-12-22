import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';
import InvestmentAnalyzer from './components/InvestmentAnalyzer';
import LoanAudit from './components/LoanAudit';
import SalaryAudit from './components/SalaryAudit';
import DashboardLayout from './components/DashboardLayout';

import Overview from './components/Overview';

const AppContent: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {!showDashboard ? (
          <motion.div
            key="landing"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-screen w-full bg-[#0f172a]"
          >
            <LandingPage onStartAudit={() => setShowDashboard(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="h-screen w-full"
          >
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/investment" element={<InvestmentAnalyzer />} />
                <Route path="/loan" element={<LoanAudit />} />
                <Route path="/salary" element={<SalaryAudit />} />
              </Routes>
            </DashboardLayout>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
