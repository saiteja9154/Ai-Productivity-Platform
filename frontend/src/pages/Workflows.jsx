import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getWorkflows } from '../services/api';
import { 
  GitFork, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle, 
  Building2, 
  User as UserIcon
} from 'lucide-react';

export function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkflowList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWorkflows();
      setWorkflows(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch workflows from database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflowList();
  }, [fetchWorkflowList]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-[500px] h-[300px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <GitFork className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Workflows & Pipelines</h1>
              <p className="text-xs text-slate-400">Live workflow pipelines loaded from MongoDB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-xs">
            {loading ? 'Fetching...' : `${workflows.length} Workflows in DB`}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWorkflowList}
            disabled={loading}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-rose-950/20 border-rose-800/40 p-6 mb-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-semibold text-rose-200">Unable to Fetch Workflows</h3>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchWorkflowList} className="border-rose-700 text-rose-200 text-xs">
            Retry Connection
          </Button>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-6 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-1/6" />
              </div>
              <div className="h-4 bg-slate-700/60 rounded w-2/3" />
              <div className="h-16 bg-slate-800/40 rounded w-full" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && workflows.length === 0 && (
        <Card className="bg-slate-900/60 border-slate-800 py-16 px-6 text-center shadow-xl">
          <CardContent className="space-y-3 max-w-sm mx-auto">
            <div className="h-12 w-12 rounded-xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400">
              <GitFork className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Workflows Found</h3>
            <p className="text-xs text-slate-400">
              The MongoDB workflows collection has no active pipelines.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Workflow List */}
      {!loading && !error && workflows.length > 0 && (
        <div className="space-y-6">
          {workflows.map((wf) => (
            <Card
              key={wf._id}
              className="bg-slate-900/80 border-slate-800 shadow-xl hover:border-slate-700 transition-all group overflow-hidden"
            >
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {wf.name}
                      </CardTitle>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        wf.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        'bg-slate-700/40 text-slate-300 border border-slate-600/30'
                      }`}>
                        {wf.status}
                      </span>
                    </div>
                    <CardDescription className="text-slate-400 text-xs">
                      {wf.description}
                    </CardDescription>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    {wf.team?.name && (
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 text-[10px]">
                        <Building2 className="h-3 w-3 mr-1" />
                        {wf.team.name}
                      </Badge>
                    )}
                    <span className="flex items-center text-[11px]">
                      <UserIcon className="h-3 w-3 mr-1 text-slate-500" />
                      {wf.createdBy?.name || 'Dev Admin'}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Pipeline Execution Steps
                </div>
                {wf.steps && wf.steps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {wf.steps.map((step) => (
                      <div
                        key={step._id || step.stepOrder}
                        className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            Step {step.stepOrder}
                          </span>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                            step.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' :
                            step.status === 'in-progress' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {step.status}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-200">
                          {step.stepName}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500">
                    Sequential steps configured via WorkflowStep collection.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workflows;
