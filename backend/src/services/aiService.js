/**
 * Local Rule-Based AI Service Layer
 * 
 * Provides deterministic, provider-independent text processing, summarization,
 * task extraction, template-based generation, and an interactive assistant.
 * 
 * ZERO EXTERNAL DEPENDENCIES. NO GEMINI, NO OPENAI, NO LOCAL LLM OR GPU REQUIRED.
 */

import User from '../models/User.js';

// Common English stopwords for frequency analysis
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing',
  'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers',
  'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if',
  'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most',
  'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d',
  'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d',
  'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what',
  'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why',
  'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve',
  'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * 1. AI CHAT ASSISTANT
 * Deterministic rule-based assistant answering questions on productivity, tasks, workflows, documents, and platform features.
 */
export const answerQuestion = async (question, context = {}) => {
  if (!question || typeof question !== 'string' || !question.trim()) {
    return {
      answer: "Hello! I am your local AI Productivity Platform assistant. Ask me anything about tasks, workflows, documents, or productivity best practices.",
      intent: 'greeting',
      suggestions: [
        'How do I create and automate tasks?',
        'How do workflows and triggers work?',
        'How can I extract tasks from meeting notes?',
        'What productivity frameworks are recommended?'
      ],
      isFallback: false
    };
  }

  const normalized = question.toLowerCase().trim();

  // Knowledge base intent mapping
  const INTENTS = [
    {
      id: 'greeting',
      keywords: ['hello', 'hi', 'hey', 'greetings', 'who are you', 'what can you do', 'help me'],
      response: `Hello! I am your AI Productivity Platform local assistant. I operate deterministically right here in your application without external API keys or cloud dependencies.

Here is what I can assist you with:
• **Task Management**: Organizing sprints, Kanban prioritization, and due dates.
• **Workflow Automation**: Setting up triggers (manual, task created, task completed, document uploaded, scheduled) and ordered actions.
• **Document Management**: Markdown notes, file assets, summarization, and downloads.
• **Productivity Tools**: Extracting tasks from meeting notes and generating email drafts.`,
      suggestions: [
        'How do I build an automated workflow?',
        'Explain the Kanban columns and priority levels',
        'Summarize a document',
        'Convert meeting notes to tasks'
      ]
    },
    {
      id: 'workflows',
      keywords: ['workflow', 'pipeline', 'automation', 'trigger', 'step', 'schedule', 'cron', 'event'],
      response: `**Workflow Automation Guide**:
Workflows in this platform let you automate repetitive operational steps through ordered execution:

1. **Triggers**:
   • **Manual**: Triggered on-demand via the "Run Workflow" button.
   • **Task Created**: Fires automatically whenever a new task is logged.
   • **Task Completed**: Fires when a task transitions to "completed" status.
   • **Document Uploaded**: Fires after a document file is uploaded.
   • **Scheduled**: Periodically checks and runs at configured minute intervals.

2. **Actions Supported**:
   • Create Task (with automated title, description, and default priority)
   • Assign Task (maps to a valid team user)
   • Update Task Status (e.g. move to in-progress or completed)
   • Log Audit Activity (records event in audit trails)
   • Local AI Text Generation (formats status messages)
   • Extract Tasks from Text

3. **Reliability**:
   • Executions are tracked in **WorkflowExecution** logs.
   • Event deduplication prevents infinite trigger loops.`,
      suggestions: [
        'How do I create a workflow?',
        'What happens when a step fails?',
        'View execution history'
      ]
    },
    {
      id: 'tasks',
      keywords: ['task', 'kanban', 'sprint', 'todo', 'in progress', 'completed', 'priority', 'assignee', 'deadline'],
      response: `**Task Management & Kanban Best Practices**:
The platform provides a 3-column Kanban workflow:
• **To-Do**: Pending backlog items ready to be picked up.
• **In Progress**: Active work in development.
• **Completed**: Finished and verified tasks.

**Priority Levels**:
• **Urgent**: Critical blockers requiring immediate attention.
• **High**: Core sprint deliverables for the current cycle.
• **Medium**: Standard sprint tasks.
• **Low**: Non-blocking improvements or technical debt.

You can drag and drop cards between columns or use one-click status transitions. Automated tasks created by workflows will link directly to their source execution!`,
      suggestions: [
        'How do I extract tasks from meeting notes?',
        'Automate a task when another completes',
        'Go to Kanban board'
      ]
    },
    {
      id: 'documents',
      keywords: ['document', 'upload', 'pdf', 'notes', 'file', 'download', 'markdown', 'summarize'],
      response: `**Document Management System**:
You can manage two types of documents:
• **Rich-Text Notes**: Authored in markdown with live preview and syntax support.
• **File Assets**: Uploaded PDF, CSV, Office docs, code files, and images up to 10MB.

**AI Features Available for Documents**:
• **Summarization**: Generates key takeaways and condensed abstracts from plain text or uploaded notes.
• **Task Extraction**: Parses action items directly from document contents.
• **Security**: Streamed downloads enforce MIME type checks and \`X-Content-Type-Options: nosniff\`.`,
      suggestions: [
        'Summarize a text document',
        'Upload a file asset',
        'Extract action items'
      ]
    },
    {
      id: 'productivity',
      keywords: ['productivity', 'matrix', 'eisenhower', 'pomodoro', 'gtd', 'time management', 'focus', 'sprint'],
      response: `**Recommended Productivity Frameworks**:
1. **Eisenhower Matrix**: Categorize tasks into Urgent & Important (Do now), Important but Not Urgent (Schedule deadline), Urgent but Not Important (Automate via workflows), and Neither (Eliminate).
2. **Timeboxing / Pomodoro**: Work in focused 25-minute sprints followed by 5-minute rest breaks.
3. **Getting Things Done (GTD)**: Capture tasks immediately into the To-Do column, assign real owners, and group related items with documents.
4. **Automated Follow-ups**: Use the Email Generator to draft professional status reports and assignment alerts in seconds.`,
      suggestions: [
        'Generate a sprint update email',
        'Create a new sprint task',
        'Set up automated reminders'
      ]
    },
    {
      id: 'security',
      keywords: ['security', 'auth', 'jwt', 'token', 'admin', 'role', 'password', 'bcrypt'],
      response: `**Platform Security & Architecture**:
• **Authentication**: Secure JWT Bearer tokens with 7-day expiration.
• **Passwords**: Hashed with Bcrypt (10 salt rounds) before persistence.
• **Role-Based Access Control**: Distinguishes between standard \`user\` and \`admin\` privileges.
• **Data Isolation**: Documents, tasks, and workflows strictly validate ownership and team access on every endpoint.`,
      suggestions: [
        'View user profile',
        'Check database connection status'
      ]
    }
  ];

  // Match best intent by keyword count
  let bestIntent = null;
  let maxScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length; // weight longer specific keywords higher
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intent;
    }
  }

  if (bestIntent && maxScore >= 2) {
    return {
      answer: bestIntent.response,
      intent: bestIntent.id,
      suggestions: bestIntent.suggestions,
      isFallback: false
    };
  }

  // Graceful Fallback
  return {
    answer: `I understood your query about "${question.slice(0, 80)}", but as a local rule-based assistant, I focus specifically on platform capabilities:
• **Workflows & Automation**: Triggers, ordered steps, scheduling, and error policies.
• **Task Management**: Kanban flow, priority scoring, assignees, and deadlines.
• **Documents**: Note creation, uploads, downloads, and text summarization.
• **Local AI Tools**: Converting meeting notes to tasks, drafting emails, and sprint goals.

Try selecting one of the suggested topics below or ask a specific question about these features!`,
    intent: 'fallback',
    suggestions: [
      'How do I create and run a workflow?',
      'How does task extraction from meeting notes work?',
      'What trigger types are supported?',
      'How to generate a project update email'
    ],
    isFallback: true
  };
};

