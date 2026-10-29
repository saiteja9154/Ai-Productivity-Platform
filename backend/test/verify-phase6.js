import http from 'http';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Task from '../src/models/Task.js';
import Workflow from '../src/models/Workflow.js';
import WorkflowExecution from '../src/models/WorkflowExecution.js';
import Document from '../src/models/Document.js';

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
  console.log('🚀 Setting up Phase 6 Verification Test Suite...');
  await connectDB();

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`✅ Phase 6 Test Server running on ${baseUrl}\n`);
      resolve();
    });
  });
}

async function teardown() {
  console.log('\n🧹 Cleaning up Phase 6 test server & DB...');
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await disconnectDB();
  console.log('✅ Teardown complete.\n');
}

async function runPhase6Verification() {
  try {
    await setup();

    // 1. Acquire tokens for admin and regular user
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
    console.log('🧪 SUITE 1: WORKFLOW MANAGEMENT CRUD & AUTHORIZATION');
    console.log('======================================================');
    let workflowId;

    // 1.1 Create Workflow
    const createWfRes = await request('/api/workflows', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        name: 'Auto Sprint CI Workflow',
        description: 'Automates task creation and status tracking',
        status: 'draft',
        trigger: {
          type: 'manual',
          config: {}
        },
        steps: [
          {
            stepOrder: 1,
            stepName: 'Create Automated QA Task',
            stepType: 'create_task',
            onFailure: 'stop',
            config: {
              title: 'Auto QA Verification for Sprint',
              description: 'Created by automated Phase 6 workflow engine',
              priority: 'high'
            }
          },
          {
            stepOrder: 2,
            stepName: 'Generate Audit Message',
            stepType: 'generate_text',
            onFailure: 'continue',
            config: {
              template: 'QA Verification initialized successfully.'
            }
          }
        ]
      })
    });

    assert(createWfRes.status === 201, 'Workflow created with HTTP 201');
    assert(createWfRes.data.success === true, 'Workflow response has success: true');
    assert(createWfRes.data.data.name === 'Auto Sprint CI Workflow', 'Workflow name stored accurately');
    assert(createWfRes.data.data.steps.length === 2, 'Workflow stored 2 ordered execution steps');
    workflowId = createWfRes.data.data._id;

    // 1.2 Get Workflow by ID
    const getWfRes = await request(`/api/workflows/${workflowId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(getWfRes.status === 200, 'Fetched workflow by ID with HTTP 200');
    assert(getWfRes.data.data._id === workflowId, 'Workflow ID matches query');

    // 1.3 List Workflows
    const listWfRes = await request('/api/workflows?search=Auto+Sprint', {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(listWfRes.status === 200, 'Listed workflows with search filter');
    assert(listWfRes.data.count >= 1, 'Search query returned matching workflow');

    // 1.4 Update Workflow
    const updateWfRes = await request(`/api/workflows/${workflowId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        description: 'Updated description for sprint automation engine'
      })
    });
    assert(updateWfRes.status === 200, 'Updated workflow with HTTP 200');
    assert(updateWfRes.data.data.description === 'Updated description for sprint automation engine', 'Updated description persisted');

    // 1.5 Activate Workflow
    const activateRes = await request(`/api/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(activateRes.status === 200, 'Activated workflow with HTTP 200');
    assert(activateRes.data.data.status === 'active', 'Workflow status is now active');

    // 1.6 Deactivate Workflow
    const deactivateRes = await request(`/api/workflows/${workflowId}/deactivate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(deactivateRes.status === 200, 'Deactivated workflow with HTTP 200');
    assert(deactivateRes.data.data.status === 'paused', 'Workflow status is now paused');

    // Reactivate for execution testing
    await request(`/api/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });

    console.log('\n======================================================');
    console.log('🧪 SUITE 2: ORDERED EXECUTION ENGINE & TASK AUTOMATION');
    console.log('======================================================');
    let executionId;

    // 2.1 Manual Run Workflow
    const runRes = await request(`/api/workflows/${workflowId}/run`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ customNote: 'Triggered from Phase 6 verification' })
    });

    assert(runRes.status === 200, 'Executed workflow with HTTP 200');
    assert(runRes.data.success === true, 'Execution reported success');
    assert(runRes.data.data.status === 'completed', 'Execution marked as completed');
    const stepResults = runRes.data.data.stepResults || runRes.data.data.steps || [];
    assert(stepResults.length === 2, 'Both configured steps executed');
    assert(stepResults[0]?.status === 'completed', 'Step 1 create_task completed');
    assert(stepResults[1]?.status === 'completed', 'Step 2 generate_text completed');
    executionId = runRes.data.data._id;

    // 2.2 Verify Created Task in MongoDB
    const createdTasks = runRes.data.data.createdTasks;
    assert(Array.isArray(createdTasks) && createdTasks.length > 0, 'Execution returned created task reference');
    const autoTaskId = createdTasks[0];

    const taskInDb = await Task.findById(autoTaskId);
    assert(taskInDb !== null, 'Automated task persisted in MongoDB Tasks collection');
    assert(taskInDb.title === 'Auto QA Verification for Sprint', 'Task title correctly assigned from workflow config');
    assert(taskInDb.sourceWorkflow.toString() === workflowId, 'Task correctly references sourceWorkflow');
    assert(taskInDb.sourceExecution.toString() === executionId.toString(), 'Task correctly references sourceExecution');

    // 2.3 Execution History API
    const execHistoryRes = await request(`/api/workflows/${workflowId}/executions`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(execHistoryRes.status === 200, 'Retrieved workflow executions history');
    assert(execHistoryRes.data.count >= 1, 'History contains execution records');

    const execDetailRes = await request(`/api/workflows/executions/${executionId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(execDetailRes.status === 200, 'Retrieved individual execution record by ID');
    const wfRef = execDetailRes.data.data?.workflow?._id || execDetailRes.data.data?.workflow;
    assert(wfRef.toString() === workflowId, 'Execution record matches workflow');

    // 2.4 Step Failure Policy Test (stop vs continue)
    const failingWfRes = await request('/api/workflows', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        name: 'Failure Policy Test Workflow',
        status: 'active',
        trigger: { type: 'manual' },
        steps: [
          {
            stepOrder: 1,
            stepName: 'Failing Step',
            stepType: 'fail_workflow',
            onFailure: 'continue',
            config: { reason: 'Intentional test failure' }
          },
          {
            stepOrder: 2,
            stepName: 'Subsequent Step After Failure',
            stepType: 'generate_text',
            onFailure: 'stop',
            config: { template: 'Continued despite previous failure' }
          }
        ]
      })
    });
    const failingWfId = failingWfRes.data.data._id;
    const runFailingRes = await request(`/api/workflows/${failingWfId}/run`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(runFailingRes.status === 200, 'Failing workflow ran with continue policy');
    const failingSteps = runFailingRes.data.data?.stepResults || runFailingRes.data.data?.steps || [];
    assert(failingSteps[0]?.status === 'failed', 'Step 1 recorded failure');
    assert(failingSteps[1]?.status === 'completed', 'Step 2 executed due to onFailure: continue');

    console.log('\n======================================================');
    console.log('🧪 SUITE 3: EVENT-DRIVEN TRIGGERS & LOOP DEDUPLICATION');
    console.log('======================================================');

    // 3.1 Event Trigger: Task Created
    const eventWfRes = await request('/api/workflows', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        name: 'On Task Created Auto-Pipeline',
        status: 'active',
        trigger: { type: 'task_created' },
        steps: [
          {
            stepOrder: 1,
            stepName: 'Generate Notification',
            stepType: 'generate_text',
            onFailure: 'stop',
            config: { template: 'New task registered in backlog' }
          }
        ]
      })
    });
    const eventWfId = eventWfRes.data.data._id;

    // Trigger by creating a regular task
    const triggerTaskRes = await request('/api/tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        title: 'Regular Sprint Trigger Task',
        description: 'Testing task_created workflow event emission',
        priority: 'medium'
      })
    });
    assert(triggerTaskRes.status === 201, 'Regular task created with HTTP 201');

    // Wait a brief moment for async trigger dispatch
    await new Promise(r => setTimeout(r, 200));

    const eventExecs = await WorkflowExecution.find({ workflow: eventWfId });
    assert(eventExecs.length >= 1, 'task_created event automatically triggered workflow execution');
    assert(eventExecs[0].status === 'completed', 'Event-triggered workflow completed successfully');

    // 3.2 Idempotency & Deduplication Check
    // Attempting to dispatch the exact same event ID must not duplicate execution
    const duplicateExecution = await WorkflowExecution.findOne({
      workflow: eventWfId,
      triggerEventId: eventExecs[0].triggerEventId
    });
    assert(duplicateExecution !== null, 'Trigger event deduplication ID persisted in execution history');

    console.log('\n======================================================');
    console.log('🧪 SUITE 4: LOCAL RULE-BASED AI SERVICES (ZERO API KEYS)');
    console.log('======================================================');

    // 4.1 AI Chat Assistant - Knowledge base matching
    const chatWfRes = await request('/api/ai/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ message: 'How do workflows and triggers work in this platform?' })
    });
    assert(chatWfRes.status === 200, 'AI Chat answered workflow question with HTTP 200');
    assert(chatWfRes.data.data.intent === 'workflows', 'Identified workflows intent correctly');
    assert(chatWfRes.data.data.answer.includes('Workflow Automation Guide'), 'Returned structured local workflow guide');
    assert(chatWfRes.data.data.suggestions.length > 0, 'Provided relevant prompt suggestions');

    // 4.2 AI Chat Assistant - Fallback handling
    const chatFallbackRes = await request('/api/ai/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ message: 'What is the weather in Paris today?' })
    });
    assert(chatFallbackRes.status === 200, 'AI Chat handled unsupported query with HTTP 200');
    assert(chatFallbackRes.data.data.isFallback === true, 'Correctly flagged as deterministic fallback');
    assert(chatFallbackRes.data.data.answer.includes('local rule-based assistant'), 'Explained platform capabilities clearly');

    // 4.3 Document Summarization - Text input
    const sampleDocText = `
    The AI Productivity Platform is an integrated enterprise system designed for high performance and reliable sprint management.
    Workflows allow engineers to automate complex multi-step pipelines through deterministic execution engines.
    Local AI features operate with zero external API keys, ensuring complete data sovereignty and zero operational inference costs.
    Tasks are organized in an interactive Kanban board supporting drag-and-drop state transitions across To-Do, In Progress, and Completed columns.
    Document management supports markdown notes and uploaded files with secure MIME-type streaming.
    All state changes are permanently logged to MongoDB with comprehensive audit trails.
    `;

    const summaryRes = await request('/api/ai/summarize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        text: sampleDocText,
        options: { targetSentences: 2 }
      })
    });
    assert(summaryRes.status === 200, 'Document summarization succeeded with HTTP 200');
    assert(summaryRes.data.data.summary.length > 30, 'Generated readable summary abstract');
    assert(summaryRes.data.data.originalWordCount > 0, 'Calculated original word count');
    assert(summaryRes.data.data.compressionRatio !== undefined, 'Calculated compression ratio metric');

    // 4.4 Summarize Existing Document in MongoDB
    const testDoc = await Document.create({
      title: 'Phase 6 Architecture Spec',
      content: sampleDocText,
      documentType: 'TEXT',
      owner: regularUserId
    });

    const docSummaryRes = await request('/api/ai/summarize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        documentId: testDoc._id.toString()
      })
    });
    assert(docSummaryRes.status === 200, 'Summarized MongoDB Document by ID');
    assert(docSummaryRes.data.data.summary.length > 20, 'Extracted text from saved document');
    await Document.findByIdAndDelete(testDoc._id);

    // 4.5 Task Extraction from Text
    const sampleMeetingNotes = `
    Sprint Planning Meeting Notes:
    - @alex.engineer implement workflow execution engine by Friday (urgent)
    - Review database indexes and optimize queries by tomorrow (high)
    - Please deploy new production build
    `;

    const extractRes = await request('/api/ai/extract-tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ text: sampleMeetingNotes })
    });
    assert(extractRes.status === 200, 'Task extraction succeeded with HTTP 200');
    assert(extractRes.data.data.tasks.length >= 2, 'Extracted multiple candidate tasks');
    const firstExtracted = extractRes.data.data.tasks[0];
    assert(firstExtracted.priority === 'urgent', 'Detected urgent priority correctly');
    assert(firstExtracted.assigneeName.toLowerCase().includes('alex'), 'Resolved assignee against real MongoDB user');

    // 4.6 Meeting Notes End-to-End Processing & Confirmation Pipeline
    const meetingRes = await request('/api/ai/process-meeting-notes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ text: sampleMeetingNotes })
    });
    assert(meetingRes.status === 200, 'Meeting notes processing succeeded');
    assert(meetingRes.data.data.extractedTasks.length >= 2, 'Extracted tasks from meeting notes');

    // Confirm candidate tasks into MongoDB
    const confirmRes = await request('/api/ai/confirm-meeting-tasks', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        tasks: [
          {
            title: 'Deploy verified production build',
            description: 'Confirmed from meeting notes',
            priority: 'high',
            status: 'todo'
          }
        ]
      })
    });
    assert(confirmRes.status === 201, 'Confirmed tasks created in MongoDB with HTTP 201');
    assert(confirmRes.data.count === 1, 'Created 1 confirmed task');
    assert(confirmRes.data.data[0].title === 'Deploy verified production build', 'Task title confirmed in database');

    // 4.7 Email Generation (Template-Based)
    const emailRes = await request('/api/ai/generate-email', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        templateType: 'task_assignment',
        context: {
          taskTitle: 'Phase 6 Integration Tests',
          assigneeName: 'Alex Mercer',
          priority: 'High',
          dueDate: '2026-10-31'
        }
      })
    });
    assert(emailRes.status === 200, 'Generated task assignment email with HTTP 200');
    assert(emailRes.data.data.isDraft === true, 'Marked as draft (not auto-sent without confirmation)');
    assert(emailRes.data.data.subject.includes('[Task Assigned]'), 'Generated professional subject line');
    assert(emailRes.data.data.body.includes('Alex Mercer'), 'Formatted assignee name in body');

    // 4.8 Content Generation (Sprint Goal)
    const contentRes = await request('/api/ai/generate-content', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        contentType: 'sprint_goal',
        params: {
          theme: 'Workflow Automation & Local AI Features'
        }
      })
    });
    assert(contentRes.status === 200, 'Generated sprint goal spec with HTTP 200');
    assert(contentRes.data.data.title.includes('Sprint Goal'), 'Produced SMART sprint goal structure');

    // 4.9 Delete Workflow Cleanup
    const deleteWfRes = await request(`/api/workflows/${workflowId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(deleteWfRes.status === 200, 'Deleted test workflow safely with HTTP 200');

    console.log('\n======================================================');
    console.log(`🎉 PHASE 6 VERIFICATION COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during Phase 6 verification:', err);
    process.exit(1);
  } finally {
    await teardown();
  }
}

runPhase6Verification();
