import { getToken } from './authService';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Builds standard request headers with Authorization Bearer token if present
 */
function getRequestHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Helper to build URL with query params
 */
function buildUrl(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.append(key, val);
    }
  });
  return url.toString();
}

/**
 * Health check endpoints
 */
export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    const data = await res.json();
    return {
      success: res.ok,
      status: data.status,
      message: data.message || 'API is reachable',
      statusCode: res.status
    };
  } catch (err) {
    return {
      success: false,
      status: 'error',
      message: err.message || 'Backend is unreachable',
      statusCode: 0
    };
  }
}

export async function checkDbHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health/db`);
    const data = await res.json();
    return {
      success: res.ok && data.connected,
      connected: data.connected,
      status: data.status,
      message: data.message || (data.connected ? 'MongoDB is connected' : 'MongoDB is disconnected'),
      database: data.database,
      error: data.error,
      statusCode: res.status
    };
  } catch (err) {
    return {
      success: false,
      connected: false,
      status: 'error',
      message: 'Unable to query database health endpoint',
      error: err.message,
      statusCode: 0
    };
  }
}

/**
 * Documents API
 */
export async function getDocuments(params = {}) {
  const res = await fetch(buildUrl('/api/documents', params), {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch documents (${res.status})`);
  }
  return data;
}

export async function getDocumentById(id) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch document ${id} (${res.status})`);
  }
  return data;
}

export async function createDocument(payload) {
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to create document (${res.status})`);
  }
  return data;
}

export async function uploadDocument(formData) {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  // Browser will set multipart/form-data boundary automatically

  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to upload document (${res.status})`);
  }
  return data;
}

export async function updateDocument(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to update document (${res.status})`);
  }
  return data;
}

export async function deleteDocument(id) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: 'DELETE',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete document (${res.status})`);
  }
  return data;
}

export async function downloadDocument(id, fallbackFileName = 'document') {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/documents/${id}/download`, {
    method: 'GET',
    headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to download file (${res.status})`);
  }

  const disposition = res.headers.get('content-disposition');
  let filename = fallbackFileName;
  if (disposition && disposition.includes('filename=')) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
  return { success: true, filename };
}

/**
 * Tasks API
 */
export async function getTasks(params = {}) {
  const res = await fetch(buildUrl('/api/tasks', params), {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch tasks (${res.status})`);
  }
  return data;
}

export async function getTaskById(id) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch task ${id} (${res.status})`);
  }
  return data;
}

export async function getTaskMetrics() {
  const res = await fetch(`${API_BASE_URL}/api/tasks/metrics`, {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch task metrics (${res.status})`);
  }
  return data;
}

export async function createTask(payload) {
  const res = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to create task (${res.status})`);
  }
  return data;
}

export async function updateTask(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to update task (${res.status})`);
  }
  return data;
}

export async function updateTaskStatus(id, status) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify({ status })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to update task status (${res.status})`);
  }
  return data;
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete task (${res.status})`);
  }
  return data;
}

/**
 * Teams API
 */
export async function getTeams(params = {}) {
  const res = await fetch(buildUrl('/api/teams', params), {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch teams (${res.status})`);
  }
  return data;
}

/**
 * Workflows API
 */
export async function getWorkflows(params = {}) {
  const res = await fetch(buildUrl('/api/workflows', params), {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch workflows (${res.status})`);
  }
  return data;
}

export async function getWorkflowById(id) {
  const res = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch workflow ${id} (${res.status})`);
  }
  return data;
}

export async function createWorkflow(payload) {
  const res = await fetch(`${API_BASE_URL}/api/workflows`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to create workflow (${res.status})`);
  }
  return data;
}

export async function updateWorkflow(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
    method: 'PATCH',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to update workflow (${res.status})`);
  }
  return data;
}

export async function deleteWorkflow(id) {
  const res = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
    method: 'DELETE',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to delete workflow (${res.status})`);
  }
  return data;
}

export async function activateWorkflow(id) {
  const res = await fetch(`${API_BASE_URL}/api/workflows/${id}/activate`, {
    method: 'POST',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to activate workflow (${res.status})`);
  }
  return data;
}

export async function deactivateWorkflow(id) {
  const res = await fetch(`${API_BASE_URL}/api/workflows/${id}/deactivate`, {
    method: 'POST',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to deactivate workflow (${res.status})`);
  }
  return data;
}

