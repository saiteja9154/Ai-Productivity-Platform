import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getDashboardSummary } from '../services/api';
import { 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  FileText, 
  CheckSquare, 
  GitFork, 
  ArrowRight,
  KeyRound,
  Layers,
  Database,
  RefreshCw,
  Clock,
  AlertCircle,
  Bot
} from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    db: { connected: false, message: 'Checking...' },
    documents: [],
    documentsError: null,
    tasks: [],
    tasksError: null,
    workflows: [],
    workflowsError: null
  });
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' or 'mine'

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const summary = await getDashboardSummary();
      setData(summary);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentUserId = user?._id || user?.userId;
  const filteredTasks = taskFilter === 'mine' && currentUserId
    ? data.tasks.filter((t) => t.assignedTo?._id === currentUserId || t.assignedTo?.email === user?.email)
    : data.tasks;

  const pendingCount = data.tasks.filter((t) => t.status === 'pending' || t.status === 'todo').length;
  const inProgressCount = data.tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = data.tasks.filter((t) => t.status === 'completed').length;

  const modules = [
    {
      title: 'Documents Module',
      description: 'Collaborative AI-assisted document editor and version management',
      icon: FileText,
      path: '/documents',
      count: data.documents.length,
      countLabel: 'Documents in DB',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      badge: 'API Connected'
    },
    {
      title: 'Tasks Module',
      description: 'Intelligent sprint planning, task assignment, and state machine tracking',
      icon: CheckSquare,
      path: '/tasks',
      count: data.tasks.length,
      countLabel: 'Tasks in DB',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'API Connected'
    },
    {
      title: 'Workflows Module',
      description: 'Automated multi-step pipelines with deterministic triggers and execution history',
      icon: GitFork,
      path: '/workflows',
      count: data.workflows.length,
      countLabel: 'Workflows in DB',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      badge: 'Automation Active'
    },
    {
      title: 'AI Studio & Assistant',
      description: 'Local deterministic AI: rule-based chat, document summarizer, meeting notes to tasks, email drafts',
      icon: Bot,
      path: '/ai',
      count: 'Local',
      countLabel: 'Zero External Keys',
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
      badge: 'Zero API Keys'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/10 blur-[130px] rounded-full" />
      </div>

      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-slate-800 shadow-2xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Authenticated Session
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Database className="h-3 w-3 text-indigo-400" />
              MongoDB: {data.db.connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name || 'User'}</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Live database records loaded from MongoDB (<code className="text-indigo-300 font-mono text-xs">ai_productivity_platform</code>) via Express REST APIs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh Data
          </Button>
          <Link to="/profile">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs">
              <UserIcon className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
              Profile
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-slate-800 bg-slate-900/60 hover:bg-rose-950/40 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Database Health & Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* DB Connection */}
        <Card className="bg-slate-900/60 border-slate-800/80 p-4 flex items-center space-x-3.5">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${data.db.connected ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            <Database className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Database Status</div>
            <div className="text-sm font-bold text-white truncate flex items-center gap-1.5 mt-0.5">
              <span className={`h-2 w-2 rounded-full ${data.db.connected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {data.db.connected ? 'Connected' : 'Offline'}
            </div>
          </div>
        </Card>

        {/* Documents count */}
        <Card className="bg-slate-900/60 border-slate-800/80 p-4 flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Documents</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {loading ? <span className="inline-block w-8 h-5 bg-slate-800 animate-pulse rounded" /> : data.documents.length}
            </div>
          </div>
        </Card>

        {/* Tasks count & status */}
        <Card className="bg-slate-900/60 border-slate-800/80 p-4 flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Tasks</div>
            <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
              {loading ? <span className="inline-block w-8 h-5 bg-slate-800 animate-pulse rounded" /> : data.tasks.length}
              {!loading && (
                <span className="text-[11px] font-normal text-slate-400">
                  ({inProgressCount} in-progress, {pendingCount} pending, {completedCount} done)
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Workflows count */}
        <Card className="bg-slate-900/60 border-slate-800/80 p-4 flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <GitFork className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Workflows</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {loading ? <span className="inline-block w-8 h-5 bg-slate-800 animate-pulse rounded" /> : data.workflows.length}
            </div>
          </div>
        </Card>
      </div>

      {/* User Context & Security Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Name & Identity */}
        <Card className="bg-slate-900/70 border-slate-800 shadow-xl hover:border-slate-700 transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <UserIcon className="h-5 w-5" />
              </div>
              <Badge variant="success">Active</Badge>
            </div>
            <CardTitle className="text-base font-bold mt-3">User Identity</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Authenticated Profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Name:</span>
              <span className="font-semibold text-slate-200">{user?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Email:</span>
              <span className="font-mono text-indigo-300">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Assigned Team:</span>
              <span className="text-slate-200 font-medium">
                {user?.team?.name || (typeof user?.team === 'string' ? user?.team : 'Engineering Core')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Role & Privileges */}
        <Card className="bg-slate-900/70 border-slate-800 shadow-xl hover:border-slate-700 transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <Badge variant={user?.role === 'admin' ? 'success' : 'secondary'} className="capitalize">
                {user?.role || 'user'}
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-3">Role & Access Level</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Role-Based Authorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Assigned Role:</span>
              <span className="font-semibold uppercase tracking-wider text-purple-300">{user?.role || 'user'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">API Access:</span>
              <span className="text-emerald-400 font-medium">Protected Resources ✓</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Permissions:</span>
              <span className="text-slate-300">{user?.role === 'admin' ? 'Full Administrator' : 'Standard Member'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Session & Security */}
        <Card className="bg-slate-900/70 border-slate-800 shadow-xl hover:border-slate-700 transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                JWT Active
              </Badge>
            </div>
            <CardTitle className="text-base font-bold mt-3">Security & Token</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Cryptographic Session Guard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Token Type:</span>
              <span className="font-mono text-slate-200">Bearer JWT (HS256)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/80">
              <span className="text-slate-400">Password Hashing:</span>
              <span className="text-emerald-400 font-medium">Bcrypt (Salt 10) ✓</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Isolation:</span>
              <span className="text-indigo-300 font-medium">User Context Enforced</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Database Content: Live Documents & Live Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Recent Documents Live Card */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">Live Documents</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Fetched from MongoDB `documents` collection</CardDescription>
                </div>
              </div>
              <Link to="/documents">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-indigo-300 h-8 px-2">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/40 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-700/60 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/40 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : data.documentsError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                <AlertCircle className="h-6 w-6 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-300">{data.documentsError}</p>
                <Button size="sm" variant="outline" onClick={() => loadDashboardData(true)} className="text-xs border-rose-800">
                  Retry
                </Button>
              </div>
            ) : data.documents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No documents found in database.
              </div>
            ) : (
              <div className="space-y-3">
                {data.documents.slice(0, 3).map((doc) => (
                  <div key={doc._id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{doc.title}</h4>
                      {doc.team?.name && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                          {doc.team.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {doc.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                      <span>Uploader: <span className="text-slate-300">{doc.uploadedBy?.name || 'Dev Admin'}</span></span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-800/60 pt-3 text-xs text-slate-400 flex justify-between">
            <span>Showing {Math.min(3, data.documents.length)} of {data.documents.length} records</span>
            <Link to="/documents" className="text-indigo-400 hover:underline">Manage Documents</Link>
          </CardFooter>
        </Card>

        {/* Live Tasks Card */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">Live Tasks</CardTitle>
                  <CardDescription className="text-xs text-slate-400">Fetched from MongoDB `tasks` collection</CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant={taskFilter === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTaskFilter('all')}
                  className="h-7 px-2 text-[11px]"
                >
                  All ({data.tasks.length})
                </Button>
                <Button
                  variant={taskFilter === 'mine' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setTaskFilter('mine')}
                  className="h-7 px-2 text-[11px]"
                >
                  My Tasks
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex-1">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-800/40 animate-pulse space-y-2">
                    <div className="h-4 bg-slate-700/60 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/40 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : data.tasksError ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                <AlertCircle className="h-6 w-6 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-300">{data.tasksError}</p>
                <Button size="sm" variant="outline" onClick={() => loadDashboardData(true)} className="text-xs border-rose-800">
                  Retry
                </Button>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {taskFilter === 'mine' ? 'No tasks currently assigned to you.' : 'No tasks found in database.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.slice(0, 3).map((task) => (
                  <div key={task._id} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{task.title}</h4>
                      <div className="flex items-center space-x-1 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          task.priority === 'high' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                          task.priority === 'medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                          'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          {task.priority}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          task.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          task.status === 'in-progress' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                          'bg-slate-700/40 text-slate-300 border border-slate-600/30'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                      <span>Assignee: <span className="text-slate-300">{task.assignedTo?.name || 'Unassigned'}</span></span>
                      {task.dueDate && (
                        <span className="flex items-center text-[10px] text-slate-400">
                          <Clock className="h-3 w-3 mr-1 text-slate-500" />
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-800/60 pt-3 text-xs text-slate-400 flex justify-between">
            <span>Showing {Math.min(3, filteredTasks.length)} of {filteredTasks.length} tasks</span>
            <Link to="/tasks" className="text-teal-400 hover:underline">Manage All Tasks</Link>
          </CardFooter>
        </Card>
      </div>

      {/* Feature Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span>Platform Application Modules</span>
          </h2>
          <span className="text-xs text-slate-400">Connected to MongoDB Layered APIs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.path} className="bg-slate-900/80 border-slate-800 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center border shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="border-slate-700 text-slate-300 bg-slate-800/60 text-[11px]">
                      {m.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-white mt-4 group-hover:text-indigo-300 transition-colors">
                    {m.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs leading-relaxed">
                    {m.description}
                  </CardDescription>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{m.countLabel}:</span>
                    <span className="font-bold text-indigo-300">{loading ? '...' : m.count}</span>
                  </div>
                </CardHeader>
                <CardFooter className="border-t border-slate-800/80 pt-4">
                  <Link to={m.path} className="w-full">
                    <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950/60 hover:bg-indigo-600 hover:border-indigo-600 text-slate-300 hover:text-white transition-all text-xs justify-between">
                      <span>Open {m.title.replace(' Module', '')}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
