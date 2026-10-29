/**
 * Lightweight In-App Workflow Scheduler
 * 
 * Manages scheduled workflows without requiring Redis, BullMQ, or external services.
 * Safe across application restarts with interval checking and deduplication.
 */

import Workflow from '../models/Workflow.js';
import { executeWorkflow } from './workflowEngine.js';

let schedulerInterval = null;
const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

export const startScheduler = () => {
  if (schedulerInterval) {
    return;
  }

  console.log('⏰ Workflow In-App Scheduler started (checking every 60s)...');

  schedulerInterval = setInterval(async () => {
    try {
      await pollAndRunScheduledWorkflows();
    } catch (err) {
      console.error('Workflow scheduler polling error:', err.message);
    }
  }, CHECK_INTERVAL_MS);

  // Unref so process doesn't block exit
  if (schedulerInterval.unref) {
    schedulerInterval.unref();
  }
};

export const stopScheduler = () => {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏰ Workflow In-App Scheduler stopped.');
  }
};

export const pollAndRunScheduledWorkflows = async () => {
  const scheduledWorkflows = await Workflow.find({
    status: 'active',
    'trigger.type': 'scheduled'
  });

  const now = Date.now();

  for (const wf of scheduledWorkflows) {
    const intervalMinutes = Math.max(parseInt(wf.trigger?.config?.intervalMinutes, 10) || 60, 1);
    const intervalMs = intervalMinutes * 60 * 1000;
    const lastRunTime = wf.executionStats?.lastRunAt ? new Date(wf.executionStats.lastRunAt).getTime() : 0;

    if (now - lastRunTime >= intervalMs) {
      const scheduledEventId = `scheduled:${wf._id}:${Math.floor(now / intervalMs)}`;
      try {
        await executeWorkflow(
          wf._id,
          {
            triggerType: 'scheduled',
            triggerEventId: scheduledEventId,
            payload: { scheduledAt: new Date(now) }
          },
          wf.createdBy
        );
      } catch (err) {
        console.error(`Error running scheduled workflow "${wf.name}":`, err.message);
      }
    }
  }
};

export default {
  startScheduler,
  stopScheduler,
  pollAndRunScheduledWorkflows
};
