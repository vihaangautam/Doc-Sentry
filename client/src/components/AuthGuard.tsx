import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AuthGuard: React.FC = () => {
    const { session, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    if (!session) {
        // Redirect to login page, but save the intended location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Render child routes (Layout -> Dashboard/Salary/etc)
    return <Outlet />;
};

export default AuthGuard;
