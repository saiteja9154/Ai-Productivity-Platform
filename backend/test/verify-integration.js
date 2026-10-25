import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Document from '../src/models/Document.js';
import Task from '../src/models/Task.js';
import Team from '../src/models/Team.js';
import Workflow from '../src/models/Workflow.js';

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
  const res = await fetch(url, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function setup() {
  console.log('🚀 Connecting to Local MongoDB Database & Launching Test Server...');
  await connectDB();

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✅ Integration Test Server running on ${baseUrl}\n`);
      resolve();
    });
  });
}

async function teardown() {
  console.log('\n🧹 Cleaning up server & database connection...');
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
  console.log('✅ Teardown complete.\n');
}

async function runIntegrationVerification() {
  try {
    await setup();

    console.log('======================================================');
    console.log('🧪 SUITE 1: DATABASE & API HEALTH INDICATOR');
    console.log('======================================================');
    {
      const apiHealth = await request('/api/health');
      assert(apiHealth.status === 200, 'GET /api/health returns 200 OK');
      assert(apiHealth.data.success === true, 'API health status is healthy');
      assert(apiHealth.data.database.connected === true, 'Database connected flag is true');

      const dbHealth = await request('/api/health/db');
      assert(dbHealth.status === 200, 'GET /api/health/db returns 200 OK');
      assert(dbHealth.data.connected === true, 'DB health confirms connected: true');
      assert(dbHealth.data.database === 'ai_productivity_platform', 'DB health points to ai_productivity_platform');
      assert(dbHealth.data.password === undefined && dbHealth.data.uri === undefined, 'DB health does NOT expose secrets or credentials');
    }

    console.log('\n======================================================');
    console.log('🧪 SUITE 2: AUTHENTICATION & PROTECTED ROUTE ENFORCEMENT');
    console.log('======================================================');
    let adminToken;
    let userToken;
    let adminUserId;
    let normalUserId;

    {
      // 1. Login with demo admin
      const adminLogin = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@productivity.local',
          password: 'Password123!'
        })
      });
      assert(adminLogin.status === 200, 'POST /api/auth/login succeeds for admin (200)');
      assert(typeof adminLogin.data.data.token === 'string', 'Login returns JWT Bearer token');
      assert(adminLogin.data.data.user.role === 'admin', 'Login returns correct admin role');
      adminToken = adminLogin.data.data.token;
      adminUserId = adminLogin.data.data.user._id;

      // 2. Login with standard member
      const userLogin = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'alex.engineer@productivity.local',
          password: 'Password123!'
        })
      });
      assert(userLogin.status === 200, 'POST /api/auth/login succeeds for standard user (200)');
      userToken = userLogin.data.data.token;
      normalUserId = userLogin.data.data.user._id;

      // 3. Profile route with valid token
      const profileRes = await request('/api/users/profile', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(profileRes.status === 200, 'GET /api/users/profile with token returns 200');
      assert(profileRes.data.data.email === 'admin@productivity.local', 'Profile returns correct authenticated user');
      assert(profileRes.data.data.password === undefined, 'Profile response does NOT leak password hash');

      // 4. Profile route with missing token
      const unauthProfile = await request('/api/users/profile');
      assert(unauthProfile.status === 401, 'GET /api/users/profile without token returns 401 Unauthorized');

      // 5. Profile route with malformed/invalid token
      const invalidTokenProfile = await request('/api/users/profile', {
        headers: { Authorization: 'Bearer thisisnotavalidjwttoken123' }
      });
      assert(invalidTokenProfile.status === 401, 'GET /api/users/profile with invalid token returns 401 Unauthorized');

      // 6. Admin overview authorization check
      const adminForbidden = await request('/api/users/admin/overview', {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert(adminForbidden.status === 403, 'Normal member accessing admin route returns 403 Forbidden');

      const adminAllowed = await request('/api/users/admin/overview', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert(adminAllowed.status === 200, 'Admin user accessing admin route returns 200 OK');
    }

    console.log('\n======================================================');
    console.log('🧪 SUITE 3: VERIFY SEEDED DATA IN USERS, DOCUMENTS & TASKS');
    console.log('======================================================');
    let sampleDocId;
    let sampleTaskId;

    {
      // 1. Users
      const usersRes = await request('/api/users');
      assert(usersRes.status === 200, 'GET /api/users returns 200 OK');
      assert(usersRes.data.data.length >= 5, `GET /api/users returns seeded users (found: ${usersRes.data.data.length})`);
      const hasAdmin = usersRes.data.data.some((u) => u.email === 'admin@productivity.local');
      const hasEngineer = usersRes.data.data.some((u) => u.email === 'alex.engineer@productivity.local');
      assert(hasAdmin && hasEngineer, 'Seeded users Dev Admin and Alex Engineer exist in API response');

      // 2. Documents
      const docsRes = await request('/api/documents');
      assert(docsRes.status === 200, 'GET /api/documents returns 200 OK');
      assert(docsRes.data.data.length >= 3, `GET /api/documents returns seeded documents (found: ${docsRes.data.data.length})`);
      const archDoc = docsRes.data.data.find((d) => d.title.includes('Architecture'));
      assert(archDoc !== undefined, 'Seeded document "AI Platform Architecture & Schema Overview" exists');
      assert(archDoc.team && archDoc.team.name === 'Engineering Core', 'Document includes populated team relation');
      assert(archDoc.uploadedBy && archDoc.uploadedBy.email === 'admin@productivity.local', 'Document includes populated uploadedBy relation');
      sampleDocId = archDoc._id;

      // Document by ID
      const singleDocRes = await request(`/api/documents/${sampleDocId}`);
      assert(singleDocRes.status === 200, 'GET /api/documents/:id returns 200 OK');
      assert(singleDocRes.data.data.title === archDoc.title, 'Single document returns matching seeded title');

      // 3. Tasks
      const tasksRes = await request('/api/tasks');
      assert(tasksRes.status === 200, 'GET /api/tasks returns 200 OK');
      assert(tasksRes.data.data.length >= 4, `GET /api/tasks returns seeded tasks (found: ${tasksRes.data.data.length})`);
      const indexTask = tasksRes.data.data.find((t) => t.title === 'Implement MongoDB Indexing and Performance Benchmarks');
      assert(indexTask !== undefined, 'Seeded task "Implement MongoDB Indexing..." exists');
      assert(indexTask.status === 'in-progress' && indexTask.priority === 'high', 'Task returns correct status & priority');
      assert(indexTask.assignedTo && indexTask.assignedTo.email === 'alex.engineer@productivity.local', 'Task includes populated assignedTo relation');
      assert(indexTask.relatedDocument && indexTask.relatedDocument.title.includes('Architecture'), 'Task includes populated relatedDocument relation');
      sampleTaskId = indexTask._id;

      // Task by ID
      const singleTaskRes = await request(`/api/tasks/${sampleTaskId}`);
      assert(singleTaskRes.status === 200, 'GET /api/tasks/:id returns 200 OK');
      assert(singleTaskRes.data.data.title === indexTask.title, 'Single task returns matching seeded title');

      // 4. Teams
      const teamsRes = await request('/api/teams');
      assert(teamsRes.status === 200, 'GET /api/teams returns 200 OK');
      assert(teamsRes.data.data.length >= 3, `GET /api/teams returns seeded teams (found: ${teamsRes.data.data.length})`);

      // 5. Workflows
      const workflowsRes = await request('/api/workflows');
      assert(workflowsRes.status === 200, 'GET /api/workflows returns 200 OK');
      assert(workflowsRes.data.data.length >= 2, `GET /api/workflows returns seeded workflows (found: ${workflowsRes.data.data.length})`);
    }

    console.log('\n======================================================');
    console.log('🧪 SUITE 4: USER DATA ISOLATION & QUERY FILTERING');
    console.log('======================================================');
    {
      // Filter tasks by assignee (alex.engineer)
      const alexTasksRes = await request(`/api/tasks?assignedTo=${normalUserId}`);
      assert(alexTasksRes.status === 200, 'GET /api/tasks?assignedTo=<alexUserId> returns 200 OK');
      assert(alexTasksRes.data.data.length >= 2, `Filtered tasks correctly returns Alex's tasks (${alexTasksRes.data.data.length})`);
      const allAlex = alexTasksRes.data.data.every((t) => t.assignedTo?._id === normalUserId);
      assert(allAlex === true, 'All returned tasks strictly belong to the filtered assignee');

      // Filter tasks by status (completed)
      const completedTasksRes = await request('/api/tasks?status=completed');
      assert(completedTasksRes.status === 200, 'GET /api/tasks?status=completed returns 200 OK');
      const allCompleted = completedTasksRes.data.data.every((t) => t.status === 'completed');
      assert(allCompleted === true, 'Status filter strictly returns completed tasks');

      // Filter documents by team
      const engTeam = await Team.findOne({ name: 'Engineering Core' });
      const teamDocsRes = await request(`/api/documents?team=${engTeam._id}`);
      assert(teamDocsRes.status === 200, 'GET /api/documents?team=<engTeamId> returns 200 OK');
      const allEng = teamDocsRes.data.data.every((d) => d.team?._id === engTeam._id.toString());
      assert(allEng === true, 'Document team filter isolates documents by team');
    }

    console.log('\n======================================================');
    console.log('🧪 SUITE 5: ERROR HANDLING & INVALID REQUEST REJECTION');
    console.log('======================================================');
    {
      // Invalid ObjectId format
      const invalidDocRes = await request('/api/documents/invalid-id-123');
      assert(invalidDocRes.status === 400, 'GET /api/documents/:id with malformed ID returns 400 Bad Request');
      assert(invalidDocRes.data.errors.some((e) => e.message.includes('Invalid Document ID')), 'Descriptive error message for invalid Document ID');

      const invalidTaskRes = await request('/api/tasks/not-a-mongo-id');
      assert(invalidTaskRes.status === 400, 'GET /api/tasks/:id with malformed ID returns 400 Bad Request');
      assert(invalidTaskRes.data.errors.some((e) => e.message.includes('Invalid Task ID')), 'Descriptive error message for invalid Task ID');

      // Non-existent valid ObjectId (404)
      const nonExistentDocId = new mongoose.Types.ObjectId();
      const notFoundDocRes = await request(`/api/documents/${nonExistentDocId}`);
      assert(notFoundDocRes.status === 404, 'GET /api/documents/:id for non-existent ID returns 404 Not Found');

      const nonExistentTaskId = new mongoose.Types.ObjectId();
      const notFoundTaskRes = await request(`/api/tasks/${nonExistentTaskId}`);
      assert(notFoundTaskRes.status === 404, 'GET /api/tasks/:id for non-existent ID returns 404 Not Found');

      // Non-existent route (404)
      const unknownRouteRes = await request('/api/non-existent-endpoint');
      assert(unknownRouteRes.status === 404, 'Unknown API route returns 404 Route Not Found');
    }

    console.log('\n======================================================');
    console.log(`📊 MASTER PROMPT 4 INTEGRATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    await teardown();

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Integration test failed with error:', error);
    if (server) server.close();
    await disconnectDB();
    process.exit(1);
  }
}

runIntegrationVerification();
