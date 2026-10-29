import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { checkApiHealth, checkDbHealth } from '../services/api';
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
  UserPlus,
  FileText,
  CheckSquare,
  Upload,
  Kanban,
  HardDrive,
  FolderGit2
} from 'lucide-react';

export function HomePage() {
  const currentPort = typeof window !== 'undefined' && window.location.port ? window.location.port : '5173';
  const [frontendStatus] = useState({ ok: true, message: `React 19 + Vite running on :${currentPort}` });
  const [backendStatus, setBackendStatus] = useState({ loading: true, ok: false, message: 'Checking...' });
  const [dbStatus, setDbStatus] = useState({ loading: true, ok: false, message: 'Checking...', database: null, error: null });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runHealthChecks = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [apiRes, dbRes] = await Promise.all([checkApiHealth(), checkDbHealth()]);
        if (!mounted) return;
        setBackendStatus({
          loading: false,
          ok: apiRes.success,
          message: apiRes.message || (apiRes.success ? 'API is healthy' : 'API disconnected')
        });
        setDbStatus({
          loading: false,
          ok: Boolean(dbRes.success && dbRes.connected),
          message: dbRes.message || (dbRes.connected ? 'MongoDB connected' : 'Database Disconnected'),
          database: dbRes.database,
          error: dbRes.error
        });
      } catch (err) {
        if (!mounted) return;
        setBackendStatus({ loading: false, ok: false, message: 'Connection error' });
        setDbStatus({ loading: false, ok: false, message: 'Connection error', error: err.message });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-10 flex-1 w-full relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-10 space-y-4">
          <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 px-3 py-1 text-xs font-semibold">
            Phase 6 — Workflow Automation & Local AI Studio Active
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI Productivity Platform
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Enterprise foundation powered by Node.js, Express, MongoDB Mongoose ODM, full Document & Task workspaces, deterministic Workflow Automation pipelines, and zero-external-key Local AI Studio.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 px-5 py-2.5 text-xs">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link to="/workflows">
                  <Button variant="outline" className="border-purple-600/40 bg-purple-950/20 hover:bg-purple-900/40 text-purple-300 px-4 py-2.5 text-xs">
                    <FolderGit2 className="h-4 w-4 mr-1.5 text-purple-400" />
                    <span>Workflow Pipelines</span>
                  </Button>
                </Link>
                <Link to="/ai">
                  <Button variant="outline" className="border-indigo-600/40 bg-indigo-950/20 hover:bg-indigo-900/40 text-indigo-300 px-4 py-2.5 text-xs">
                    <FileText className="h-4 w-4 mr-1.5 text-indigo-400" />
                    <span>AI Studio</span>
                  </Button>
                </Link>
                <Link to="/tasks">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 px-4 py-2.5 text-xs">
                    <CheckSquare className="h-4 w-4 mr-1.5 text-teal-400" />
                    <span>Tasks & Kanban</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 px-5 py-2.5 text-xs">
                    <LogIn className="h-4 w-4 mr-2" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 px-5 py-2.5 text-xs">
                    <UserPlus className="h-4 w-4 mr-2 text-indigo-400" />
                    <span>Create Account</span>
                  </Button>
                </Link>
                <Link to="/documents">
                  <Button variant="outline" className="border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-300 px-4 py-2.5 text-xs">
                    <FileText className="h-4 w-4 mr-1.5 text-blue-400" />
                    <span>Explore Documents</span>
                  </Button>
                </Link>
                <Link to="/tasks">
                  <Button variant="outline" className="border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-300 px-4 py-2.5 text-xs">
                    <CheckSquare className="h-4 w-4 mr-1.5 text-teal-400" />
                    <span>Kanban Tasks</span>
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={runHealthChecks}
              disabled={isRefreshing}
              className="border-slate-800 bg-slate-900/40 hover:bg-slate-800 text-slate-300 py-2.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              {isRefreshing ? 'Checking...' : 'Re-check Health'}
            </Button>
          </div>
        </div>

        {/* Phase 5 Workspace Modules Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Module A: Documents */}
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-blue-950/20 border-slate-800 shadow-xl hover:border-blue-500/40 transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
                  <FileText className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10 text-[11px]">
                  Phase 5 — Module A
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Document Management Workspace
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs leading-relaxed mt-1">
                Collaborative rich-text markdown note authoring and multi-part file asset uploads with full-text search and secure downloads.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Rich Text & Notes</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <Upload className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span>File Uploads (10MB)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>Metadata & Size</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Team Data Isolation</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-slate-800/80">
              <Link to="/documents" className="w-full">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs shadow-md shadow-blue-600/20 justify-between">
                  <span>Open Documents Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Module B: Tasks & Kanban */}
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-teal-950/20 border-slate-800 shadow-xl hover:border-teal-500/40 transition-all flex flex-col justify-between group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <Badge variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-500/10 text-[11px]">
                  Phase 5 — Module B
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                Task Management & Kanban Board
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs leading-relaxed mt-1">
                Interactive 3-column sprint Kanban with drag-and-drop state transitions, urgency scoring, deadline alerts, and live metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <Kanban className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                  <span>3-Column Kanban</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Drag & Drop Shift</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Urgent/High Priority</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>Real-time Velocity</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-slate-800/80">
              <Link to="/tasks" className="w-full">
                <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs shadow-md shadow-teal-600/20 justify-between">
                  <span>Open Tasks & Kanban Board</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
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

        {/* Diagnostic Detailed Panel (Phase 5 Verified) */}
        <Card className="bg-slate-900/80 border-slate-800/80 shadow-2xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Phase 5 Endpoints & Core Workspace Status</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live status from Document Management, Task Kanban, Authentication, and MongoDB Engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">Documents Module (A):</div>
                <div className="text-blue-400 font-semibold">GET/POST /api/documents & /upload</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">Tasks & Kanban Module (B):</div>
                <div className="text-teal-400 font-semibold">GET/POST /api/tasks & /metrics & /:id/status</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">Auth & User Security:</div>
                <div className="text-emerald-400 font-semibold">JWT Bearer Guards + Bcrypt (Salt 10)</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
                <div className="text-slate-400 text-[11px]">MongoDB Collections:</div>
                <div className="text-purple-400 font-semibold">documents, tasks, users, teams, workflows</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <span>Phase 5 Objective: Enterprise Document Management & Interactive Task Kanban Board</span>
            <div className="mt-2 sm:mt-0 flex items-center space-x-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Status: Core Workspace Modules Operational</span>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>AI Productivity Platform © 2026 — Phase 5 Core Workspace Architecture</p>
      </footer>
    </div>
  );
}

export default HomePage;
