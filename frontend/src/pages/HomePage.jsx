import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { checkApiHealth, checkDbHealth } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Database, 
  Layout, 
  ArrowRight,
  ShieldCheck,
  LayoutDashboard,
  LogIn,
  UserPlus
} from 'lucide-react';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [frontendStatus] = useState({ ok: true, message: 'React 19 + Vite running on :5173' });
  const [backendStatus, setBackendStatus] = useState({ loading: true, ok: false, message: 'Checking...' });
  const [dbStatus, setDbStatus] = useState({ loading: true, ok: false, message: 'Checking...', database: null, error: null });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runHealthChecks = async () => {
    setIsRefreshing(true);
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    setDbStatus((prev) => ({ ...prev, loading: true }));

    try {
      // 1. Check Backend API
      const apiRes = await checkApiHealth();
      if (apiRes.success) {
        setBackendStatus({ loading: false, ok: true, message: apiRes.message });
      } else {
        setBackendStatus({ loading: false, ok: false, message: apiRes.message });
      }

      // 2. Check MongoDB Database
      const dbRes = await checkDbHealth();
      if (dbRes.success && dbRes.connected) {
        setDbStatus({
          loading: false,
          ok: true,
          message: dbRes.message,
          database: dbRes.database,
          error: null
        });
      } else {
        setDbStatus({
          loading: false,
          ok: false,
          message: dbRes.message || 'Database Disconnected',
          database: dbRes.database,
          error: dbRes.error
        });
      }
    } catch (err) {
      setBackendStatus({ loading: false, ok: false, message: 'Connection error' });
      setDbStatus({ loading: false, ok: false, message: 'Connection error', error: err.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 flex-1 w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-4">
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 px-3 py-1 text-xs">
            Phase 4 — Authentication & User Security Active
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI Productivity Platform
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Enterprise foundation powered by Node.js, Express, MongoDB Mongoose ODM, and JWT-authenticated React application.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 px-6 py-2.5">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 px-5 py-2.5">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 px-5 py-2.5">
                    <UserPlus className="h-4 w-4 mr-2 text-indigo-400" />
                    <span>Create Account</span>
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={runHealthChecks}
              disabled={isRefreshing}
              className="border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-300 py-2.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Re-check Health'}
            </Button>
          </div>
        </div>

        {/* 3 Core Status Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 1. Frontend */}
          <Card className="bg-slate-900/70 border-slate-800 shadow-xl hover:border-slate-700 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Layout className="h-5 w-5" />
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <CardTitle className="text-base font-bold mt-3">Frontend Client</CardTitle>
              <CardDescription className="text-slate-400 text-xs">React 19 + Vite + Tailwind</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="flex items-center text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>Single Page App Running ✓</span>
              </div>
              <p className="text-[11px] text-slate-400">{frontendStatus.message}</p>
            </CardContent>
          </Card>

          {/* 2. Backend */}
          <Card className="bg-slate-900/70 border-slate-800 shadow-xl hover:border-slate-700 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                  <Server className="h-5 w-5" />
                </div>
                {backendStatus.loading ? (
                  <Badge variant="secondary">Checking...</Badge>
                ) : backendStatus.ok ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <Badge variant="error">Offline</Badge>
                )}
              </div>
              <CardTitle className="text-base font-bold mt-3">Backend REST API</CardTitle>
              <CardDescription className="text-slate-400 text-xs">Node.js + Express + JWT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="flex items-center text-xs font-semibold">
                {backendStatus.loading ? (
                  <div className="flex items-center text-slate-400">
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin text-indigo-400" />
                    <span>Checking API...</span>
                  </div>
                ) : backendStatus.ok ? (
                  <div className="flex items-center text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>REST API Connected ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center text-rose-400">
                    <XCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>REST API Disconnected ✗</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">{backendStatus.message}</p>
            </CardContent>
          </Card>

          {/* 3. Database */}
          <Card className="bg-slate-900/70 border-slate-800 shadow-xl hover:border-slate-700 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                  <Database className="h-5 w-5" />
                </div>
                {dbStatus.loading ? (
                  <Badge variant="secondary">Checking...</Badge>
                ) : dbStatus.ok ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <Badge variant="warning">Setup Required</Badge>
                )}
              </div>
              <CardTitle className="text-base font-bold mt-3">Database Layer</CardTitle>
              <CardDescription className="text-slate-400 text-xs">MongoDB + Mongoose ODM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <div className="flex items-center text-xs font-semibold">
                {dbStatus.loading ? (
                  <div className="flex items-center text-slate-400">
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin text-purple-400" />
                    <span>Checking Database...</span>
                  </div>
                ) : dbStatus.ok ? (
                  <div className="flex items-center text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>MongoDB Connected ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-400">
                    <XCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span>MongoDB Disconnected ✗</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {dbStatus.ok ? `Database: ${dbStatus.database || 'ai_productivity_platform'}` : dbStatus.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Detailed Panel */}
        <Card className="bg-slate-900/80 border-slate-800/80 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Phase 4 Endpoints & Security Status</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live status from <code className="text-indigo-400">POST /api/auth/*</code> and <code className="text-indigo-400">GET/PUT /api/users/profile</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">Auth Endpoints:</div>
                <div className="text-emerald-400 font-semibold">/api/auth/register & /api/auth/login</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">Protected Profile:</div>
                <div className="text-indigo-400 font-semibold">/api/users/profile (JWT Guarded)</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">Password Security:</div>
                <div className="text-purple-400 font-semibold">Bcrypt Hashing (10 Salt Rounds)</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">Role Authorization:</div>
                <div className="text-cyan-400 font-semibold">user & admin Role Middleware</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <span>Phase 4 Objective: Production-Ready Authentication Foundation</span>
            <div className="mt-2 sm:mt-0 flex items-center space-x-1 text-indigo-400 font-medium">
              <span>Next: Phase 5 — Core Product Modules</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>AI Productivity Platform © 2026 — Architecture: <code className="text-slate-400">PHASE_1_ARCHITECTURE.md</code></p>
      </footer>
    </div>
  );
}

export default HomePage;