/**
 * 2. DOCUMENT SUMMARIZATION
 * Deterministic sentence-extraction and frequency-weighting algorithm.
 */
export const summarizeDocument = async (text, options = {}) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    const error = new Error('Text content is required for summarization');
    error.statusCode = 400;
    throw error;
  }

  const maxLength = options.maxLength || 50000;
  if (text.length > maxLength) {
    const error = new Error(`Document text exceeds maximum processing limit of ${maxLength} characters`);
    error.statusCode = 413;
    throw error;
  }

  const targetSentences = Math.max(parseInt(options.targetSentences, 10) || 3, 1);

  // Split into sentences using punctuation boundaries
  const rawSentences = text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/g)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 500);

  if (rawSentences.length === 0) {
    return {
      summary: text.slice(0, 300),
      keyPoints: [text.slice(0, 150)],
      originalWordCount: text.split(/\s+/).filter(Boolean).length,
      summaryWordCount: text.split(/\s+/).filter(Boolean).length,
      compressionRatio: '100%',
      readingTimeMinutes: 1
    };
  }

  // Calculate word frequencies
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));

  const freqMap = new Map();
  for (const word of words) {
    freqMap.set(word, (freqMap.get(word) || 0) + 1);
  }

  // Score sentences
  const scoredSentences = rawSentences.map((sentence, index) => {
    const sentenceWords = sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w));

    let score = 0;
    for (const w of sentenceWords) {
      score += freqMap.get(w) || 0;
    }

    // Position bonus: first and last sentences often contain conclusions
    if (index === 0) score *= 1.3;
    else if (index === rawSentences.length - 1) score *= 1.2;

    // Normalization by sentence word count to avoid bias toward run-on sentences
    const normalizedScore = sentenceWords.length > 0 ? score / Math.sqrt(sentenceWords.length) : 0;

    return {
      sentence,
      index,
      score: normalizedScore
    };
  });

  // Pick top N sentences by score
  const topSentences = [...scoredSentences]
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(targetSentences, rawSentences.length));

  // Re-order top sentences by original appearance for natural narrative flow
  topSentences.sort((a, b) => a.index - b.index);

  const summary = topSentences.map(item => item.sentence).join(' ');

  // Extract key points (top 3-5 high-signal sentences or bullet lists)
  const bulletMatches = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => /^[-*•\d+.]\s+/.test(line) && line.length > 15)
    .map(line => line.replace(/^[-*•\d+.]\s+/, ''))
    .slice(0, 5);

  const keyPoints = bulletMatches.length >= 2
    ? bulletMatches
    : topSentences.slice(0, 4).map(s => s.sentence);

  const originalWordCount = text.split(/\s+/).filter(Boolean).length;
  const summaryWordCount = summary.split(/\s+/).filter(Boolean).length;
  const compressionRatio = originalWordCount > 0
    ? `${Math.round((1 - summaryWordCount / originalWordCount) * 100)}%`
    : '0%';

  return {
    summary,
    keyPoints,
    originalWordCount,
    summaryWordCount,
    compressionRatio,
    readingTimeMinutes: Math.max(Math.ceil(originalWordCount / 200), 1)
  };
};

