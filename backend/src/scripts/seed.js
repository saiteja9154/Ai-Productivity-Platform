import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDB, disconnectDB, sanitizeMongoUri } from '../config/db.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Document from '../models/Document.js';
import Task from '../models/Task.js';
import Workflow from '../models/Workflow.js';
import WorkflowStep from '../models/WorkflowStep.js';
import AuditLog from '../models/AuditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

// Standard demo password for all seeded demo users
export const DEMO_PASSWORD = 'Password123!';

/**
 * Seed data definitions
 */
const SEED_DATA = {
  teams: [
    {
      name: 'Engineering Core',
      description: 'Core infrastructure, platform services, API gateways, and distributed databases.'
    },
    {
      name: 'AI Research & Systems',
      description: 'LLM orchestration, agentic pipelines, RAG indexing, and vector embedding services.'
    },
    {
      name: 'Product & UX Design',
      description: 'User experience research, design system components, and product prototyping.'
    }
  ],

  users: [
    {
      name: 'Dev Admin',
      email: 'admin@productivity.local',
      role: 'admin',
      teamName: 'Engineering Core',
      isActive: true
    },
    {
      name: 'Sarah Product Lead',
      email: 'sarah.manager@productivity.local',
      role: 'manager',
      teamName: 'AI Research & Systems',
      isActive: true
    },
    {
      name: 'Alex Engineer',
      email: 'alex.engineer@productivity.local',
      role: 'member',
      teamName: 'Engineering Core',
      isActive: true
    },
    {
      name: 'Jordan Designer',
      email: 'jordan.designer@productivity.local',
      role: 'member',
      teamName: 'Product & UX Design',
      isActive: true
    },
    {
      name: 'Taylor Contributor',
      email: 'taylor.user@productivity.local',
      role: 'user',
      teamName: 'Product & UX Design',
      isActive: true
    }
  ],

  documents: [
    {
      title: 'AI Platform Architecture & Schema Overview',
      content: 'Comprehensive architectural overview detailing backend microservices, Mongoose models (User, Team, Document, Task, Workflow, WorkflowStep, AuditLog), authentication flows, and RBAC strategies.',
      teamName: 'Engineering Core',
      uploaderEmail: 'admin@productivity.local',
      fileUrl: 'https://storage.productivity.local/docs/arch-overview-v1.pdf'
    },
    {
      title: 'Q3 AI Workflow Automation Strategy',
      content: 'Strategic roadmap for implementing event-driven agentic workflows, multi-step LLM reasoning, document summarization triggers, and automatic task generation.',
      teamName: 'AI Research & Systems',
      uploaderEmail: 'sarah.manager@productivity.local',
      fileUrl: 'https://storage.productivity.local/docs/ai-roadmap-q3.pdf'
    },
    {
      title: 'Design System Guidelines v2.0',
      content: 'Design specifications for UI tokens, color palettes, dark mode theming, typography hierarchy, and reusable accessible components across web applications.',
      teamName: 'Product & UX Design',
      uploaderEmail: 'jordan.designer@productivity.local',
      fileUrl: 'https://storage.productivity.local/docs/design-system-v2.pdf'
    }
  ],

  tasks: [
    {
      title: 'Implement MongoDB Indexing and Performance Benchmarks',
      description: 'Audit query plans, verify compound indexes on Task and Workflow collections, and ensure sub-10ms response times for paginated queries.',
      teamName: 'Engineering Core',
      assignedToEmail: 'alex.engineer@productivity.local',
      createdByEmail: 'admin@productivity.local',
      documentTitle: 'AI Platform Architecture & Schema Overview',
      status: 'in-progress',
      priority: 'high',
      dueDaysOffset: 7
    },
    {
      title: 'Deploy Document Parsing Pipeline for RAG Indexing',
      description: 'Connect chunking service to generate document embeddings and sync with vector database upon new document creation.',
      teamName: 'AI Research & Systems',
      assignedToEmail: 'sarah.manager@productivity.local',
      createdByEmail: 'admin@productivity.local',
      documentTitle: 'Q3 AI Workflow Automation Strategy',
      status: 'pending',
      priority: 'high',
      dueDaysOffset: 14
    },
    {
      title: 'Audit Design System Accessibility and Contrast',
      description: 'Review all primary, secondary, and badge color tokens to satisfy WCAG 2.1 AA standards across light and dark modes.',
      teamName: 'Product & UX Design',
      assignedToEmail: 'jordan.designer@productivity.local',
      createdByEmail: 'sarah.manager@productivity.local',
      documentTitle: 'Design System Guidelines v2.0',
      status: 'completed',
      priority: 'medium',
      dueDaysOffset: -1
    },
    {
      title: 'Set Up Health Check Monitoring and Uptime Alerting',
      description: 'Configure Prometheus metrics and automated alerts on MongoDB ping latency and HTTP 5xx error spikes.',
      teamName: 'Engineering Core',
      assignedToEmail: 'alex.engineer@productivity.local',
      createdByEmail: 'admin@productivity.local',
      documentTitle: null,
      status: 'pending',
      priority: 'low',
      dueDaysOffset: 21
    }
  ],

  workflows: [
    {
      name: 'Document Ingestion & Analysis Workflow',
      description: 'Automated multi-stage processing pipeline for incoming enterprise documentation.',
      teamName: 'AI Research & Systems',
      createdByEmail: 'sarah.manager@productivity.local',
      status: 'active',
      steps: [
        { stepName: 'Parse Document Text and Metadata', stepOrder: 1, status: 'completed' },
        { stepName: 'Extract Entities and Action Items', stepOrder: 2, status: 'in-progress' },
        { stepName: 'Generate Vector Embeddings', stepOrder: 3, status: 'pending' },
        { stepName: 'Create Assigned Follow-up Tasks', stepOrder: 4, status: 'pending' }
      ]
    },
    {
      name: 'Team Member Onboarding Procedure',
      description: 'Standardized workspace provisioning and security clearance workflow for new hires.',
      teamName: 'Engineering Core',
      createdByEmail: 'admin@productivity.local',
      status: 'active',
      steps: [
        { stepName: 'Create Directory Identity and RBAC Role', stepOrder: 1, status: 'completed' },
        { stepName: 'Provision Team Workspace and Repositories', stepOrder: 2, status: 'completed' },
        { stepName: 'Assign Initial Sprint Tasks and Mentorship Pair', stepOrder: 3, status: 'in-progress' }
      ]
    }
  ]
};

