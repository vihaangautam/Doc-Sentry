import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import InvestmentAnalyzer from './components/InvestmentAnalyzer';
import LoanAudit from './components/LoanAudit';
import SalaryAudit from './components/SalaryAudit';
import DashboardLayout from './components/DashboardLayout';
import Overview from './components/Overview';
import Login from './components/Login';
import AuthGuard from './components/AuthGuard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route element={<AuthGuard />}>


          {/* 
              Wait, since DashboardLayout wraps children, we should use a Layout Route pattern 
              OR just wrap each element. 
              Let's use a Wrapper Component for cleaner code.
           */}
          <Route path="/overview" element={<DashboardLayout><Overview /></DashboardLayout>} />
          <Route path="/salary" element={<DashboardLayout><SalaryAudit /></DashboardLayout>} />
          <Route path="/loan" element={<DashboardLayout><LoanAudit /></DashboardLayout>} />
          <Route path="/investment" element={<DashboardLayout><InvestmentAnalyzer /></DashboardLayout>} />

          {/* Redirect /dashboard to /overview if accessed directly */}
          <Route path="/dashboard" element={<DashboardLayout><Overview /></DashboardLayout>} />
        </Route>

      </Routes>
    </Router>
  );
};

export default App;