/**
 * 3. TASK EXTRACTION
 * Deterministic natural language pattern matching for action items, assignees, deadlines, and priorities.
 */
export const extractTasks = async (text, options = {}) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return { tasks: [], count: 0 };
  }

  // Load all users to validate possible assignees
  const users = await User.find({ isActive: { $ne: false } }).select('_id name email').lean();
  const userMap = new Map();
  for (const u of users) {
    userMap.set(u.name.toLowerCase(), u);
    userMap.set(u.email.toLowerCase(), u);
    const firstName = u.name.split(' ')[0].toLowerCase();
    if (!userMap.has(firstName)) {
      userMap.set(firstName, u);
    }
    const emailPrefix = u.email.split('@')[0].toLowerCase();
    userMap.set(emailPrefix, u);
    userMap.set('@' + emailPrefix, u);
    const emailDotFirst = emailPrefix.split('.')[0];
    if (!userMap.has(emailDotFirst)) {
      userMap.set(emailDotFirst, u);
    }
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const candidateTasks = [];

  // Patterns indicating action items
  const ACTION_PATTERNS = [
    /(?:todo|action item|action|task):\s*(.+)/i,
    /(?:^|\s)[-*•]\s*\[\s*\]\s*(.+)/i,
    /(?:^|\s)[-*•]\s*(?:need to|must|should|please|will|to)\s+(.+)/i,
    /(?:assigned to|assign to)\s+([A-Za-z0-9._-]+)\s*[:\-]\s*(.+)/i,
    /@([A-Za-z0-9._-]+)\s+(.+)/i,
    /([A-Za-z]+)\s+(?:will|to|needs to|must)\s+([a-zA-Z].+)/i
  ];

  // Priority detection helper
  const detectPriority = (str) => {
    const lower = str.toLowerCase();
    if (/\b(urgent|asap|critical|blocker|p0)\b/i.test(lower)) return 'urgent';
    if (/\b(high|important|crucial|p1)\b/i.test(lower)) return 'high';
    if (/\b(low|minor|nice to have|p3|backlog)\b/i.test(lower)) return 'low';
    return 'medium';
  };

  // Due date detection helper
  const detectDueDate = (str) => {
    const lower = str.toLowerCase();
    const now = new Date();

    if (/\b(today|eod)\b/i.test(lower)) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    }
    if (/\b(tomorrow)\b/i.test(lower)) {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      return d;
    }
    if (/\b(next week|friday)\b/i.test(lower)) {
      const d = new Date(now);
      d.setDate(d.getDate() + 5);
      return d;
    }

    // Match explicit dates like 2026-11-15 or Nov 15 or 11/15
    const isoMatch = lower.match(/\b(202\d-\d{2}-\d{2})\b/);
    if (isoMatch) {
      const parsed = new Date(isoMatch[1]);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthMatch = lower.match(/\b(by\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})\b/i);
    if (monthMatch) {
      const monthIdx = monthNames.findIndex(m => monthMatch[2].toLowerCase().startsWith(m));
      const day = parseInt(monthMatch[3], 10);
      const year = now.getFullYear();
      if (monthIdx !== -1 && day >= 1 && day <= 31) {
        return new Date(year, monthIdx, day);
      }
    }

    return null;
  };

  // Assignee detection helper
  const detectAssignee = (str) => {
    // Check @mentions
    const atMatch = str.match(/@([a-zA-Z0-9._-]+)/);
    if (atMatch) {
      const handle = atMatch[1].toLowerCase();
      if (userMap.has(handle)) return userMap.get(handle);
      const dotFirst = handle.split('.')[0];
      if (userMap.has(dotFirst)) return userMap.get(dotFirst);
    }

    // Check name tokens
    const tokens = str.split(/[\s,:\-]+/);
    for (const token of tokens) {
      const clean = token.toLowerCase();
      if (userMap.has(clean)) {
        return userMap.get(clean);
      }
    }

    return null;
  };

  let taskCounter = 1;

  for (const line of lines) {
    let matchedTitle = null;
    let potentialAssignee = null;

    // Try matching action item regexes
    for (const pattern of ACTION_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        if (match[2]) {
          // Format with explicit name capture
          potentialAssignee = userMap.get(match[1].toLowerCase()) || null;
          matchedTitle = match[2].trim();
        } else {
          matchedTitle = match[1].trim();
        }
        break;
      }
    }

    // If line has bullet with actionable words
    if (!matchedTitle && /^[-*•\d+.]\s+/.test(line)) {
      const cleanLine = line.replace(/^[-*•\d+.]\s+/, '');
      if (/\b(implement|create|fix|add|update|deploy|write|review|investigate|test|schedule|design)\b/i.test(cleanLine)) {
        matchedTitle = cleanLine;
      }
    }

    if (matchedTitle && matchedTitle.length >= 5) {
      // Clean title from trailing tags/dates
      const cleanTitle = matchedTitle
        .replace(/by\s+(today|tomorrow|next week|friday|\w+\s+\d{1,2})/i, '')
        .replace(/@[\w.-]+/g, '')
        .replace(/\((urgent|high|low|asap)\)/i, '')
        .trim();

      const priority = detectPriority(line);
      const dueDate = detectDueDate(line);
      const assigneeObj = potentialAssignee || detectAssignee(line);

      candidateTasks.push({
        tempId: `extracted_${Date.now()}_${taskCounter++}`,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        description: `Extracted from notes: "${line.slice(0, 200)}"`,
        priority,
        dueDate: dueDate ? dueDate.toISOString().split('T')[0] : null,
        assignedTo: assigneeObj ? assigneeObj._id : null,
        assigneeName: assigneeObj ? assigneeObj.name : 'Unassigned',
        assigneeEmail: assigneeObj ? assigneeObj.email : null,
        confidence: assigneeObj && dueDate ? 'high' : 'medium',
        selected: true
      });
    }
  }

  return {
    tasks: candidateTasks,
    count: candidateTasks.length
  };
};

