import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { UPLOADS_DIR } from '../src/middleware/uploadMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
let baseUrl;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const { headers, ...restOptions } = options;
  const isFormData = options.body instanceof FormData || (options.body && typeof options.body.append === 'function');
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function setup() {
  console.log('🚀 Setting up Phase 5 Backend Verification...');
  await connectDB();

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✅ Phase 5 Test Server running on ${baseUrl}\n`);
      resolve();
    });
  });
}

async function teardown() {
  console.log('\n🧹 Cleaning up Phase 5 test server & DB...');
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
  console.log('✅ Teardown complete.\n');
}

async function runPhase5Verification() {
  try {
    await setup();

    // Acquire tokens for admin and regular user
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@productivity.local', password: 'Password123!' })
    });
    const adminToken = adminLogin.data.data.token;
    const adminUserId = adminLogin.data.data.user._id;

    const userLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'alex.engineer@productivity.local', password: 'Password123!' })
    });
    const userToken = userLogin.data.data.token;
    const regularUserId = userLogin.data.data.user._id;

    console.log('======================================================');
    console.log('🧪 SUITE 1: DOCUMENT MANAGEMENT (MODULE A)');
    console.log('======================================================');
    let textDocId;
    let fileDocId;
    let storedFileNameOnDisk;

    // 1. Create text document
    {
      const createRes = await request('/api/documents', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          title: 'Q4 Architectural Strategy Guide',
          description: 'Comprehensive high-level engineering strategy for Q4.',
          content: 'This is the rich text content of the architecture document.',
          documentType: 'TEXT'
        })
      });
      assert(createRes.status === 201, 'POST /api/documents creates text document (201)');
      assert(createRes.data.data.documentType === 'TEXT', 'Document type is TEXT');
      assert(createRes.data.data.owner !== undefined, 'Document has owner populated');
      textDocId = createRes.data.data._id;
    }

    // 2. Upload file document (multipart simulation using Blob / FormData)
    {
      const dummyFileContent = 'Hello AI Platform! This is a test file for secure download verification.';
      const blob = new Blob([dummyFileContent], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, 'sample-report.txt');
      formData.append('title', 'Platform Security Audit Report');
      formData.append('description', 'Verified internal security scan results.');

      const uploadRes = await request('/api/documents/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData
      });

      assert(uploadRes.status === 201, 'POST /api/documents/upload uploads file successfully (201)');
      assert(uploadRes.data.data.documentType === 'FILE', 'Uploaded documentType is FILE');
      assert(uploadRes.data.data.originalFileName === 'sample-report.txt', 'Original filename is preserved');
      assert(uploadRes.data.data.mimeType === 'text/plain', 'MIME type is detected as text/plain');
      assert(uploadRes.data.data.fileSize > 0, 'File size is recorded');
      fileDocId = uploadRes.data.data._id;
      storedFileNameOnDisk = uploadRes.data.data.storedFileName;

      // Verify file exists on physical disk in UPLOADS_DIR
      const physicalFilePath = path.join(UPLOADS_DIR, storedFileNameOnDisk);
      assert(fs.existsSync(physicalFilePath), 'Uploaded file exists in local uploads directory');
    }

    // 3. Search and filter documents
    {
      const searchRes = await request('/api/documents?search=Architectural');
      assert(searchRes.status === 200, 'GET /api/documents?search=Architectural returns 200');
      assert(searchRes.data.data.some((d) => d._id === textDocId), 'Search correctly locates created document by title');

      const fileFilterRes = await request('/api/documents?documentType=FILE');
      assert(fileFilterRes.status === 200, 'GET /api/documents?documentType=FILE returns 200');
      const allFiles = fileFilterRes.data.data.every((d) => d.documentType === 'FILE');
      assert(allFiles === true, 'documentType filter strictly returns FILE documents');
    }

    // 4. Update document (PATCH /api/documents/:id)
    {
      const updateRes = await request(`/api/documents/${textDocId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          title: 'Q4 Architectural Strategy Guide (Revised)',
          description: 'Updated architecture and system design goals.'
        })
      });
      assert(updateRes.status === 200, 'PATCH /api/documents/:id updates document (200)');
      assert(updateRes.data.data.title.includes('Revised'), 'Updated title persisted in MongoDB');
    }

    // 5. Secure file download
    {
      const downloadRes = await request(`/api/documents/${fileDocId}/download`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(downloadRes.status === 200, 'GET /api/documents/:id/download returns 200 OK');
      assert(downloadRes.headers.get('content-type').includes('text/plain'), 'Download Content-Type header matches MIME type');
      assert(downloadRes.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff header enforced');
      assert(downloadRes.data.includes('Hello AI Platform!'), 'Download stream contains actual file content');
    }

    // 6. Delete file document (verifies physical file unlinked)
    {
      const deleteRes = await request(`/api/documents/${fileDocId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(deleteRes.status === 200, 'DELETE /api/documents/:id deletes document record (200)');

      const physicalFilePath = path.join(UPLOADS_DIR, storedFileNameOnDisk);
      assert(!fs.existsSync(physicalFilePath), 'Deleted document unlinks physical file from storage');
    }

    console.log('\n======================================================');
    console.log('🧪 SUITE 2: TASK MANAGEMENT (MODULE B)');
    console.log('======================================================');
    let taskId;

    // 1. Create task with Phase 5 fields (status: 'TODO', priority: 'URGENT')
    {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 5);

      const createTaskRes = await request('/api/tasks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          title: 'Execute End-to-End Security Vulnerability Scan',
          description: 'Run automated SonarQube & Snyk dependency audit.',
          status: 'TODO',
          priority: 'urgent',
          deadline: deadlineDate.toISOString(),
          assignee: regularUserId
        })
      });
      assert(createTaskRes.status === 201, 'POST /api/tasks creates task with Phase 5 fields (201)');
      assert(createTaskRes.data.data.status === 'todo', 'Task status is normalized to todo');
      assert(createTaskRes.data.data.priority === 'urgent', 'Task priority is urgent');
      assert(createTaskRes.data.data.assignedTo?._id === regularUserId, 'Assignee is properly linked');
      taskId = createTaskRes.data.data._id;
    }

    // 2. Kanban Status Transitions (TODO -> IN_PROGRESS -> COMPLETED -> TODO)
    {
      // Move to in-progress
      const moveInProgress = await request(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      });
      assert(moveInProgress.status === 200, 'PATCH /api/tasks/:id/status moves task to IN_PROGRESS');
      assert(moveInProgress.data.data.status === 'in-progress', 'Status persisted as in-progress');

      // Move to completed
      const moveCompleted = await request(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      assert(moveCompleted.status === 200, 'PATCH /api/tasks/:id/status moves task to COMPLETED');
      assert(moveCompleted.data.data.status === 'completed', 'Status persisted as completed');

      // Move backward to todo
      const moveBackward = await request(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: 'TODO' })
      });
      assert(moveBackward.status === 200, 'PATCH /api/tasks/:id/status moves task backward to TODO');
      assert(moveBackward.data.data.status === 'todo', 'Status persisted as todo');
    }

    // 3. Update task fields (PATCH /api/tasks/:id)
    {
      const updateTaskRes = await request(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({
          title: 'Execute Comprehensive Vulnerability & Penetration Test',
          priority: 'high'
        })
      });
      assert(updateTaskRes.status === 200, 'PATCH /api/tasks/:id updates title and priority');
      assert(updateTaskRes.data.data.priority === 'high', 'Priority updated to high');
    }

    // 4. Real-time Task Metrics (GET /api/tasks/metrics)
    {
      const metricsRes = await request('/api/tasks/metrics');
      assert(metricsRes.status === 200, 'GET /api/tasks/metrics returns 200 OK');
      assert(typeof metricsRes.data.data.total === 'number', 'Metrics includes total count');
      assert(typeof metricsRes.data.data.todo === 'number', 'Metrics includes todo count');
      assert(typeof metricsRes.data.data.inProgress === 'number', 'Metrics includes inProgress count');
      assert(typeof metricsRes.data.data.completed === 'number', 'Metrics includes completed count');
      assert(typeof metricsRes.data.data.overdue === 'number', 'Metrics includes overdue count');
    }

    // 5. Sorting and Filtering
    {
      const sortedRes = await request('/api/tasks?sortBy=deadline&sortOrder=asc');
      assert(sortedRes.status === 200, 'GET /api/tasks?sortBy=deadline returns 200 OK');
      assert(Array.isArray(sortedRes.data.data), 'Returns task list');

      const filteredPriority = await request('/api/tasks?priority=high');
      assert(filteredPriority.status === 200, 'GET /api/tasks?priority=high returns 200 OK');
      const allHigh = filteredPriority.data.data.every((t) => t.priority === 'high');
      assert(allHigh === true, 'All returned tasks have priority high');
    }

    // 6. Delete task
    {
      const deleteRes = await request(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(deleteRes.status === 200, 'DELETE /api/tasks/:id deletes task (200)');
    }

    console.log('\n======================================================');
    console.log(`📊 PHASE 5 VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    await teardown();

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Phase 5 verification failed with error:', err);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
}

runPhase5Verification();