export async function runWorkflow(id, payload = {}) {
  const res = await fetch(`${API_BASE_URL}/api/workflows/${id}/run`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to run workflow (${res.status})`);
  }
  return data;
}

export async function getWorkflowExecutions(id, params = {}) {
  const res = await fetch(buildUrl(`/api/workflows/${id}/executions`, params), {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch executions (${res.status})`);
  }
  return data;
}

export async function getExecutionById(executionId) {
  const res = await fetch(`${API_BASE_URL}/api/workflows/executions/${executionId}`, {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch execution detail (${res.status})`);
  }
  return data;
}

/**
 * Local AI API (Zero External Keys, Deterministic Backend Services)
 */
export async function aiChat(payload) {
  const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(typeof payload === 'string' ? { message: payload } : payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `AI Chat request failed (${res.status})`);
  }
  return data;
}

export async function aiSummarize(payload) {
  const res = await fetch(`${API_BASE_URL}/api/ai/summarize`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(typeof payload === 'string' ? { text: payload } : payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Summarization failed (${res.status})`);
  }
  return data;
}

export async function aiExtractTasks(payload) {
  const res = await fetch(`${API_BASE_URL}/api/ai/extract-tasks`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(typeof payload === 'string' ? { text: payload } : payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Task extraction failed (${res.status})`);
  }
  return data;
}

export async function aiProcessMeetingNotes(payload) {
  const res = await fetch(`${API_BASE_URL}/api/ai/process-meeting-notes`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(typeof payload === 'string' ? { text: payload } : payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Meeting notes processing failed (${res.status})`);
  }
  return data;
}

export async function aiConfirmMeetingTasks(tasks) {
  const res = await fetch(`${API_BASE_URL}/api/ai/confirm-meeting-tasks`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify({ tasks })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to confirm tasks (${res.status})`);
  }
  return data;
}

export async function aiGenerateEmail(payload) {
  const res = await fetch(`${API_BASE_URL}/api/ai/generate-email`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Email generation failed (${res.status})`);
  }
  return data;
}

export async function aiGenerateContent(payload) {
  const res = await fetch(`${API_BASE_URL}/api/ai/generate-content`, {
    method: 'POST',
    headers: getRequestHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Content generation failed (${res.status})`);
  }
  return data;
}

/**
 * Users API
 */
export async function getUsers(params = {}) {
  const res = await fetch(buildUrl('/api/users', params), {
    method: 'GET',
    headers: getRequestHeaders()
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to fetch users (${res.status})`);
  }
  return data;
}

/**
 * Combined Dashboard Summary
 * Concurrently queries MongoDB collections via backend APIs
 */
export async function getDashboardSummary() {
  const [dbRes, docsRes, tasksRes, workflowsRes] = await Promise.allSettled([
    checkDbHealth(),
    getDocuments(),
    getTasks(),
    getWorkflows()
  ]);

  return {
    db: dbRes.status === 'fulfilled' ? dbRes.value : { connected: false, message: 'DB check failed' },
    documents: docsRes.status === 'fulfilled' ? (docsRes.value.data || []) : [],
    documentsError: docsRes.status === 'rejected' ? docsRes.reason.message : null,
    tasks: tasksRes.status === 'fulfilled' ? (tasksRes.value.data || []) : [],
    tasksError: tasksRes.status === 'rejected' ? tasksRes.reason.message : null,
    workflows: workflowsRes.status === 'fulfilled' ? (workflowsRes.value.data || []) : [],
    workflowsError: workflowsRes.status === 'rejected' ? workflowsRes.reason.message : null
  };
}

export default {
  API_BASE_URL,
  checkApiHealth,
  checkDbHealth,
  getDocuments,
  getDocumentById,
  createDocument,
  uploadDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getTasks,
  getTaskById,
  getTaskMetrics,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTeams,
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
  runWorkflow,
  getWorkflowExecutions,
  getExecutionById,
  aiChat,
  aiSummarize,
  aiExtractTasks,
  aiProcessMeetingNotes,
  aiConfirmMeetingTasks,
  aiGenerateEmail,
  aiGenerateContent,
  getUsers,
  getDashboardSummary
};

