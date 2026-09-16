import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export function Profile() {
  const { user, updateUser, refreshProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setLoading(true);

    try {
      const updatedData = await authService.updateProfile({
        name: name.trim()
      });

      updateUser(updatedData);
      setSuccessMessage('Profile updated successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await refreshProfile();
      setSuccessMessage('Profile reloaded from server.');
    } catch (err) {
      setErrorMessage('Failed to reload profile.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[500px] h-[300px] bg-indigo-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <UserIcon className="h-8 w-8 text-indigo-400" />
            <span>User Profile & Account</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your account credentials and platform identity settings
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          {isRefreshing ? 'Syncing...' : 'Sync Profile'}
        </Button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center space-x-3 shadow-lg shadow-emerald-950/20">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-3 shadow-lg shadow-rose-950/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Details Overview */}
        <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-md h-fit">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white">{user?.name || 'User'}</CardTitle>
                <Badge variant={user?.role === 'admin' ? 'success' : 'secondary'} className="text-[10px] mt-1">
                  {user?.role || 'user'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span>Email Address</span>
              </span>
              <p className="font-mono text-slate-200 break-all">{user?.email}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                <span>Account Role</span>
              </span>
              <p className="capitalize font-semibold text-indigo-300">{user?.role || 'user'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>Account Created</span>
              </span>
              <p className="text-slate-300">{formatDate(user?.createdAt)}</p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-slate-500" />
                <span>User ID</span>
              </span>
              <p className="font-mono text-[11px] text-slate-400 truncate">{user?.userId || user?._id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Edit Profile Information</CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Update your display name across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950/40 border border-slate-800/60 rounded-lg text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Primary account email address cannot be changed arbitrarily.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.role || 'user'}
                    className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800/60 rounded-lg text-sm text-slate-400 capitalize cursor-not-allowed"
                  />
                  <p className="text-[11px] text-slate-500">
                    Role is managed through administrator access control.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-md shadow-indigo-600/25"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
