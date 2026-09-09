import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { checkApiHealth, checkDbHealth } from '../services/api';
import { CheckCircle2, XCircle, RefreshCw, Server, Database, Layout, Sparkles, ArrowRight } from 'lucide-react';

export function HomePage() {
  const [frontendStatus] = useState({ ok: true, message: 'React 18 + Vite running on :5173' });
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

      // 2. Check MySQL Database
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-950/70 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">AI Productivity Platform</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Phase 2 — UI Foundation
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={runHealthChecks}
              disabled={isRefreshing}
              className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              {isRefreshing ? 'Verifying...' : 'Re-check Status'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 space-y-3">
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 px-3 py-1">
            System Diagnostics & Connectivity Hub
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            AI Productivity Platform
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            Foundation architecture verification: Testing end-to-end communication from the React Single Page App to Express API and MySQL Database.
          </p>
        </div>

        {/* 3 Core Status Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* 1. Frontend */}
          <Card className="bg-slate-900/70 border-slate-800 shadow-xl hover:border-slate-700 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400">
                  <Layout className="h-5 w-5" />
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-4">Frontend</CardTitle>
              <CardDescription className="text-slate-400 text-xs">React 18 + Vite + Tailwind</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Frontend Running ✓</span>
              </div>
              <p className="text-xs text-slate-400">{frontendStatus.message}</p>
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
              <CardTitle className="text-lg font-bold mt-4">Backend</CardTitle>
              <CardDescription className="text-slate-400 text-xs">Node.js + Express REST API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm font-semibold">
                {backendStatus.loading ? (
                  <div className="flex items-center text-slate-400">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin text-indigo-400" />
                    <span>Checking API...</span>
                  </div>
                ) : backendStatus.ok ? (
                  <div className="flex items-center text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Backend Connected ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center text-rose-400">
                    <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Backend Disconnected ✗</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">{backendStatus.message}</p>
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
              <CardTitle className="text-lg font-bold mt-4">Database</CardTitle>
              <CardDescription className="text-slate-400 text-xs">MySQL 8.0 Connection Pool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm font-semibold">
                {dbStatus.loading ? (
                  <div className="flex items-center text-slate-400">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin text-purple-400" />
                    <span>Checking Database...</span>
                  </div>
                ) : dbStatus.ok ? (
                  <div className="flex items-center text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Database Connected ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-400">
                    <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Database Disconnected ✗</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {dbStatus.ok ? `Database: ${dbStatus.database || 'ai_productivity_platform'}` : dbStatus.message}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Detailed Panel */}
        <Card className="bg-slate-900/80 border-slate-800/80 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <span>Environment & Connection Details</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live status from <code className="text-indigo-400">GET /api/health</code> and <code className="text-indigo-400">GET /api/health/db</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-slate-400">Frontend URL:</div>
                <div className="text-emerald-400 font-semibold">http://localhost:5173</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-slate-400">Backend API URL:</div>
                <div className="text-indigo-400 font-semibold">http://localhost:5000</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-slate-400">Target Database:</div>
                <div className="text-purple-400 font-semibold">ai_productivity_platform</div>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="text-slate-400">CORS Whitelist:</div>
                <div className="text-cyan-400 font-semibold">http://localhost:5173 ✓</div>
              </div>
            </div>

            {dbStatus.error && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                <div className="font-semibold text-amber-400 flex items-center">
                  <span>MySQL Configuration Notice:</span>
                </div>
                <div className="text-slate-300">
                  {dbStatus.error}
                </div>
                <div className="text-slate-400 mt-2">
                  Update <code className="text-amber-300">backend/.env</code> with your local MySQL password (<code className="text-amber-300">DB_PASSWORD</code>), run <code className="text-amber-300">database/schema.sql</code>, then click <strong>Re-check Status</strong>.
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <span>Phase 2 Objective: Establish Clean Foundation & End-to-End Handshake</span>
            <div className="mt-2 sm:mt-0 flex items-center space-x-1 text-indigo-400 font-medium">
              <span>Next: Phase 3 — Database & Models</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <p>AI Productivity Platform © 2026 — Architecture single source of truth: <code className="text-slate-400">PHASE_1_ARCHITECTURE.md</code></p>
      </footer>
    </div>
  );
}

export default HomePage;
