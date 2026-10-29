import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  aiChat,
  aiSummarize,
  aiProcessMeetingNotes,
  aiConfirmMeetingTasks,
  aiGenerateEmail,
  aiGenerateContent,
  getDocuments
} from '../services/api';
import {
  Bot,
  Sparkles,
  MessageSquare,
  FileText,
  CheckSquare,
  Mail,
  Copy,
  Check,
  Send,
  Trash2,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export function AIAssistant() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'summarize' | 'meeting' | 'templates'

  // =====================
  // TAB 1: CHAT ASSISTANT
  // =====================
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your local AI Productivity Platform assistant. I operate deterministically right here in your application without external API keys or cloud services.\n\nAsk me anything about workflows, Kanban sprint planning, document summarization, or productivity best practices!`,
      suggestions: [
        'How do I create and automate tasks?',
        'How do workflows and triggers work?',
        'How can I extract tasks from meeting notes?',
        'What productivity frameworks are recommended?'
      ]
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = { sender: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setChatInput('');
    setChatLoading(true);

    try {
      const res = await aiChat(textToSend.trim());
      const reply = res.data?.answer || "I processed your request, but have no specific instructions for this query.";
      const suggestions = res.data?.suggestions || [];
      setMessages(prev => [...prev, { sender: 'assistant', text: reply, suggestions }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error: ${err.message || 'Unable to process local query.'}`,
          isError: true
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'assistant',
        text: `Conversation cleared. Ask me anything about tasks, workflows, documents, or productivity best practices!`,
        suggestions: [
          'How do I build an automated workflow?',
          'Explain the Kanban columns and priority levels',
          'Summarize a document',
          'Convert meeting notes to tasks'
        ]
      }
    ]);
  };

  // ==========================
  // TAB 2: DOCUMENT SUMMARIZER
  // ==========================
  const [summaryText, setSummaryText] = useState('');
  const [targetSentences, setTargetSentences] = useState(3);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [savedDocs, setSavedDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');

  useEffect(() => {
    // Fetch text documents for quick-select
    getDocuments({ type: 'TEXT' })
      .then(res => setSavedDocs(res.data || []))
      .catch(() => {});
  }, []);

  const handleSelectDocument = (e) => {
    const docId = e.target.value;
    setSelectedDocId(docId);
    if (!docId) return;
    const doc = savedDocs.find(d => d._id === docId);
    if (doc) {
      setSummaryText(doc.content || doc.description || '');
    }
  };

  const handleRunSummary = async () => {
    if (!summaryText.trim() || summaryLoading) return;
    setSummaryLoading(true);
    setSummaryError(null);
    setSummaryResult(null);

    try {
      const res = await aiSummarize({
        text: summaryText,
        options: { targetSentences }
      });
      setSummaryResult(res.data);
    } catch (err) {
      setSummaryError(err.message || 'Summarization failed');
    } finally {
      setSummaryLoading(false);
    }
  };

  // ======================================
  // TAB 3: MEETING NOTES TO TASKS REVIEW
  // ======================================
  const [meetingNotes, setMeetingNotes] = useState(
`# Weekly Core Sprint Sync

Decisions:
- Approved rollout of Phase 6 Workflow Automation Engine.
- Confirmed zero external AI API dependency architecture.
- Migrated scheduled jobs to single-instance safe in-memory interval.

Action Items:
- @admin implement workflow execution engine and trigger deduplication by Friday (urgent)
- @admin test meeting notes to tasks confirmation flow by tomorrow
- Review task assignment email templates and audit log trails
- Deploy production bundle and verify frontend build`
  );
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingResult, setMeetingResult] = useState(null);
  const [meetingError, setMeetingError] = useState(null);
  const [confirmingTasks, setConfirmingTasks] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(null);

  const handleProcessMeetingNotes = async () => {
    if (!meetingNotes.trim() || meetingLoading) return;
    setMeetingLoading(true);
    setMeetingError(null);
    setConfirmSuccess(null);

    try {
      const res = await aiProcessMeetingNotes(meetingNotes);
      setMeetingResult(res.data);
    } catch (err) {
      setMeetingError(err.message || 'Failed to process meeting notes');
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleToggleTaskSelected = (index) => {
    if (!meetingResult) return;
    const updated = [...meetingResult.extractedTasks];
    updated[index].selected = !updated[index].selected;
    setMeetingResult({ ...meetingResult, extractedTasks: updated });
  };

  const handleUpdateTaskField = (index, field, value) => {
    if (!meetingResult) return;
    const updated = [...meetingResult.extractedTasks];
    updated[index] = { ...updated[index], [field]: value };
    setMeetingResult({ ...meetingResult, extractedTasks: updated });
  };

  const handleConfirmTasks = async () => {
    if (!meetingResult || !meetingResult.extractedTasks) return;
    const selected = meetingResult.extractedTasks.filter(t => t.selected);
    if (selected.length === 0) {
      setMeetingError('Please select at least one task to create');
      return;
    }

    setConfirmingTasks(true);
    setMeetingError(null);

    try {
      const res = await aiConfirmMeetingTasks(selected);
      setConfirmSuccess(`Successfully created ${res.count} tasks in MongoDB!`);
      // Uncheck created tasks
      const remaining = meetingResult.extractedTasks.map(t => ({ ...t, selected: false }));
      setMeetingResult({ ...meetingResult, extractedTasks: remaining });
    } catch (err) {
      setMeetingError(err.message || 'Failed to confirm tasks in database');
    } finally {
      setConfirmingTasks(false);
    }
  };

  // ======================================
  // TAB 4: EMAIL & CONTENT TEMPLATE GENERATOR
  // ======================================
  const [templateCategory, setTemplateCategory] = useState('email'); // 'email' | 'content'
  const [emailTemplateType, setEmailTemplateType] = useState('task_assignment');
  const [contentTemplateType, setContentTemplateType] = useState('sprint_goal');
  const [templateContext, setTemplateContext] = useState({
    taskTitle: 'Implement Workflow Trigger Engine',
    assigneeName: 'Alex Mercer',
    priority: 'High',
    dueDate: '2026-10-30',
    description: 'Build ordered execution engine with loop prevention and state tracking.',
    meetingTitle: 'Phase 6 Architecture Review',
    projectName: 'AI Productivity Platform',
    completedCount: 18,
    inProgressCount: 5,
    theme: 'Workflow Automation & Local AI Features'
  });
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [draftSubject, setDraftSubject] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const handleGenerateDraft = async () => {
    setDraftLoading(true);
    setCopiedDraft(false);

    try {
      if (templateCategory === 'email') {
        const res = await aiGenerateEmail({
          templateType: emailTemplateType,
          context: templateContext
        });
        setDraftSubject(res.data?.subject || '');
        setGeneratedDraft(res.data?.body || '');
      } else {
        const res = await aiGenerateContent({
          contentType: contentTemplateType,
          params: templateContext
        });
        setDraftSubject(res.data?.title || '');
        setGeneratedDraft(res.data?.content || '');
      }
    } catch (err) {
      setGeneratedDraft(`Error generating draft: ${err.message}`);
    } finally {
      setDraftLoading(false);
    }
  };

  const handleCopyDraft = () => {
    const fullText = draftSubject ? `Subject: ${draftSubject}\n\n${generatedDraft}` : generatedDraft;
    navigator.clipboard.writeText(fullText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/3 w-[500px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[300px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header Bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ExternalLink className="h-4 w-4 mr-1 rotate-180" />
              Dashboard
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Studio & Assistant</h1>
              <p className="text-xs text-slate-400">Zero external API keys • 100% deterministic local intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Local Rule-Based Provider Active
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'chat'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>AI Chat Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('summarize')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'summarize'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Document Summarizer</span>
        </button>

        <button
          onClick={() => setActiveTab('meeting')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'meeting'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Meeting Notes ➔ Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'templates'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Email & Content Generator</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: AI CHAT ASSISTANT                                 */}
      {/* ======================================================== */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Box */}
          <Card className="lg:col-span-3 bg-slate-900/80 border-slate-800 shadow-xl flex flex-col h-[650px] overflow-hidden">
            <CardHeader className="border-b border-slate-800/80 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white flex items-center">
                  <Bot className="h-4 w-4 text-purple-400 mr-2" />
                  Productivity Assistant
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Ask questions about workflows, tasks, documents, or sprint planning
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearChat}
                className="text-slate-400 hover:text-slate-200 text-xs h-8"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            </CardHeader>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : msg.isError
                        ? 'bg-rose-950/60 border border-rose-800 text-rose-200 rounded-bl-none'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[85%]">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-purple-900/40 text-purple-300 border border-purple-500/20 transition-colors text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-400" />
                  <span>Processing local rule-based response...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about workflows, triggers, Kanban, or productivity tips..."
                  disabled={chatLoading}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-9 px-4"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          </Card>

          {/* Quick Prompts & Specs Sidebar */}
          <div className="space-y-4">
            <Card className="bg-slate-900/80 border-slate-800 p-4 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 mr-1.5" />
                Supported Topics
              </h3>
              <p className="text-[11px] text-slate-400">
                This assistant is 100% deterministic and runs without external APIs. It responds to:
              </p>
              <div className="space-y-1.5">
                {[
                  'How do workflows and triggers work?',
                  'How do I create and automate tasks?',
                  'What productivity frameworks are recommended?',
                  'How can I extract tasks from meeting notes?',
                  'Explain the Kanban columns and priority levels',
                  'Summarize a document'
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80 transition-colors"
                  >
                    • {prompt}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 p-4 space-y-2 text-slate-400 text-[11px]">
              <div className="font-semibold text-slate-300">Privacy & Compliance</div>
              <div>Zero telemetry or outbound LLM API requests. All evaluation occurs in local Node.js memory.</div>
            </Card>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DOCUMENT SUMMARIZER                               */}
      {/* ======================================================== */}
      {activeTab === 'summarize' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="bg-slate-900/80 border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-white">Document Text Input</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Paste plain-text or pick an existing note from MongoDB
                </CardDescription>
              </div>
              {savedDocs.length > 0 && (
                <select
                  value={selectedDocId}
                  onChange={handleSelectDocument}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="">Load from saved docs...</option>
                  {savedDocs.map(d => (
                    <option key={d._id} value={d._id}>{d.title}</option>
                  ))}
                </select>
              )}
            </div>

            <textarea
              rows={12}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Paste your report, meeting transcript, or markdown text here..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>Target Sentences:</span>
                <select
                  value={targetSentences}
                  onChange={(e) => setTargetSentences(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value={1}>1 Sentence (Ultra-compact)</option>
                  <option value={2}>2 Sentences</option>
                  <option value={3}>3 Sentences (Standard)</option>
                  <option value={5}>5 Sentences (Detailed)</option>
                </select>
              </div>

              <Button
                onClick={handleRunSummary}
                disabled={summaryLoading || !summaryText.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4"
              >
                {summaryLoading ? 'Analyzing...' : 'Generate Summary'}
              </Button>
            </div>

            {summaryError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs">
                {summaryError}
              </div>
            )}
          </Card>

          {/* Results Panel */}
          <Card className="bg-slate-900/80 border-slate-800 p-6 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <CardTitle className="text-base font-bold text-white flex items-center">
                  <Sparkles className="h-4 w-4 text-purple-400 mr-2" />
                  Deterministic Summary Result
                </CardTitle>
                {summaryResult && (
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px]">
                    Compression: {summaryResult.compressionRatio}
                  </Badge>
                )}
              </div>

              {summaryResult ? (
                <div className="space-y-4 text-xs">
                  {/* Summary Abstract */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-200 leading-relaxed font-sans">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-2">Executive Abstract</div>
                    {summaryResult.summary}
                  </div>

                  {/* Key Points */}
                  {summaryResult.keyPoints && summaryResult.keyPoints.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Points</div>
                      <div className="space-y-1.5">
                        {summaryResult.keyPoints.map((pt, pIdx) => (
                          <div key={pIdx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 flex items-start space-x-2">
                            <span className="text-purple-400 font-bold">•</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Original Words</div>
                      <div className="text-sm font-bold text-white">{summaryResult.originalWordCount}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Summary Words</div>
                      <div className="text-sm font-bold text-white">{summaryResult.summaryWordCount}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Reading Time</div>
                      <div className="text-sm font-bold text-white">{summaryResult.readingTimeMinutes} min</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-slate-500 space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-slate-700" />
                  <div>Enter text on the left and click "Generate Summary" to run local sentence extraction.</div>
                </div>
              )}
            </div>

            {summaryResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(summaryResult.summary);
                  alert('Summary copied to clipboard!');
                }}
                className="w-full border-slate-700 text-slate-300 text-xs"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Summary to Clipboard
              </Button>
            )}
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MEETING NOTES TO TASKS REVIEW                     */}
      {/* ======================================================== */}
      {activeTab === 'meeting' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/80 border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <CardTitle className="text-base font-bold text-white">Meeting Notes to Tasks Pipeline</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Deterministically parse action items, assignees, priorities, and confirm directly into MongoDB
                </CardDescription>
              </div>
              <Button
                onClick={handleProcessMeetingNotes}
                disabled={meetingLoading || !meetingNotes.trim()}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-4 self-start sm:self-auto"
              >
                {meetingLoading ? 'Parsing...' : 'Extract & Review Tasks'}
              </Button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Meeting Notes Raw Text</label>
              <textarea
                rows={8}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                placeholder="Paste meeting transcript or notes..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-purple-500"
              />
            </div>

            {meetingError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs">
                {meetingError}
              </div>
            )}

            {confirmSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
                <span>{confirmSuccess}</span>
                <Link to="/tasks" className="text-emerald-400 hover:underline flex items-center">
                  View in Kanban <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            )}
          </Card>

          {/* Extracted Tasks Review Area */}
          {meetingResult && (
            <Card className="bg-slate-900/80 border-slate-800 p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <CheckSquare className="h-4 w-4 text-purple-400 mr-2" />
                    Review & Edit Extracted Tasks ({meetingResult.extractedTasks?.length || 0})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verify titles, assignees, and priorities before confirming creation in database.
                  </p>
                </div>
                <Button
                  onClick={handleConfirmTasks}
                  disabled={confirmingTasks || (meetingResult.extractedTasks?.filter(t => t.selected).length === 0)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4"
                >
                  {confirmingTasks ? 'Creating in DB...' : 'Confirm & Create Tasks in MongoDB'}
                </Button>
              </div>

              {meetingResult.extractedTasks && meetingResult.extractedTasks.length > 0 ? (
                <div className="space-y-3">
                  {meetingResult.extractedTasks.map((task, idx) => (
                    <div
                      key={task.tempId || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        task.selected
                          ? 'bg-slate-950 border-purple-500/40'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={task.selected}
                          onChange={() => handleToggleTaskSelected(idx)}
                          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                        />

                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Task Title
                            </label>
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => handleUpdateTaskField(idx, 'title', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Priority
                            </label>
                            <select
                              value={task.priority}
                              onChange={(e) => handleUpdateTaskField(idx, 'priority', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              Assignee
                            </label>
                            <div className="px-2.5 py-1.5 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 truncate">
                              {task.assigneeName || 'Unassigned'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No action items identified with strong confidence in the provided text.
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: EMAIL & CONTENT TEMPLATE GENERATOR                */}
      {/* ======================================================== */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card className="bg-slate-900/80 border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <CardTitle className="text-base font-bold text-white">Template Configuration</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Choose format and customize context for instant drafts
              </CardDescription>
            </div>

            {/* Template Category Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTemplateCategory('email')}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  templateCategory === 'email'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Email Drafts
              </button>
              <button
                type="button"
                onClick={() => setTemplateCategory('content')}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  templateCategory === 'content'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Project Specs & Goals
              </button>
            </div>

            {templateCategory === 'email' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Template Type</label>
                <select
                  value={emailTemplateType}
                  onChange={(e) => setEmailTemplateType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  <option value="task_assignment">Task Assignment Notification</option>
                  <option value="task_reminder">Task Due Reminder</option>
                  <option value="meeting_summary">Meeting Summary & Decisions</option>
                  <option value="project_update">Weekly Project Update</option>
                  <option value="workflow_completion">Workflow Completion Report</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Template Type</label>
                <select
                  value={contentTemplateType}
                  onChange={(e) => setContentTemplateType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200"
                >
                  <option value="sprint_goal">Sprint Goal (SMART Objective)</option>
                  <option value="retrospective_template">Sprint Retrospective Framework</option>
                  <option value="task_spec">Task User Story & Spec</option>
                </select>
              </div>
            )}

            {/* Dynamic Parameter Inputs */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Task or Topic Title</label>
                <input
                  type="text"
                  value={templateContext.taskTitle}
                  onChange={(e) => setTemplateContext({ ...templateContext, taskTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={templateContext.assigneeName}
                    onChange={(e) => setTemplateContext({ ...templateContext, assigneeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                  <input
                    type="text"
                    value={templateContext.dueDate}
                    onChange={(e) => setTemplateContext({ ...templateContext, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerateDraft}
              disabled={draftLoading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs py-2.5 font-semibold"
            >
              {draftLoading ? 'Generating Draft...' : 'Generate Formatted Draft'}
            </Button>
          </Card>

          {/* Draft Display */}
          <Card className="bg-slate-900/80 border-slate-800 p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <CardTitle className="text-base font-bold text-white flex items-center">
                  <Mail className="h-4 w-4 text-purple-400 mr-2" />
                  Generated Draft
                </CardTitle>
                {copiedDraft && (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]">
                    <Check className="h-3 w-3 mr-1" /> Copied!
                  </Badge>
                )}
              </div>

              {draftSubject && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-purple-300">
                  <span className="text-slate-500 mr-2 font-normal">Subject:</span>
                  {draftSubject}
                </div>
              )}

              <textarea
                rows={12}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                placeholder="Click 'Generate Formatted Draft' on the left to produce an editable template..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-purple-500"
              />
            </div>

            {generatedDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyDraft}
                className="w-full border-slate-700 text-slate-300 text-xs mt-4"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy Draft to Clipboard
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
