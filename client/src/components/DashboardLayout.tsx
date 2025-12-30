import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    PiggyBank,
    HandCoins,
    Banknote,
    Menu,
    X,
    Search,
    Bell,
    ChevronRight,
    LogOut,
    ScanLine,
    Crown
} from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut } = useAuth();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const menuItems = [
        { path: '/overview', label: 'Overview', icon: LayoutDashboard },
        { path: '/investment', label: 'Investment Analyzer', icon: PiggyBank },
        { path: '/loan', label: 'Loan Audit', icon: HandCoins },
        { path: '/salary', label: 'Salary Audit', icon: Banknote },
    ];

    return (
        <div className="flex min-h-screen bg-[#0B0F19] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Background Mesh Gradient (Subtle) */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-mesh opacity-20"></div>

            {/* Sidebar - Fixed/Solid style as per design */}
            <motion.aside
                initial={{ width: 260 }}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="hidden md:flex flex-col z-20 bg-[#0B0F19] border-r border-[#1e293b] relative h-screen"
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-[#1e293b]/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <ScanLine className="text-white" size={20} />
                        </div>
                        {isSidebarOpen && (
                            <div className="animate-fade-in">
                                <h1 className="font-display font-bold text-lg text-white leading-tight">
                                    Doc <span className="text-indigo-500">Sentry</span>
                                </h1>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path === '/overview' && location.pathname === '/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                        : 'text-slate-400 hover:text-white hover:bg-[#161e31]'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />

                                {isSidebarOpen && (
                                    <span className="font-medium text-sm whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[#1e293b]/50">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:text-red-400 hover:bg-red-400/10 w-full group`}
                    >
                        <LogOut size={20} className="group-hover:text-red-400" />
                        {isSidebarOpen && <span className="font-medium text-sm">Sign Out</span>}
                    </button>

                    {/* Premium Plan Box */}
                    {isSidebarOpen ? (
                        <div className="mt-4 p-4 bg-gradient-to-br from-[#161e31] to-[#0f1522] rounded-2xl border border-[#1e293b] relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Crown size={60} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-bold text-white text-sm mb-1">Premium Plan</h4>
                                <p className="text-xs text-slate-400 mb-3">Unlimited audits & advanced exports</p>
                                <button className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-lg transition-colors">
                                    Upgrade Now
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 p-2 flex justify-center">
                            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl text-slate-900">
                                <Crown size={20} />
                            </div>
                        </div>
                    )}
                </div>

            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 border-b border-[#1e293b]/50 bg-[#0B0F19]/90 backdrop-blur-md">
                    {/* Breadcrumbs / Title */}
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>Dashboard</span>
                            <ChevronRight size={14} />
                            <span className="text-white font-medium">{menuItems.find(i => i.path === location.pathname)?.label || 'Overview'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className="px-3 py-1.5 text-xs font-semibold text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800">
                            Docs
                        </button>
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-800">
                            DS
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 bg-[#0B0F19]">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-7xl mx-auto"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