/**
 * 4. MEETING NOTES TO TASKS PIPELINE
 * Parses agenda, attendees, decisions, and action items with complete review structure.
 */
export const processMeetingNotes = async (meetingText, options = {}) => {
  if (!meetingText || typeof meetingText !== 'string' || !meetingText.trim()) {
    const error = new Error('Meeting notes text is required');
    error.statusCode = 400;
    throw error;
  }

  // 1. Extract Title
  const firstLine = meetingText.split('\n')[0].replace(/^#+\s*/, '').trim();
  const title = firstLine.length > 5 && firstLine.length < 80 ? firstLine : 'Team Sprint Planning Meeting';

  // 2. Extract Decisions
  const decisions = [];
  const lines = meetingText.split('\n');
  let inDecisionsSection = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/decisions?|agreed|outcome/i.test(trimmed)) {
      inDecisionsSection = true;
      continue;
    }
    if (inDecisionsSection) {
      if (/^#+|^action items|^next steps/i.test(trimmed)) {
        inDecisionsSection = false;
        continue;
      }
      if (/^[-*•]\s+/.test(trimmed)) {
        decisions.push(trimmed.replace(/^[-*•]\s+/, ''));
      }
    }
  }

  // 3. Extract Tasks
  const { tasks } = await extractTasks(meetingText, options);

  // 4. Summarize Notes
  const summaryResult = await summarizeDocument(meetingText, { targetSentences: 2 });

  return {
    meetingTitle: title,
    summary: summaryResult.summary,
    decisions: decisions.length > 0 ? decisions : ['Continued iterative progress on platform roadmap.'],
    extractedTasks: tasks,
    totalTasksFound: tasks.length
  };
};