/**
 * Main seeding execution function.
 * Uses idempotent upsert / find-and-update patterns to ensure running multiple
 * times creates zero duplicate records and preserves existing data.
 */
export async function seedDatabase(options = {}) {
  const { quiet = false } = options;
  const log = (...args) => {
    if (!quiet) console.log(...args);
  };

  // 1. Production Safeguard
  if (process.env.NODE_ENV === 'production') {
    const errorMsg = '❌ SEEDING ABORTED: Seeding is strictly forbidden in production (NODE_ENV=production).';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  log('🌱 Starting Database Seeding Process...');

  // 2. Connect to MongoDB using standard backend configuration
  await connectDB();
  const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_productivity_platform';
  log(`📡 Connected to Database: [${mongoose.connection.name}] on host [${mongoose.connection.host}]`);
  log(`🔒 Connection URI: ${sanitizeMongoUri(rawUri)}`);

  const summary = {
    teams: { inserted: 0, updated: 0, total: 0 },
    users: { inserted: 0, updated: 0, total: 0 },
    documents: { inserted: 0, updated: 0, total: 0 },
    tasks: { inserted: 0, updated: 0, total: 0 },
    workflows: { inserted: 0, updated: 0, total: 0 },
    workflowSteps: { inserted: 0, updated: 0, total: 0 },
    auditLogs: { inserted: 0, updated: 0, total: 0 }
  };

  try {
    // -------------------------------------------------------------
    // Step A: Seed Teams (Initial pass without createdBy)
    // -------------------------------------------------------------
    log('\n🏢 [1/6] Seeding Teams...');
    const teamMap = new Map();

    for (const teamDef of SEED_DATA.teams) {
      let team = await Team.findOne({ name: teamDef.name });
      if (!team) {
        team = await Team.create({
          name: teamDef.name,
          description: teamDef.description,
          createdBy: null
        });
        summary.teams.inserted++;
        log(`  + Created Team: "${team.name}" (ID: ${team._id})`);
      } else {
        team.description = teamDef.description;
        await team.save();
        summary.teams.updated++;
        log(`  ~ Updated existing Team: "${team.name}" (ID: ${team._id})`);
      }
      teamMap.set(team.name, team);
    }

    // -------------------------------------------------------------
    // Step B: Seed Users
    // -------------------------------------------------------------
    log('\n👤 [2/6] Seeding Demo Users...');
    const userMap = new Map();

    for (const userDef of SEED_DATA.users) {
      const team = teamMap.get(userDef.teamName);
      let user = await User.findOne({ email: userDef.email.toLowerCase() });

      if (!user) {
        // Create new user (password will be hashed via pre-save hook)
        user = new User({
          name: userDef.name,
          email: userDef.email.toLowerCase(),
          password: DEMO_PASSWORD,
          role: userDef.role,
          isActive: userDef.isActive,
          team: team ? team._id : null
        });
        await user.save();
        summary.users.inserted++;
        log(`  + Created User: "${user.name}" <${user.email}> (Role: ${user.role})`);
      } else {
        // User exists: update details and ensure password matches DEMO_PASSWORD
        user.name = userDef.name;
        user.role = userDef.role;
        user.isActive = userDef.isActive;
        user.team = team ? team._id : null;

        const isMatch = await user.comparePassword(DEMO_PASSWORD);
        if (!isMatch) {
          // Setting plain text password will trigger bcrypt pre-save hash
          user.password = DEMO_PASSWORD;
        }
        await user.save();
        summary.users.updated++;
        log(`  ~ Updated existing User: "${user.name}" <${user.email}> (Role: ${user.role})`);
      }
      userMap.set(user.email.toLowerCase(), user);
    }

    // Associate Team createdBy with admin user
    const adminUser = userMap.get('admin@productivity.local');
    if (adminUser) {
      for (const [name, team] of teamMap.entries()) {
        if (!team.createdBy || team.createdBy.toString() !== adminUser._id.toString()) {
          team.createdBy = adminUser._id;
          await team.save();
        }
      }
    }

    // -------------------------------------------------------------
    // Step C: Seed Documents
    // -------------------------------------------------------------
    log('\n📄 [3/6] Seeding Documents...');
    const docMap = new Map();

    for (const docDef of SEED_DATA.documents) {
      const team = teamMap.get(docDef.teamName);
      const uploader = userMap.get(docDef.uploaderEmail.toLowerCase());

      let document = await Document.findOne({
        title: docDef.title,
        team: team ? team._id : null
      });

      if (!document) {
        document = await Document.create({
          title: docDef.title,
          content: docDef.content,
          fileUrl: docDef.fileUrl,
          team: team ? team._id : null,
          uploadedBy: uploader ? uploader._id : null
        });
        summary.documents.inserted++;
        log(`  + Created Document: "${document.title}" (Team: ${docDef.teamName})`);
      } else {
        document.content = docDef.content;
        document.fileUrl = docDef.fileUrl;
        document.uploadedBy = uploader ? uploader._id : null;
        await document.save();
        summary.documents.updated++;
        log(`  ~ Updated existing Document: "${document.title}"`);
      }
      docMap.set(document.title, document);
    }

    // -------------------------------------------------------------
    // Step D: Seed Tasks
    // -------------------------------------------------------------
    log('\n✅ [4/6] Seeding Tasks...');
    const taskMap = new Map();

    for (const taskDef of SEED_DATA.tasks) {
      const team = teamMap.get(taskDef.teamName);
      const assignee = userMap.get(taskDef.assignedToEmail.toLowerCase());
      const creator = userMap.get(taskDef.createdByEmail.toLowerCase());
      const relatedDoc = taskDef.documentTitle ? docMap.get(taskDef.documentTitle) : null;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + taskDef.dueDaysOffset);

      let task = await Task.findOne({
        title: taskDef.title,
        team: team ? team._id : null
      });

      if (!task) {
        task = await Task.create({
          title: taskDef.title,
          description: taskDef.description,
          status: taskDef.status,
          priority: taskDef.priority,
          dueDate,
          team: team ? team._id : null,
          assignedTo: assignee ? assignee._id : null,
          createdBy: creator ? creator._id : null,
          relatedDocument: relatedDoc ? relatedDoc._id : null
        });
        summary.tasks.inserted++;
        log(`  + Created Task: "${task.title}" [Status: ${task.status}, Priority: ${task.priority}]`);
      } else {
        task.description = taskDef.description;
        task.status = taskDef.status;
        task.priority = taskDef.priority;
        task.dueDate = dueDate;
        task.assignedTo = assignee ? assignee._id : null;
        task.createdBy = creator ? creator._id : null;
        task.relatedDocument = relatedDoc ? relatedDoc._id : null;
        await task.save();
        summary.tasks.updated++;
        log(`  ~ Updated existing Task: "${task.title}"`);
      }
      taskMap.set(task.title, task);
    }

    // -------------------------------------------------------------
    // Step E: Seed Workflows & WorkflowSteps
    // -------------------------------------------------------------
    log('\n🔄 [5/6] Seeding Workflows & Steps...');
    for (const wfDef of SEED_DATA.workflows) {
      const team = teamMap.get(wfDef.teamName);
      const creator = userMap.get(wfDef.createdByEmail.toLowerCase());

      let workflow = await Workflow.findOne({
        name: wfDef.name,
        team: team ? team._id : null
      });

      if (!workflow) {
        workflow = await Workflow.create({
          name: wfDef.name,
          description: wfDef.description,
          status: wfDef.status,
          team: team ? team._id : null,
          createdBy: creator ? creator._id : null
        });
        summary.workflows.inserted++;
        log(`  + Created Workflow: "${workflow.name}" (Status: ${workflow.status})`);
      } else {
        workflow.description = wfDef.description;
        workflow.status = wfDef.status;
        workflow.createdBy = creator ? creator._id : null;
        await workflow.save();
        summary.workflows.updated++;
        log(`  ~ Updated existing Workflow: "${workflow.name}"`);
      }

      // Upsert individual workflow steps
      for (const stepDef of wfDef.steps) {
        let step = await WorkflowStep.findOne({
          workflow: workflow._id,
          stepOrder: stepDef.stepOrder
        });

        if (!step) {
          step = await WorkflowStep.create({
            workflow: workflow._id,
            stepName: stepDef.stepName,
            stepOrder: stepDef.stepOrder,
            status: stepDef.status
          });
          summary.workflowSteps.inserted++;
          log(`    + Created Step ${step.stepOrder}: "${step.stepName}" [${step.status}]`);
        } else {
          step.stepName = stepDef.stepName;
          step.status = stepDef.status;
          await step.save();
          summary.workflowSteps.updated++;
          log(`    ~ Updated Step ${step.stepOrder}: "${step.stepName}" [${step.status}]`);
        }
      }
    }

    // -------------------------------------------------------------
    // Step F: Seed Audit Logs (Idempotent seed marker records)
    // -------------------------------------------------------------
    log('\n📜 [6/6] Seeding Audit Logs...');
    const auditEntries = [
      {
        user: adminUser ? adminUser._id : null,
        action: 'SYSTEM_SEED_INITIALIZED',
        entityType: 'User',
        entityId: adminUser ? adminUser._id : new mongoose.Types.ObjectId(),
        details: { environment: process.env.NODE_ENV || 'development', version: '1.0.0' }
      },
      {
        user: adminUser ? adminUser._id : null,
        action: 'TEAMS_PROVISIONED',
        entityType: 'Team',
        entityId: teamMap.get('Engineering Core')?._id || new mongoose.Types.ObjectId(),
        details: { count: SEED_DATA.teams.length }
      }
    ];

    for (const logDef of auditEntries) {
      const existingLog = await AuditLog.findOne({
        action: logDef.action,
        entityType: logDef.entityType,
        entityId: logDef.entityId
      });

      if (!existingLog) {
        await AuditLog.create(logDef);
        summary.auditLogs.inserted++;
        log(`  + Created AuditLog: [${logDef.action}] on ${logDef.entityType}`);
      } else {
        summary.auditLogs.updated++;
        log(`  ~ Retained existing AuditLog: [${logDef.action}]`);
      }
    }

    // -------------------------------------------------------------
    // Calculate final database collection counts
    // -------------------------------------------------------------
    summary.teams.total = await Team.countDocuments();
    summary.users.total = await User.countDocuments();
    summary.documents.total = await Document.countDocuments();
    summary.tasks.total = await Task.countDocuments();
    summary.workflows.total = await Workflow.countDocuments();
    summary.workflowSteps.total = await WorkflowStep.countDocuments();
    summary.auditLogs.total = await AuditLog.countDocuments();

    log('\n=============================================================');
    log('🎉 SEEDING COMPLETED SUCCESSFULLY');
    log('=============================================================');
    log(`  Teams:          ${summary.teams.inserted} created, ${summary.teams.updated} retained/updated (Total: ${summary.teams.total})`);
    log(`  Users:          ${summary.users.inserted} created, ${summary.users.updated} retained/updated (Total: ${summary.users.total})`);
    log(`  Documents:      ${summary.documents.inserted} created, ${summary.documents.updated} retained/updated (Total: ${summary.documents.total})`);
    log(`  Tasks:          ${summary.tasks.inserted} created, ${summary.tasks.updated} retained/updated (Total: ${summary.tasks.total})`);
    log(`  Workflows:      ${summary.workflows.inserted} created, ${summary.workflows.updated} retained/updated (Total: ${summary.workflows.total})`);
    log(`  Workflow Steps: ${summary.workflowSteps.inserted} created, ${summary.workflowSteps.updated} retained/updated (Total: ${summary.workflowSteps.total})`);
    log(`  Audit Logs:     ${summary.auditLogs.inserted} created, ${summary.auditLogs.updated} retained/updated (Total: ${summary.auditLogs.total})`);
    log('=============================================================');
    log(`🔑 Default password for demo users: "${DEMO_PASSWORD}"`);
    log('=============================================================\n');

    return summary;
  } catch (error) {
    console.error('\n❌ SEEDING FAILED WITH ERROR:', error.message);
    throw error;
  } finally {
    // 3. Gracefully disconnect database
    await disconnectDB();
  }
}

// Execute directly if run as a CLI script
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMainModule) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
