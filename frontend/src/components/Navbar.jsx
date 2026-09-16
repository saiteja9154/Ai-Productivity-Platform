import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Sparkles, User as UserIcon, LogOut, LayoutDashboard, FileText, CheckSquare, GitFork, LogIn } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Workflows', path: '/workflows', icon: GitFork }
  ];

  return (
    <header className="border-b border-slate-800/80 backdrop-blur-md bg-slate-950/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                AI Productivity Platform
              </span>
            </div>
          </Link>

          {/* Authenticated Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Context & Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  location.pathname === '/profile'
                    ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
                <span className="hidden sm:inline-block font-semibold">{user?.name || 'User'}</span>
                <Badge variant={user?.role === 'admin' ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0">
                  {user?.role || 'user'}
                </Badge>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-slate-800 bg-slate-900/60 hover:bg-rose-950/40 hover:border-rose-800 text-slate-300 hover:text-rose-300 transition-colors"
                title="Log out of session"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5 text-slate-400 group-hover:text-rose-400" />
                <span className="text-xs">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
