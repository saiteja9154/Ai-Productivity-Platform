import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  FileText, 
  CheckSquare, 
  GitFork, 
  ArrowRight,
  KeyRound,
  Layers
} from 'lucide-react';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const modules = [
    {
      title: 'Documents Module',
      description: 'Collaborative AI-assisted document editor and version management',
      icon: FileText,
      path: '/documents',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
      badge: 'Phase 5 Ready'
    },
    {
      title: 'Tasks Module',
      description: 'Intelligent sprint planning, task assignment, and state machine tracking',
      icon: CheckSquare,
      path: '/tasks',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'Phase 5 Ready'
    },
    {
      title: 'Workflows Module',
      description: 'Automated multi-step workflows with AI agent executions and conditions',
      icon: GitFork,
      path: '/workflows',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
      badge: 'Phase 5 Ready'
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
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Authentication Status: Logged In
            </span>
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 bg-indigo-500/10 text-xs">
              Phase 4 Operational
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name || 'User'}</span>
          </h1>
          <p className="text-slate-400 text-sm">
            You are securely authenticated to the AI Productivity Platform.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/profile">
            <Button variant="outline" size="sm" className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200">
              <UserIcon className="h-4 w-4 mr-2 text-indigo-400" />
              View Profile
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-slate-800 bg-slate-900/60 hover:bg-rose-950/40 hover:border-rose-800 text-slate-300 hover:text-rose-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
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
              <span className="text-slate-400">User ID:</span>
              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[150px]">{user?.userId || user?._id}</span>
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
              <span className="text-slate-400">Route Guard:</span>
              <span className="text-indigo-300">Protected Routes Enabled</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <span>Platform Application Modules</span>
          </h2>
          <span className="text-xs text-slate-400">Protected under Phase 4 authentication</span>
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
                </CardHeader>
                <CardFooter className="border-t border-slate-800/80 pt-4">
                  <Link to={m.path} className="w-full">
                    <Button variant="outline" size="sm" className="w-full border-slate-800 bg-slate-950/60 hover:bg-indigo-600 hover:border-indigo-600 text-slate-300 hover:text-white transition-all text-xs justify-between">
                      <span>Open Module</span>
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
