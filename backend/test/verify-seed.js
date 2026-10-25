import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Team from '../src/models/Team.js';
import Document from '../src/models/Document.js';
import Task from '../src/models/Task.js';
import Workflow from '../src/models/Workflow.js';
import WorkflowStep from '../src/models/WorkflowStep.js';
import AuditLog from '../src/models/AuditLog.js';
import { seedDatabase, DEMO_PASSWORD } from '../src/scripts/seed.js';
import { loginUser } from '../src/services/authService.js';

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

async function runVerification() {
  console.log('\n======================================================');
  console.log('🧪 MASTER PROMPT 3: VERIFICATION SUITE');
  console.log('======================================================\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Production safety check
    // -------------------------------------------------------------
    console.log('--- 1. Production Protection Check ---');
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    let prodBlocked = false;
    try {
      await seedDatabase({ quiet: true });
    } catch (e) {
      prodBlocked = true;
    }
    process.env.NODE_ENV = originalNodeEnv || 'development';
    assert(prodBlocked === true, 'Seeding is rejected when NODE_ENV=production');

    // -------------------------------------------------------------
    // Test 2: Connect to local MongoDB
    // -------------------------------------------------------------
    console.log('\n--- 2. Database Connection & Environment Verification ---');
    await connectDB();
    assert(mongoose.connection.readyState === 1, 'Mongoose connection readyState is 1 (Connected)');
    assert(mongoose.connection.name === 'ai_productivity_platform', `Connected to intended database: "${mongoose.connection.name}"`);
    assert(mongoose.connection.host === '127.0.0.1' || mongoose.connection.host === 'localhost', `Connected to expected host: ${mongoose.connection.host}`);

    // -------------------------------------------------------------
    // Test 3: Record counts in database
    // -------------------------------------------------------------
    console.log('\n--- 3. Seeded Collection Counts ---');
    const teamCount = await Team.countDocuments();
    const userCount = await User.countDocuments();
    const docCount = await Document.countDocuments();
    const taskCount = await Task.countDocuments();
    const workflowCount = await Workflow.countDocuments();
    const stepCount = await WorkflowStep.countDocuments();
    const auditCount = await AuditLog.countDocuments();

    assert(teamCount >= 3, `Teams collection populated (found: ${teamCount})`);
    assert(userCount >= 5, `Users collection populated (found: ${userCount})`);
    assert(docCount >= 3, `Documents collection populated (found: ${docCount})`);
    assert(taskCount >= 4, `Tasks collection populated (found: ${taskCount})`);
    assert(workflowCount >= 2, `Workflows collection populated (found: ${workflowCount})`);
    assert(stepCount >= 7, `WorkflowSteps collection populated (found: ${stepCount})`);
    assert(auditCount >= 2, `AuditLogs collection populated (found: ${auditCount})`);

    // -------------------------------------------------------------
    // Test 4: Password Hashing Verification
    // -------------------------------------------------------------
    console.log('\n--- 4. Password Hashing & Authentication Verification ---');
    const demoAdmin = await User.findOne({ email: 'admin@productivity.local' }).select('+password');
    assert(demoAdmin !== null, 'Dev Admin user exists');
    assert(demoAdmin.password !== DEMO_PASSWORD, 'User password is NOT stored as plaintext');
    assert(demoAdmin.password.startsWith('$2a$') || demoAdmin.password.startsWith('$2b$'), 'User password is a valid bcrypt hash');
    
    const isPasswordValid = await demoAdmin.comparePassword(DEMO_PASSWORD);
    assert(isPasswordValid === true, 'bcrypt comparePassword successfully verifies demo password');

    // Test auth service login with seeded credentials
    const loginResult = await loginUser({
      email: 'admin@productivity.local',
      password: DEMO_PASSWORD
    });
    assert(typeof loginResult.token === 'string' && loginResult.token.length > 0, 'authService.loginUser successfully returns JWT for demo admin');
    assert(loginResult.user.email === 'admin@productivity.local', 'authService returns correct user profile');
    assert(loginResult.user.password === undefined, 'authService does NOT leak password');

    // -------------------------------------------------------------
    // Test 5: Reference Integrity
    // -------------------------------------------------------------
    console.log('\n--- 5. Referential Integrity Verification ---');
    // Check Teams -> createdBy User
    const engTeam = await Team.findOne({ name: 'Engineering Core' }).populate('createdBy');
    assert(engTeam && engTeam.createdBy && engTeam.createdBy.email === 'admin@productivity.local', 'Team.createdBy references valid User');

    // Check Users -> team Team
    const alexUser = await User.findOne({ email: 'alex.engineer@productivity.local' }).populate('team');
    assert(alexUser && alexUser.team && alexUser.team.name === 'Engineering Core', 'User.team references valid Team');

    // Check Documents -> team and uploadedBy
    const archDoc = await Document.findOne({ title: 'AI Platform Architecture & Schema Overview' })
      .populate('team')
      .populate('uploadedBy');
    assert(archDoc && archDoc.team && archDoc.team.name === 'Engineering Core', 'Document.team references valid Team');
    assert(archDoc && archDoc.uploadedBy && archDoc.uploadedBy.email === 'admin@productivity.local', 'Document.uploadedBy references valid User');

    // Check Tasks -> assignedTo, createdBy, team, relatedDocument
    const indexingTask = await Task.findOne({ title: 'Implement MongoDB Indexing and Performance Benchmarks' })
      .populate('team')
      .populate('assignedTo')
      .populate('createdBy')
      .populate('relatedDocument');
    assert(indexingTask && indexingTask.team && indexingTask.team.name === 'Engineering Core', 'Task.team references valid Team');
    assert(indexingTask && indexingTask.assignedTo && indexingTask.assignedTo.email === 'alex.engineer@productivity.local', 'Task.assignedTo references valid User');
    assert(indexingTask && indexingTask.createdBy && indexingTask.createdBy.email === 'admin@productivity.local', 'Task.createdBy references valid User');
    assert(indexingTask && indexingTask.relatedDocument && indexingTask.relatedDocument.title === 'AI Platform Architecture & Schema Overview', 'Task.relatedDocument references valid Document');

    // Check Workflows -> WorkflowSteps
    const docWorkflow = await Workflow.findOne({ name: 'Document Ingestion & Analysis Workflow' }).populate('team');
    assert(docWorkflow && docWorkflow.team && docWorkflow.team.name === 'AI Research & Systems', 'Workflow.team references valid Team');
    const steps = await WorkflowStep.find({ workflow: docWorkflow._id }).sort({ stepOrder: 1 });
    assert(steps.length === 4, `Workflow has 4 correctly linked steps (found: ${steps.length})`);
    assert(steps[0].stepOrder === 1 && steps[0].stepName === 'Parse Document Text and Metadata', 'WorkflowStep 1 has valid stepOrder and name');

    // -------------------------------------------------------------
    // Test 6: Idempotent Execution Check (Re-running seed)
    // -------------------------------------------------------------
    console.log('\n--- 6. Idempotency Check (Duplicate Prevention) ---');
    await disconnectDB();

    const summaryRun2 = await seedDatabase({ quiet: true });
    assert(summaryRun2.teams.inserted === 0, 'Re-run inserted 0 duplicate teams');
    assert(summaryRun2.users.inserted === 0, 'Re-run inserted 0 duplicate users');
    assert(summaryRun2.documents.inserted === 0, 'Re-run inserted 0 duplicate documents');
    assert(summaryRun2.tasks.inserted === 0, 'Re-run inserted 0 duplicate tasks');
    assert(summaryRun2.workflows.inserted === 0, 'Re-run inserted 0 duplicate workflows');
    assert(summaryRun2.workflowSteps.inserted === 0, 'Re-run inserted 0 duplicate workflow steps');

    assert(summaryRun2.teams.total === teamCount, `Total team count unchanged (${summaryRun2.teams.total})`);
    assert(summaryRun2.users.total === userCount, `Total user count unchanged (${summaryRun2.users.total})`);
    assert(summaryRun2.documents.total === docCount, `Total document count unchanged (${summaryRun2.documents.total})`);
    assert(summaryRun2.tasks.total === taskCount, `Total task count unchanged (${summaryRun2.tasks.total})`);
    assert(summaryRun2.workflows.total === workflowCount, `Total workflow count unchanged (${summaryRun2.workflows.total})`);

    console.log('\n======================================================');
    console.log(`📊 MASTER PROMPT 3 VERIFICATION: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Verification failed with exception:', err);
    process.exit(1);
  }
}

runVerification();
