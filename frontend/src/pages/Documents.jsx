import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  getDocuments, 
  createDocument, 
  uploadDocument, 
  updateDocument, 
  deleteDocument, 
  downloadDocument 
} from '../services/api';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Download, 
  LayoutGrid, 
  List, 
  FileCode, 
  FileSpreadsheet, 
  FileImage, 
  File, 
  Eye, 
  X, 
  Check, 
  AlertCircle, 
  Calendar, 
  User as UserIcon, 
  Building2,
  HardDrive,
  Copy
} from 'lucide-react';

export function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & View State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, TEXT, FILE
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null); // null = new, object = edit
  const [editorTitle, setEditorTitle] = useState('');
  const [editorDesc, setEditorDesc] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorTab, setEditorTab] = useState('write'); // 'write' | 'preview'

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Viewer Modal & Delete Modal
  const [viewingDoc, setViewingDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch documents from backend
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDocuments();
      setDocuments(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents from database');
      toast.error('Could not load documents: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Open Editor for new or existing doc
  const handleOpenEditor = (doc = null) => {
    if (doc) {
      setEditingDoc(doc);
      setEditorTitle(doc.title || '');
      setEditorDesc(doc.description || '');
      setEditorContent(doc.content || '');
    } else {
      setEditingDoc(null);
      setEditorTitle('');
      setEditorDesc('');
      setEditorContent('');
    }
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  // Save Text Document
  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!editorTitle.trim()) {
      toast.error('Document title is required');
      return;
    }

    setActionLoading(true);
    try {
      if (editingDoc) {
        await updateDocument(editingDoc._id, {
          title: editorTitle.trim(),
          description: editorDesc.trim(),
          content: editorContent
        });
        toast.success('Document updated successfully');
      } else {
        await createDocument({
          title: editorTitle.trim(),
          description: editorDesc.trim(),
          content: editorContent,
          documentType: 'TEXT'
        });
        toast.success('Document created successfully');
      }
      setIsEditorOpen(false);
      fetchDocs();
    } catch (err) {
      toast.error(err.message || 'Failed to save document');
    } finally {
      setActionLoading(false);
    }
  };

  // File Selection
  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit');
      return;
    }
    setUploadFile(file);
    if (!uploadTitle) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setUploadTitle(nameWithoutExt);
    }
  };

  // Upload File Document
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!uploadTitle.trim()) {
      toast.error('Title is required for uploaded file');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      if (uploadDesc.trim()) {
        formData.append('description', uploadDesc.trim());
      }

      await uploadDocument(formData);
      toast.success('File uploaded successfully');
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDesc('');
      fetchDocs();
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setActionLoading(false);
    }
  };

  // Download Document
  const handleDownload = async (doc) => {
    try {
      toast.info(`Preparing download for "${doc.originalFileName || doc.title}"...`);
      await downloadDocument(doc._id, doc.originalFileName || doc.title);
      toast.success('Download started');
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  // Confirm Delete Document
  const handleDeleteConfirm = async () => {
    if (!deletingDoc) return;
    setActionLoading(true);
    try {
      await deleteDocument(deletingDoc._id);
      toast.success('Document deleted permanently');
      setDeletingDoc(null);
      fetchDocs();
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper: Format file size
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper: File Type Icon
  const getDocumentIcon = (doc) => {
    const isFile = doc.documentType === 'FILE' || doc.fileUrl;
    if (!isFile) {
      return <FileText className="h-5 w-5 text-blue-400" />;
    }
    const mime = (doc.mimeType || '').toLowerCase();
    const name = (doc.originalFileName || doc.title || '').toLowerCase();
    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-rose-400" />;
    }
    if (mime.includes('image') || /\.(png|jpe?g|webp|gif)$/.test(name)) {
      return <FileImage className="h-5 w-5 text-emerald-400" />;
    }
    if (mime.includes('csv') || mime.includes('excel') || mime.includes('spreadsheet') || /\.(csv|xlsx?)$/.test(name)) {
      return <FileSpreadsheet className="h-5 w-5 text-amber-400" />;
    }
    if (mime.includes('json') || /\.(json|js|jsx|ts|tsx)$/.test(name)) {
      return <FileCode className="h-5 w-5 text-purple-400" />;
    }
    return <File className="h-5 w-5 text-indigo-400" />;
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (typeFilter !== 'ALL') {
      const isFile = doc.documentType === 'FILE' || Boolean(doc.fileUrl);
      if (typeFilter === 'FILE' && !isFile) return false;
      if (typeFilter === 'TEXT' && isFile) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = doc.title?.toLowerCase().includes(term);
      const matchDesc = doc.description?.toLowerCase().includes(term);
      const matchContent = doc.content?.toLowerCase().includes(term);
      const matchFileName = doc.originalFileName?.toLowerCase().includes(term);
      const matchTeam = doc.team?.name?.toLowerCase().includes(term);
      if (!matchTitle && !matchDesc && !matchContent && !matchFileName && !matchTeam) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-1/4 w-[500px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation & Header */}
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
            <div className="h-9 w-9 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Documents</h1>
              <p className="text-xs text-slate-400">Knowledge base, rich-text documentation, and uploaded assets</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs px-2.5 py-1">
            {loading ? 'Fetching...' : `${documents.length} Records in DB`}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocs}
            disabled={loading}
            className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenEditor()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Document
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setUploadFile(null);
              setUploadTitle('');
              setUploadDesc('');
              setIsUploadOpen(true);
            }}
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
            Upload File
          </Button>
        </div>
      </div>

      {/* Control Bar: Search, Type Filters, and View Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2 shadow-lg max-w-md w-full backdrop-blur-md">
          <Search className="h-4 w-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            placeholder="Search documents by title, description, or content..."
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

        {/* Filters and View Toggle */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Type Filter Buttons */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({documents.length})
            </button>
            <button
              onClick={() => setTypeFilter('TEXT')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === 'TEXT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Notes ({documents.filter(d => d.documentType === 'TEXT' || (!d.documentType && !d.fileUrl)).length})
            </button>
            <button
              onClick={() => setTypeFilter('FILE')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === 'FILE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Files ({documents.filter(d => d.documentType === 'FILE' || Boolean(d.fileUrl)).length})
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-rose-950/20 border-rose-800/40 p-6 mb-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-semibold text-rose-200">Unable to Fetch Documents</h3>
          <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchDocs} className="border-rose-700 text-rose-200 text-xs">
            Retry Connection
          </Button>
        </Card>
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-slate-900/60 border-slate-800 p-6 animate-pulse space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-1/4" />
              </div>
              <div className="h-4 bg-slate-700/60 rounded w-4/5" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-800/80 rounded w-full" />
                <div className="h-3 bg-slate-800/80 rounded w-5/6" />
                <div className="h-3 bg-slate-800/80 rounded w-2/3" />
              </div>
              <div className="h-8 bg-slate-800/40 rounded w-full pt-4" />
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredDocs.length === 0 && (
        <Card className="bg-slate-900/60 border-slate-800 py-16 px-6 text-center shadow-xl">
          <CardContent className="space-y-4 max-w-sm mx-auto">
            <div className="h-12 w-12 rounded-xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Documents Found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm
                  ? 'No documents match your query. Try resetting your search filters.'
                  : 'Start building your workspace documentation by creating a note or uploading a file.'}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button size="sm" onClick={() => handleOpenEditor()} className="bg-indigo-600 hover:bg-indigo-500 text-xs text-white">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create Note
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsUploadOpen(true)} className="border-slate-700 text-xs text-slate-200">
                <Upload className="h-3.5 w-3.5 mr-1" />
                Upload File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content View: Grid View */}
      {!loading && !error && filteredDocs.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const isFile = doc.documentType === 'FILE' || Boolean(doc.fileUrl);
            const isText = !isFile;

            return (
              <Card
                key={doc._id}
                className="bg-slate-900/80 border-slate-800 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-9 w-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                        {getDocumentIcon(doc)}
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold px-2 py-0.5 ${
                            isFile
                              ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
                              : 'border-blue-500/30 text-blue-300 bg-blue-500/10'
                          }`}
                        >
                          {isFile ? 'FILE ASSET' : 'TEXT NOTE'}
                        </Badge>
                      </div>
                    </div>

                    {doc.team?.name && (
                      <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 text-[10px] truncate max-w-[120px]">
                        <Building2 className="h-3 w-3 mr-1" />
                        {doc.team.name}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {doc.title}
                  </CardTitle>

                  {doc.description && (
                    <CardDescription className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed">
                      {doc.description}
                    </CardDescription>
                  )}

                  {doc.content && (
                    <p className="text-slate-500 text-xs line-clamp-3 mt-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-mono text-[11px]">
                      {doc.content}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="pb-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center text-[11px]">
                      <UserIcon className="h-3 w-3 mr-1 text-slate-500" />
                      {doc.owner?.name || doc.uploadedBy?.name || 'Administrator'}
                    </span>
                    <span className="flex items-center text-[10px] font-mono text-slate-400">
                      <Calendar className="h-3 w-3 mr-1 text-slate-500" />
                      {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {isFile && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                      <div className="flex items-center space-x-1.5 truncate">
                        <HardDrive className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{doc.originalFileName || 'Uploaded file'}</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-300 shrink-0 ml-2">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingDoc(doc)}
                    className="flex-1 border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 text-xs"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>

                  {isText && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditor(doc)}
                      className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-indigo-300 text-xs px-2.5"
                      title="Edit Document"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  {isFile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="border-emerald-800/50 bg-emerald-950/30 hover:bg-emerald-900/50 text-emerald-300 text-xs px-2.5"
                      title="Download File"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingDoc(doc)}
                    className="border-slate-800 bg-slate-950/60 hover:bg-rose-950/40 hover:border-rose-800/60 text-rose-400 text-xs px-2.5"
                    title="Delete Document"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Content View: List View */}
      {!loading && !error && filteredDocs.length > 0 && viewMode === 'list' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Document</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Size</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Owner</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Updated</th>
                  <th scope="col" className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-sans">
                {filteredDocs.map((doc) => {
                  const isFile = doc.documentType === 'FILE' || Boolean(doc.fileUrl);

                  return (
                    <tr key={doc._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
                            {getDocumentIcon(doc)}
                          </div>
                          <div className="min-w-0 max-w-xs md:max-w-md">
                            <button
                              onClick={() => setViewingDoc(doc)}
                              className="font-semibold text-white hover:text-blue-300 text-xs truncate block text-left"
                            >
                              {doc.title}
                            </button>
                            <p className="text-slate-400 text-[11px] truncate">
                              {doc.description || (doc.content ? doc.content.slice(0, 60) + '...' : 'No description')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            isFile
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                          }`}
                        >
                          {isFile ? 'FILE' : 'TEXT'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {isFile ? formatFileSize(doc.fileSize) : '—'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-300">
                        {doc.owner?.name || doc.uploadedBy?.name || 'Administrator'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingDoc(doc)}
                            className="h-7 px-2 text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {!isFile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditor(doc)}
                              className="h-7 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 text-xs"
                              title="Edit"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          {isFile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(doc)}
                              className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 text-xs"
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingDoc(doc)}
                            className="h-7 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Document Editor (Create & Edit) */}
      {isEditorOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleSaveDocument}>
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                      <Edit3 className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-white">
                      {editingDoc ? 'Edit Document' : 'Create New Document'}
                    </CardTitle>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <CardDescription className="text-xs text-slate-400 mt-1">
                  Compose documentation or markdown notes saved directly to MongoDB.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Document Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. System Architecture Specification"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Short summary of this document..."
                    value={editorDesc}
                    onChange={(e) => setEditorDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Content Editor with Write / Preview Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Document Content
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-md p-0.5">
                      <button
                        type="button"
                        onClick={() => setEditorTab('write')}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          editorTab === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab('preview')}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          editorTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {editorTab === 'write' ? (
                    <textarea
                      rows={9}
                      placeholder="Write your document content here (supports markdown formatting)..."
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
                    />
                  ) : (
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 min-h-[170px] max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans">
                      {editorContent || <span className="text-slate-600 italic">No content written yet.</span>}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-800 justify-end p-4 gap-2.5 bg-slate-950/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                  disabled={actionLoading}
                  className="border-slate-800 text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      {editingDoc ? 'Update Document' : 'Save Document'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 2: Upload File Dialog */}
      {isUploadOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <form onSubmit={handleUploadSubmit}>
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <Upload className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base font-bold text-white">
                      Upload Document File
                    </CardTitle>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <CardDescription className="text-xs text-slate-400 mt-1">
                  Upload PDF, Markdown, CSV, Office docs, or images up to 10MB.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : uploadFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,.txt,.md,.csv,.json,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                  />

                  {uploadFile ? (
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <Check className="h-5 w-5" />
                      </div>
                      <div className="text-xs font-semibold text-emerald-300">
                        {uploadFile.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {formatFileSize(uploadFile.size)} • {uploadFile.type || 'Custom file'}
                      </div>
                      <p className="text-[10px] text-slate-500 pt-1">
                        Click or drag to replace this file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-medium text-slate-200">
                        Drag and drop your file here, or <span className="text-indigo-400 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Supports PDF, TXT, MD, CSV, DOC, DOCX, Images (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Display Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Title for the uploaded document"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Description <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Short description of this file asset..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-800 justify-end p-4 gap-2.5 bg-slate-950/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadOpen(false)}
                  disabled={actionLoading}
                  className="border-slate-800 text-slate-400 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading || !uploadFile}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />
                      Uploading File...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Upload to Server
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL 3: View Document Details */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      viewingDoc.documentType === 'FILE' || viewingDoc.fileUrl
                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        : 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                    }`}
                  >
                    {viewingDoc.documentType === 'FILE' || viewingDoc.fileUrl ? 'File Document' : 'Rich Text Document'}
                  </Badge>
                  {viewingDoc.team?.name && (
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 text-xs">
                      {viewingDoc.team.name}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <CardTitle className="text-xl font-bold text-white mt-2">
                {viewingDoc.title}
              </CardTitle>

              {viewingDoc.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {viewingDoc.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 mt-2">
                <span>Owner: <strong className="text-slate-200">{viewingDoc.owner?.name || viewingDoc.uploadedBy?.name || 'Admin'}</strong></span>
                <span>•</span>
                <span>Created: <strong className="text-slate-200">{new Date(viewingDoc.createdAt).toLocaleString()}</strong></span>
                <span>•</span>
                <span>Last Updated: <strong className="text-slate-200">{new Date(viewingDoc.updatedAt || viewingDoc.createdAt).toLocaleString()}</strong></span>
              </div>
            </CardHeader>

            <CardContent className="p-6 max-h-[55vh] overflow-y-auto space-y-4">
              {/* If Uploaded File */}
              {(viewingDoc.documentType === 'FILE' || viewingDoc.fileUrl) && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        {getDocumentIcon(viewingDoc)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {viewingDoc.originalFileName || viewingDoc.title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {formatFileSize(viewingDoc.fileSize)} • {viewingDoc.mimeType || 'Application file'}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleDownload(viewingDoc)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}

              {/* Text Document Content */}
              {viewingDoc.content && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Document Content
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(viewingDoc.content);
                        toast.success('Content copied to clipboard');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy text
                    </button>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
                    {viewingDoc.content}
                  </div>
                </div>
              )}

              {!viewingDoc.content && !viewingDoc.fileUrl && viewingDoc.documentType !== 'FILE' && (
                <p className="text-xs text-slate-500 italic text-center py-4">
                  No text content recorded for this document.
                </p>
              )}
            </CardContent>

            <CardFooter className="border-t border-slate-800 justify-between p-4 bg-slate-950/40">
              <div className="flex items-center gap-2">
                {viewingDoc.documentType !== 'FILE' && !viewingDoc.fileUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setViewingDoc(null);
                      handleOpenEditor(viewingDoc);
                    }}
                    className="border-slate-800 text-indigo-300 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    Edit Document
                  </Button>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingDoc(null)}
                className="border-slate-800 text-slate-300 text-xs"
              >
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* MODAL 4: Delete Confirmation Dialog */}
      {deletingDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900 border-slate-700 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="p-6 pb-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <Trash2 className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-bold text-white">
                Delete Document?
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-200">"{deletingDoc.title}"</strong>? 
                {deletingDoc.documentType === 'FILE' && ' The stored file will also be removed from the server disk.'}
                {' '}This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter className="p-4 pt-3 border-t border-slate-800 justify-end gap-2.5 bg-slate-950/40">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeletingDoc(null)}
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

export default Documents;
