import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  getTasks, 
  getTaskMetrics, 
  createTask, 
  updateTask, 
  updateTaskStatus, 
  deleteTask, 
  getUsers 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { 
  CheckSquare, 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  User as UserIcon, 
  FileText, 
  Clock, 
  Filter, 
  Plus, 
  Kanban, 
  List as ListIcon, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  CircleDashed, 
  X, 
  Check, 
  Calendar, 
  Flame, 
  GripVertical 
} from 'lucide-react';

export function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTasks: 0,
    todoTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state & filters
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all'); // 'all' | 'mine'
  const [searchTerm, setSearchTerm] = useState('');

  // Drag and Drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dropTargetCol, setDropTargetCol] = useState(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = new, object = edit
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDesc, setDialogDesc] = useState('');
  const [dialogStatus, setDialogStatus] = useState('todo');
  const [dialogPriority, setDialogPriority] = useState('medium');
  const [dialogAssignee, setDialogAssignee] = useState('');
  const [dialogDeadline, setDialogDeadline] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Delete confirmation
  const [deletingTask, setDeletingTask] = useState(null);

  // Current logged in user ID
  const currentUserId = user?._id || user?.userId;

  // Load tasks & metrics concurrently
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, metricsRes, usersRes] = await Promise.allSettled([
        getTasks(),
        getTaskMetrics(),
        getUsers()
      ]);

      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value.data || []);
      } else {
        throw new Error(tasksRes.reason?.message || 'Failed to fetch tasks');
      }

      if (metricsRes.status === 'fulfilled' && metricsRes.value.data) {
        setMetrics(metricsRes.value.data);
      }

      if (usersRes.status === 'fulfilled' && usersRes.value.data) {
        setUsersList(usersRes.value.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks from database');
      toast.error('Could not load tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Dialog for create or edit
  const handleOpenDialog = (task = null, defaultCol = 'todo') => {
    if (task) {
      setEditingTask(task);
      setDialogTitle(task.title || '');
      setDialogDesc(task.description || '');
      setDialogStatus(
        task.status === 'completed' ? 'completed' :
        task.status === 'in-progress' ? 'in-progress' : 'todo'
      );
      setDialogPriority(task.priority || 'medium');
      setDialogAssignee(task.assignedTo?._id || task.assignee?._id || task.assignedTo || task.assignee || '');
      const rawDate = task.dueDate || task.deadline;
      setDialogDeadline(rawDate ? new Date(rawDate).toISOString().split('T')[0] : '');
    } else {
      setEditingTask(null);
      setDialogTitle('');
      setDialogDesc('');
      setDialogStatus(defaultCol);
      setDialogPriority('medium');
      setDialogAssignee(currentUserId || '');
      setDialogDeadline('');
    }
    setIsDialogOpen(true);
  };

  // Submit Task Form (Create or Update)
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!dialogTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        title: dialogTitle.trim(),
        description: dialogDesc.trim(),
        status: dialogStatus,
        priority: dialogPriority,
        assignee: dialogAssignee || undefined,
        assignedTo: dialogAssignee || undefined,
        deadline: dialogDeadline ? new Date(dialogDeadline) : undefined,
        dueDate: dialogDeadline ? new Date(dialogDeadline) : undefined
      };

      if (editingTask) {
        await updateTask(editingTask._id, payload);
        toast.success('Task updated successfully');
      } else {
        await createTask(payload);
        toast.success('Task created successfully');
      }

      setIsDialogOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save task');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Status Shift
  const handleShiftStatus = async (task, newStatus) => {
    const prevTasks = [...tasks];
    // Optimistic UI update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));

    try {
      await updateTaskStatus(task._id, newStatus);
      toast.success(`Task shifted to ${newStatus.replace('-', ' ')}`);
      // Refresh metrics silently
      const mRes = await getTaskMetrics().catch(() => null);
      if (mRes && mRes.data) setMetrics(mRes.data);
    } catch (err) {
      // Revert optimistic update
      setTasks(prevTasks);
      toast.error(err.message || 'Failed to update task status');
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task._id);
  };

  const handleDragOver = (e, colStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetCol !== colStatus) {
      setDropTargetCol(colStatus);
    }
  };

  const handleDragLeave = () => {
    setDropTargetCol(null);
  };

  const handleDrop = async (e, colStatus) => {
    e.preventDefault();
    setDropTargetCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Check if status is already the same
    const currentStatusNorm = (task.status === 'pending' || task.status === 'TODO') ? 'todo' : task.status;
    if (currentStatusNorm === colStatus) return;

    const prevTasks = [...tasks];
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: colStatus } : t));

    try {
      await updateTaskStatus(taskId, colStatus);
      const colLabels = { 'todo': 'To-Do', 'in-progress': 'In Progress', 'completed': 'Completed' };
      toast.success(`Moved to "${colLabels[colStatus] || colStatus}"`);
      const mRes = await getTaskMetrics().catch(() => null);
      if (mRes && mRes.data) setMetrics(mRes.data);
    } catch (err) {
      setTasks(prevTasks);
      toast.error(err.message || 'Failed to persist task status');
    }
  };

  // Delete Task
  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    setActionLoading(true);
    try {
      await deleteTask(deletingTask._id);
      toast.success('Task removed');
      setDeletingTask(null);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    } finally {
      setActionLoading(false);
    }
  };

  // Check Overdue helper
  const isOverdue = (task) => {
    const rawDate = task.deadline || task.dueDate;
    if (!rawDate) return false;
    if (task.status === 'completed' || task.status === 'COMPLETED') return false;
    return new Date(rawDate) < new Date();
  };

  // Normalize task status helper
  const getNormalizedStatus = (status) => {
    if (!status) return 'todo';
    const s = status.toLowerCase();
    if (s === 'pending' || s === 'todo') return 'todo';
    if (s === 'in-progress' || s === 'in_progress') return 'in-progress';
    if (s === 'completed') return 'completed';
    return s;
  };

  // Priority badge styling helper
  const getPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    switch (p) {
      case 'urgent':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <Flame className="h-3 w-3 text-rose-400" />
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-orange-500/15 text-orange-400 border border-orange-500/30">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Medium
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-slate-500/15 text-slate-400 border border-slate-500/30">
            Low
          </span>
        );
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const normStatus = getNormalizedStatus(task.status);
    if (statusFilter !== 'all' && normStatus !== statusFilter) return false;

    if (priorityFilter !== 'all') {
      const p = (task.priority || 'medium').toLowerCase();
      if (p !== priorityFilter.toLowerCase()) return false;
    }

    if (assigneeFilter === 'mine') {
      const assignedId = task.assignedTo?._id || task.assignee?._id || task.assignedTo || task.assignee;
      const assignedEmail = task.assignedTo?.email || task.assignee?.email;
      if (assignedId !== currentUserId && assignedEmail !== user?.email) return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = task.title?.toLowerCase().includes(term);
      const matchDesc = task.description?.toLowerCase().includes(term);
      const matchAssignee = (task.assignedTo?.name || task.assignee?.name)?.toLowerCase().includes(term);
      const matchTeam = task.team?.name?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchAssignee && !matchTeam) return false;
    }

    return true;
  });

  // Split tasks by column for Kanban
  const kanbanColumns = [
    {
      id: 'todo',
      title: 'To-Do',
      icon: CircleDashed,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      accent: 'border-t-amber-500',
      tasks: filteredTasks.filter(t => getNormalizedStatus(t.status) === 'todo')
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      icon: RefreshCw,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      accent: 'border-t-blue-500',
      tasks: filteredTasks.filter(t => getNormalizedStatus(t.status) === 'in-progress')
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      accent: 'border-t-emerald-500',
      tasks: filteredTasks.filter(t => getNormalizedStatus(t.status) === 'completed')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/3 w-[500px] h-[300px] bg-teal-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-teal-500/15 border border-teal-500/20 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Tasks & Kanban</h1>
              <p className="text-xs text-slate-400">Sprint planning, workflow status columns, and team velocity</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenDialog(null, 'todo')}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs shadow-md shadow-teal-600/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Task Overview Metrics Cards (Connected to real API metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
        {/* Total Tasks */}
        <Card className="bg-slate-900/80 border-slate-800/80 p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Backlog</span>
            <CheckSquare className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics.totalTasks || tasks.length}</span>
            <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
              MongoDB
            </Badge>
          </div>
        </Card>

        {/* To-Do */}
        <Card className="bg-slate-900/80 border-slate-800/80 p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>To-Do</span>
            <CircleDashed className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics.todoTasks}</span>
            <span className="text-[11px] text-amber-400/80 font-medium">Pending</span>
          </div>
        </Card>

        {/* In Progress */}
        <Card className="bg-slate-900/80 border-slate-800/80 p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-blue-400">
            <span>In Progress</span>
            <RefreshCw className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics.inProgressTasks}</span>
            <span className="text-[11px] text-blue-400/80 font-medium">Active</span>
          </div>
        </Card>

        {/* Completed */}
        <Card className="bg-slate-900/80 border-slate-800/80 p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics.completedTasks}</span>
            <span className="text-[11px] text-emerald-400/80 font-medium">Done</span>
          </div>
        </Card>

        {/* Overdue */}
        <Card className={`p-4 flex flex-col justify-between shadow-lg transition-all ${
          metrics.overdueTasks > 0 ? 'bg-rose-950/20 border-rose-800/40' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>Overdue</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-2xl font-bold ${metrics.overdueTasks > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {metrics.overdueTasks}
            </span>
            <span className="text-[11px] text-rose-400/80 font-medium">Attention</span>
          </div>
        </Card>
      </div>

      {/* Control Bar: Search, Filters, View Toggle */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 shadow-lg max-w-md w-full backdrop-blur-md">
            <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search tasks by title, description, assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-500 hover:text-slate-300 ml-2"
              >
                Clear
              </button>
            )}
          </div>

          {/* User Isolation Filter + View Switcher */}
          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setAssigneeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  assigneeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Team Tasks
              </button>
              <button
                onClick={() => setAssigneeFilter('mine')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  assigneeFilter === 'mine' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                My Tasks
              </button>
            </div>

            <div className="flex items-center bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'board' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Kanban Board View"
              >
                <Kanban className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List Table View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
          {/* Priority Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-xs flex items-center mr-1">
              <Filter className="h-3.5 w-3.5 mr-1" /> Priority:
            </span>
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  priorityFilter === p ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status Filter (Active in List View) */}
          {viewMode === 'list' && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-xs flex items-center mr-1">
                Status:
              </span>
              {[
                { id: 'all', label: 'All' },
                { id: 'todo', label: 'To-Do' },
                { id: 'in-progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    statusFilter === s.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-rose-950/20 border-rose-800/40 p-6 mb-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-semibold text-rose-200">Unable to Fetch Tasks</h3>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
          <Button size="sm" variant="outline" onClick={loadData} className="border-rose-700 text-rose-200 text-xs">
            Retry Connection
          </Button>
        </Card>
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((col) => (
            <div key={col} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-800 rounded w-1/3" />
              <div className="h-28 bg-slate-800/60 rounded-xl" />
              <div className="h-28 bg-slate-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Kanban Board View */}
      {!loading && !error && viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {kanbanColumns.map((col) => {
            const isDropActive = dropTargetCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`bg-slate-900/70 border rounded-2xl p-4 flex flex-col min-h-[500px] transition-all duration-200 backdrop-blur-md ${
                  isDropActive
                    ? 'border-indigo-500/80 bg-indigo-950/20 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 shadow-xl'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <col.icon className={`h-4 w-4 ${col.color}`} />
                    <h3 className="text-sm font-bold text-white tracking-wide">{col.title}</h3>
                    <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${col.bgColor} ${col.color}`}>
                      {col.tasks.length}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(null, col.id)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Column Task Cards */}
                <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[70vh] pr-1">
                  {col.tasks.length === 0 ? (
                    <div className="py-12 px-4 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                      <p className="text-xs text-slate-500">No tasks in this column</p>
                      <button
                        onClick={() => handleOpenDialog(null, col.id)}
                        className="text-xs text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add task
                      </button>
                    </div>
                  ) : (
                    col.tasks.map((task) => {
                      const overdue = isOverdue(task);
                      const isDragging = draggedTaskId === task._id;

                      return (
                        <Card
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          className={`bg-slate-900/95 border-slate-800/90 shadow-md hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing group select-none ${
                            isDragging ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''
                          } ${overdue ? 'border-rose-900/50 hover:border-rose-700/60' : ''}`}
                        >
                          <CardHeader className="p-3.5 pb-2">
                            <div className="flex items-start justify-between gap-1.5 mb-1.5">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                {getPriorityBadge(task.priority)}
                                {overdue && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    Overdue
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="h-3.5 w-3.5 text-slate-600" />
                              </div>
                            </div>

                            <CardTitle className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors leading-snug">
                              {task.title}
                            </CardTitle>

                            {task.description && (
                              <CardDescription className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                                {task.description}
                              </CardDescription>
                            )}
                          </CardHeader>

                          <CardContent className="p-3.5 pt-0 space-y-2">
                            {/* Linked Document */}
                            {task.relatedDocument && (
                              <div className="flex items-center space-x-1.5 p-1.5 rounded-md bg-slate-950/60 border border-slate-800/80 text-[10px] text-indigo-300 truncate">
                                <FileText className="h-3 w-3 text-indigo-400 shrink-0" />
                                <span className="truncate">{task.relatedDocument.title}</span>
                              </div>
                            )}

                            {/* Assignee & Deadline Row */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                              <div className="flex items-center space-x-1.5 truncate max-w-[130px]">
                                <div className="h-5 w-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {((task.assignedTo?.name || task.assignee?.name || 'U')[0]).toUpperCase()}
                                </div>
                                <span className="truncate text-slate-300">
                                  {task.assignedTo?.name || task.assignee?.name || 'Unassigned'}
                                </span>
                              </div>

                              {(task.dueDate || task.deadline) && (
                                <span className={`text-[10px] font-mono flex items-center gap-1 ${overdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                                  <Calendar className="h-3 w-3 text-slate-500" />
                                  {new Date(task.dueDate || task.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </CardContent>

                          {/* Quick Column Shift and Actions Footer */}
                          <CardFooter className="p-2 px-3 border-t border-slate-800/70 bg-slate-950/40 flex items-center justify-between">
                            {/* Left shift button */}
                            {col.id !== 'todo' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShiftStatus(task, col.id === 'completed' ? 'in-progress' : 'todo')}
                                className="h-6 px-1.5 text-slate-400 hover:text-white text-[10px]"
                                title={col.id === 'completed' ? 'Move to In-Progress' : 'Move to To-Do'}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </Button>
                            ) : <div className="w-6" />}

                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(task)}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-300"
                                title="Edit Task"
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeletingTask(task)}
                                className="h-6 w-6 p-0 text-slate-400 hover:text-rose-400"
                                title="Delete Task"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Right shift button */}
                            {col.id !== 'completed' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShiftStatus(task, col.id === 'todo' ? 'in-progress' : 'completed')}
                                className="h-6 px-1.5 text-slate-400 hover:text-white text-[10px]"
                                title={col.id === 'todo' ? 'Move to In-Progress' : 'Move to Completed'}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            ) : <div className="w-6" />}
                          </CardFooter>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && !error && viewMode === 'list' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Task Title</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Priority</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Assignee</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Deadline</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const normStatus = getNormalizedStatus(task.status);
                    const overdue = isOverdue(task);

                    return (
                      <tr key={task._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleOpenDialog(task)}
                            className="font-semibold text-white hover:text-teal-300 text-xs text-left block"
                          >
                            {task.title}
                          </button>
                          {task.description && (
                            <p className="text-slate-400 text-[11px] truncate max-w-sm mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <select
                            value={normStatus}
                            onChange={(e) => handleShiftStatus(task, e.target.value)}
                            className={`text-[11px] font-semibold rounded-lg px-2 py-1 bg-slate-950 border border-slate-800 focus:outline-none ${
                              normStatus === 'completed' ? 'text-emerald-400 border-emerald-500/30' :
                              normStatus === 'in-progress' ? 'text-blue-400 border-blue-500/30' :
                              'text-amber-400 border-amber-500/30'
                            }`}
                          >
                            <option value="todo">To-Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getPriorityBadge(task.priority)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <UserIcon className="h-3 w-3 text-slate-500" />
                            {task.assignedTo?.name || task.assignee?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-[11px] font-mono">
                          {(task.dueDate || task.deadline) ? (
                            <span className={overdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {new Date(task.dueDate || task.deadline).toLocaleDateString()}
                              {overdue && ' (Overdue)'}
                            </span>
                          ) : (
                            <span className="text-slate-600">No deadline</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(task)}
                              className="h-7 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 text-xs"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingTask(task)}
                              className="h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Creation & Editing Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveTask}>
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                      <CheckSquare className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-white">
                      {editingTask ? 'Edit Task' : 'Create New Sprint Task'}
                    </CardTitle>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <CardDescription className="text-xs text-slate-400 mt-1">
                  Persist task details, deadlines, and user assignment to MongoDB.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Task Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement Multi-Tenant JWT Validation"
                    value={dialogTitle}
                    onChange={(e) => setDialogTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide acceptance criteria or context for this sprint task..."
                    value={dialogDesc}
                    onChange={(e) => setDialogDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Status and Priority Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Status Column
                    </label>
                    <select
                      value={dialogStatus}
                      onChange={(e) => setDialogStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="todo">To-Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Priority Level
                    </label>
                    <select
                      value={dialogPriority}
                      onChange={(e) => setDialogPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Assignee and Deadline Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Assignee
                    </label>
                    <select
                      value={dialogAssignee}
                      onChange={(e) => setDialogAssignee(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    >
                      <option value="">Unassigned</option>
                      {usersList.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role || 'Member'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Deadline / Due Date
                    </label>
                    <input
                      type="date"
                      value={dialogDeadline}
                      onChange={(e) => setDialogDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-800 justify-end p-4 gap-2.5 bg-slate-950/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={actionLoading}
                  className="border-slate-800 text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="p-6 pb-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <Trash2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-white">
                Delete Task?
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete sprint task <strong className="text-slate-200">"{deletingTask.title}"</strong>? 
                This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-4 pt-3 border-t border-slate-800 justify-end gap-2.5 bg-slate-950/40">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeletingTask(null)}
                disabled={actionLoading}
                className="border-slate-800 text-slate-400 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Tasks;