/**
 * 5. EMAIL AND CONTENT GENERATION
 * Deterministic local template generator for emails, sprint goals, and specs.
 */
export const generateEmail = async (templateType, context = {}) => {
  const supportedTypes = ['task_assignment', 'task_reminder', 'meeting_summary', 'project_update', 'workflow_completion'];

  if (!templateType || !supportedTypes.includes(templateType)) {
    const error = new Error(`Invalid email template type. Supported types: ${supportedTypes.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  switch (templateType) {
    case 'task_assignment': {
      const taskTitle = context.taskTitle || 'Productivity Platform Feature Task';
      const assigneeName = context.assigneeName || 'Team Member';
      const priority = (context.priority || 'Medium').toUpperCase();
      const dueDate = context.dueDate || 'Sprint End';
      const description = context.description || 'Please review acceptance criteria and update status in Kanban.';

      return {
        subject: `[Task Assigned] ${taskTitle} (${priority} Priority)`,
        body: `Hi ${assigneeName},

You have been assigned a new task in the AI Productivity Platform:

Task Title: ${taskTitle}
Priority: ${priority}
Due Date: ${dueDate}

Description:
${description}

You can update the task status directly in the Kanban board:
https://productivity.local/tasks

Best regards,
Sprint Orchestration Bot`,
        templateType,
        isDraft: true
      };
    }

    case 'task_reminder': {
      const taskTitle = context.taskTitle || 'Pending Sprint Task';
      const assigneeName = context.assigneeName || 'Team Member';
      const dueDate = context.dueDate || 'Tomorrow';

      return {
        subject: `[Reminder] Action Required: "${taskTitle}" due on ${dueDate}`,
        body: `Hello ${assigneeName},

This is an automated friendly reminder that the following task is scheduled for completion on ${dueDate}:

• Task: ${taskTitle}
• Status: Pending / In Progress

Please check in with the team or update your task status in the Kanban board if you require assistance or blockers need to be resolved.

Platform link: https://productivity.local/tasks

Thank you,
Team Project Lead`,
        templateType,
        isDraft: true
      };
    }

    case 'meeting_summary': {
      const meetingTitle = context.meetingTitle || 'Sprint Review & Engineering Sync';
      const attendees = context.attendees || 'Engineering Core Team';
      const decisions = context.decisions || ['Approved Phase 6 Workflow Automation rollout.', 'Confirmed zero external API dependency architecture.'];
      const actionItems = context.actionItems || ['Complete test suite verification.', 'Validate MongoDB state transitions.'];

      const decisionsText = Array.isArray(decisions) ? decisions.map(d => `  • ${d}`).join('\n') : `  • ${decisions}`;
      const actionsText = Array.isArray(actionItems) ? actionItems.map(a => `  • ${a}`).join('\n') : `  • ${actionItems}`;

      return {
        subject: `[Notes & Decisions] ${meetingTitle} — ${dateStr}`,
        body: `Hi Team,

Thank you for participating in today's ${meetingTitle}. Below is the executive summary and action items:

Date: ${dateStr}
Attendees: ${attendees}

Key Decisions:
${decisionsText}

Action Items & Next Steps:
${actionsText}

All action items have been registered in our platform Kanban backlog.

Best regards,
Meeting Facilitator`,
        templateType,
        isDraft: true
      };
    }

    case 'project_update': {
      const projectName = context.projectName || 'AI Productivity Platform';
      const completedCount = context.completedCount || 12;
      const inProgressCount = context.inProgressCount || 4;
      const blockers = context.blockers || 'None. All automated CI pipelines passing.';

      return {
        subject: `[Weekly Project Update] ${projectName} — Status: On Track`,
        body: `Team & Stakeholders,

Here is our sprint progress update for ${projectName} as of ${dateStr}:

Sprint Health: ON TRACK ✓
• Completed Tasks: ${completedCount}
• Active Tasks in Progress: ${inProgressCount}
• Critical Blockers: ${blockers}

Highlights:
• Modular Workflow Automation Engine active with manual, event-driven, and scheduled triggers.
• Local deterministic AI services running with zero external API key requirements.
• Full MongoDB Mongoose ODM persistence and audit trail logging verified.

View current backlog and live metrics: https://productivity.local/dashboard

Regards,
Project Engineering Lead`,
        templateType,
        isDraft: true
      };
    }

    case 'workflow_completion': {
      const workflowName = context.workflowName || 'Automated Pipeline';
      const status = (context.status || 'SUCCESS').toUpperCase();
      const stepsExecuted = context.stepsExecuted || 3;
      const duration = context.duration || '420ms';

      return {
        subject: `[Workflow ${status}] "${workflowName}" Execution Summary`,
        body: `Workflow Execution Report:

Workflow Name: ${workflowName}
Execution Status: ${status}
Steps Executed: ${stepsExecuted}
Duration: ${duration}
Timestamp: ${new Date().toISOString()}

All steps completed in accordance with the configured execution policy.

View execution logs: https://productivity.local/workflows`,
        templateType,
        isDraft: true
      };
    }
  }
};

