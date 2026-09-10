import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import http from 'http';
import app from '../src/app.js';

let mongod;
let server;
let baseUrl;

async function setup() {
  console.log('🚀 Starting In-Memory MongoDB Test Environment...');
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri);
  console.log(`✅ Test MongoDB Connected at ${uri}`);

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✅ Test Server listening on ${baseUrl}`);
      resolve();
    });
  });
}

async function teardown() {
  console.log('\n🧹 Cleaning up test environment...');
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  console.log('✅ Teardown complete.');
}

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

async function runTests() {
  try {
    await setup();

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: HEALTH & ROOT ENDPOINTS');
    console.log('======================================================');
    {
      // 1. Root
      const res = await fetch(`${baseUrl}/`);
      const data = await res.json();
      assert(res.status === 200 && data.status === 'online', 'GET / returns 200 with online status');

      // 2. Health
      const healthRes = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthRes.json();
      assert(healthRes.status === 200 && healthData.success === true, 'GET /api/health returns 200 success');

      // 3. DB Health
      const dbRes = await fetch(`${baseUrl}/api/health/db`);
      const dbData = await dbRes.json();
      assert(dbRes.status === 200 && dbData.connected === true, 'GET /api/health/db returns 200 connected: true');
    }

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: USERS MODULE & VALIDATION');
    console.log('======================================================');
    let userId;
    {
      // Create user
      const createRes = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Alex Mercer',
          email: 'alex.mercer@productivity.io',
          password: 'superSecretPassword123',
          role: 'admin'
        })
      });
      const createData = await createRes.json();
      assert(createRes.status === 201 && createData.success === true, 'POST /api/users creates user (201)');
      assert(createData.data.password === undefined, 'User password is removed from JSON response');
      userId = createData.data._id;

      // Duplicate email
      const dupRes = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplicate Alex',
          email: 'alex.mercer@productivity.io',
          password: 'anotherPassword123'
        })
      });
      const dupData = await dupRes.json();
      assert(dupRes.status === 400 && dupData.success === false, 'POST /api/users rejects duplicate email (400)');

      // Validation failure (missing fields)
      const invalidRes = await fetch(`${baseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'A' })
      });
      const invalidData = await invalidRes.json();
      assert(invalidRes.status === 400 && invalidData.success === false && invalidData.errors.length > 0, 'POST /api/users returns validation error for short name & missing fields');

      // Get all users
      const getRes = await fetch(`${baseUrl}/api/users`);
      const getData = await getRes.json();
      assert(getRes.status === 200 && Array.isArray(getData.data) && getData.data.length >= 1, 'GET /api/users lists users');

      // Get user by ID
      const getSingleRes = await fetch(`${baseUrl}/api/users/${userId}`);
      const getSingleData = await getSingleRes.json();
      assert(getSingleRes.status === 200 && getSingleData.data.name === 'Alex Mercer', 'GET /api/users/:id retrieves correct user');

      // Update user
      const updateRes = await fetch(`${baseUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Alexander Mercer Jr.' })
      });
      const updateData = await updateRes.json();
      assert(updateRes.status === 200 && updateData.data.name === 'Alexander Mercer Jr.', 'PUT /api/users/:id updates user name');
    }

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: TEAMS MODULE');
    console.log('======================================================');
    let teamId;
    {
      // Create team
      const teamRes = await fetch(`${baseUrl}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Core AI Engineering Team',
          description: 'High-velocity architecture and agents development',
          createdBy: userId
        })
      });
      const teamData = await teamRes.json();
      assert(teamRes.status === 201 && teamData.success === true, 'POST /api/teams creates team');
      teamId = teamData.data._id;

      // Get all teams
      const getTeamsRes = await fetch(`${baseUrl}/api/teams`);
      const getTeamsData = await getTeamsRes.json();
      assert(getTeamsRes.status === 200 && getTeamsData.data.length >= 1, 'GET /api/teams lists teams');

      // Update team
      const updateTeamRes = await fetch(`${baseUrl}/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Core AI Platform & Systems' })
      });
      const updateTeamData = await updateTeamRes.json();
      assert(updateTeamRes.status === 200 && updateTeamData.data.name === 'Core AI Platform & Systems', 'PUT /api/teams/:id updates team');
    }

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: DOCUMENTS MODULE');
    console.log('======================================================');
    let docId;
    {
      // Create document
      const docRes = await fetch(`${baseUrl}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'System Architecture Specification v3.0',
          content: 'MongoDB + Mongoose Layered Architecture specification.',
          uploadedBy: userId,
          team: teamId
        })
      });
      const docData = await docRes.json();
      assert(docRes.status === 201 && docData.success === true, 'POST /api/documents creates document');
      docId = docData.data._id;

      // Get document by ID
      const getDocRes = await fetch(`${baseUrl}/api/documents/${docId}`);
      const getDocData = await getDocRes.json();
      assert(getDocRes.status === 200 && getDocData.data.title.includes('System Architecture'), 'GET /api/documents/:id retrieves document');

      // Update document
      const updateDocRes = await fetch(`${baseUrl}/api/documents/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'System Architecture Specification v3.1' })
      });
      const updateDocData = await updateDocRes.json();
      assert(updateDocRes.status === 200 && updateDocData.data.title.includes('v3.1'), 'PUT /api/documents/:id updates document');
    }

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: TASKS MODULE & ENUMS');
    console.log('======================================================');
    let taskId;
    {
      // Invalid status enum validation
      const invalidTaskRes = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Setup Database',
          status: 'invalid_status_value',
          priority: 'high'
        })
      });
      const invalidTaskData = await invalidTaskRes.json();
      assert(invalidTaskRes.status === 400 && invalidTaskData.success === false, 'POST /api/tasks rejects invalid status enum (400)');

      // Create valid task
      const taskRes = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Refactor Mongoose Services',
          description: 'Implement layered services and controllers',
          assignedTo: userId,
          createdBy: userId,
          team: teamId,
          status: 'in-progress',
          priority: 'high',
          relatedDocument: docId
        })
      });
      const taskData = await taskRes.json();
      assert(taskRes.status === 201 && taskData.data.status === 'in-progress', 'POST /api/tasks creates task with relations');
      taskId = taskData.data._id;

      // Get tasks
      const getTasksRes = await fetch(`${baseUrl}/api/tasks?status=in-progress`);
      const getTasksData = await getTasksRes.json();
      assert(getTasksRes.status === 200 && getTasksData.data.length >= 1, 'GET /api/tasks?status=in-progress filters correctly');

      // Update task
      const updateTaskRes = await fetch(`${baseUrl}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      const updateTaskData = await updateTaskRes.json();
      assert(updateTaskRes.status === 200 && updateTaskData.data.status === 'completed', 'PUT /api/tasks/:id updates status');
    }

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: WORKFLOWS & WORKFLOW STEPS');
    console.log('======================================================');
    let workflowId;
    let stepId;
    {
      // Create workflow
      const wfRes = await fetch(`${baseUrl}/api/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sprint Deployment Pipeline',
          description: 'CI/CD and validation pipeline',
          createdBy: userId,
          team: teamId,
          status: 'active'
        })
      });
      const wfData = await wfRes.json();
      assert(wfRes.status === 201 && wfData.success === true, 'POST /api/workflows creates workflow');
      workflowId = wfData.data._id;

      // Add workflow step
      const stepRes = await fetch(`${baseUrl}/api/workflows/${workflowId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepName: 'Run Lint and Type Checking',
          stepOrder: 1,
          status: 'completed'
        })
      });
      const stepData = await stepRes.json();
      assert(stepRes.status === 201 && stepData.data.stepOrder === 1, 'POST /api/workflows/:id/steps creates step');
      stepId = stepData.data._id;

      // Get workflow steps
      const getStepsRes = await fetch(`${baseUrl}/api/workflows/${workflowId}/steps`);
      const getStepsData = await getStepsRes.json();
      assert(getStepsRes.status === 200 && getStepsData.data.length === 1, 'GET /api/workflows/:id/steps lists steps');

      // Update workflow step
      const updateStepRes = await fetch(`${baseUrl}/api/workflows/${workflowId}/steps/${stepId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepName: 'Run Lint and Automated Tests' })
      });
      const updateStepData = await updateStepRes.json();
      assert(updateStepRes.status === 200 && updateStepData.data.stepName.includes('Automated Tests'), 'PUT /api/workflows/:id/steps/:stepId updates step');
    }

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: AUDIT LOGS');
    console.log('======================================================');
    {
      const auditRes = await fetch(`${baseUrl}/api/audit-logs`);
      const auditData = await auditRes.json();
      assert(auditRes.status === 200 && auditData.success === true && auditData.data.length > 0, 'GET /api/audit-logs returns recorded CRUD actions');
      
      const firstLogId = auditData.data[0]._id;
      const singleLogRes = await fetch(`${baseUrl}/api/audit-logs/${firstLogId}`);
      const singleLogData = await singleLogRes.json();
      assert(singleLogRes.status === 200 && singleLogData.data._id === firstLogId, 'GET /api/audit-logs/:id retrieves specific audit log');
    }

    console.log('\n======================================================');
    console.log('🧪 TEST SUITE: ERROR HANDLING & INVALID OBJECTID');
    console.log('======================================================');
    {
      // Invalid ObjectId format (CastError)
      const castRes = await fetch(`${baseUrl}/api/users/not-a-valid-object-id`);
      const castData = await castRes.json();
      assert(castRes.status === 400 && castData.success === false, 'Invalid ObjectId returns 400 Bad Request');

      // Non-existing resource (valid ObjectId)
      const fakeId = new mongoose.Types.ObjectId().toString();
      const notFoundRes = await fetch(`${baseUrl}/api/users/${fakeId}`);
      const notFoundData = await notFoundRes.json();
      assert(notFoundRes.status === 404 && notFoundData.success === false, 'Non-existing resource returns 404 Not Found');

      // Route not found
      const routeNotFoundRes = await fetch(`${baseUrl}/api/completely-non-existing-route`);
      const routeNotFoundData = await routeNotFoundRes.json();
      assert(routeNotFoundRes.status === 404 && routeNotFoundData.success === false, 'Unregistered route returns 404 Route Not Found');
    }

    console.log('\n======================================================');
    console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================');

    if (failed > 0) {
      throw new Error(`${failed} tests failed!`);
    }
  } finally {
    await teardown();
  }
}

runTests().catch((err) => {
  console.error('💥 Test Suite execution error:', err);
  process.exit(1);
});