/**
 * 6. CONTENT GENERATION
 * Deterministic generation for sprint goals, retrospective frameworks, and task acceptance criteria.
 */
export const generateContent = async (contentType, params = {}) => {
  const supportedTypes = ['sprint_goal', 'retrospective_template', 'task_spec'];

  if (!contentType || !supportedTypes.includes(contentType)) {
    const error = new Error(`Invalid content type. Supported types: ${supportedTypes.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  switch (contentType) {
    case 'sprint_goal': {
      const theme = params.theme || 'Phase 6 Workflow Automation & Local AI Integration';
      const focusAreas = params.focusAreas || 'Workflow Engine, Local Summarization, Deterministic Task Extraction';

      return {
        title: `Sprint Goal: ${theme}`,
        content: `**SMART Sprint Objective**:
Deliver ${theme} across full stack MERN layers.

**Key Deliverables**:
1. Implement ordered workflow execution engine with manual, task-event, and scheduled triggers.
2. Provide local rule-based AI processing for chat assistance, document summarization, and task extraction without external API keys.
3. Validate complete test suite and end-to-end browser workflows in MongoDB.

**Focus Areas**:
${focusAreas}

**Success Criteria**:
• All backend test suites pass with 0 failures.
• Frontend builds cleanly without external AI SDK dependencies.
• Automated tasks link seamlessly to workflow execution history.`
      };
    }

    case 'retrospective_template': {
      const sprintName = params.sprintName || 'Sprint Phase 6';
      return {
        title: `${sprintName} Retrospective Framework`,
        content: `### 🌟 What Went Well?
• Completed Phase 6 Workflow Automation with reliable trigger deduplication.
• Built deterministic rule-based AI features without requiring external API keys or paid cloud models.
• Preserved all existing MongoDB models, authentication guards, and UI design tokens.

### ⚠️ What Could Be Improved?
• Add additional workflow step action templates.
• Increase sentence ranking weights for specific domain technical terms.

### 🚀 Action Items:
1. Verify deployment readiness in production environment.
2. Add end-to-end integration automated tests.
3. Document API usage in platform README.`
      };
    }

    case 'task_spec': {
      const taskTitle = params.taskTitle || 'Implement Local Text Extraction Pipeline';
      return {
        title: `Task Specification: ${taskTitle}`,
        content: `## User Story
**As a** team member
**I want to** extract tasks from meeting notes deterministically
**So that** I can review, edit, and create tasks directly in MongoDB without manual copy-pasting.

## Acceptance Criteria
- [ ] Accepts plain text or markdown meeting notes input.
- [ ] Matches action items using regex and verb pattern recognition.
- [ ] Resolves assignee references against real users in the database.
- [ ] Automatically detects priorities ('urgent', 'high', 'medium', 'low').
- [ ] Allows user review and confirmation before inserting records into MongoDB.
- [ ] Prevents duplicate task submissions.`
      };
    }
  }
};

export default {
  answerQuestion,
  summarizeDocument,
  extractTasks,
  processMeetingNotes,
  generateEmail,
  generateContent
};
