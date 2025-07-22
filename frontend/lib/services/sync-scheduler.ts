import * as cron from 'node-cron';
import { gocardlessApiService } from './gocardless-api';
import { prisma } from '@/lib/database/client';

interface SyncJob {
  id: string;
  name: string;
  schedule: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  task?: cron.ScheduledTask;
}

export class SyncScheduler {
  private jobs: Map<string, SyncJob> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeDefaultJobs();
  }

  private initializeDefaultJobs() {
    if (this.isInitialized) return;

    // Daily sync at 6 AM
    this.addJob({
      id: 'daily-sync',
      name: 'Daily GoCardless Sync',
      schedule: '0 6 * * *', // Every day at 6:00 AM
      isActive: true,
    });

    // Hourly sync during business hours (9 AM - 6 PM on weekdays)
    this.addJob({
      id: 'business-hours-sync',
      name: 'Business Hours Sync',
      schedule: '0 9-18 * * 1-5', // Every hour from 9 AM to 6 PM, Monday to Friday
      isActive: false, // Disabled by default, can be enabled in production
    });

    // Weekly full sync on Sunday
    this.addJob({
      id: 'weekly-full-sync',
      name: 'Weekly Full Sync',
      schedule: '0 2 * * 0', // Every Sunday at 2:00 AM
      isActive: true,
    });

    this.isInitialized = true;
  }

  addJob(jobConfig: Omit<SyncJob, 'task' | 'nextRun'>) {
    const job: SyncJob = {
      ...jobConfig,
      nextRun: this.getNextRunTime(jobConfig.schedule),
    };

    if (job.isActive) {
      job.task = cron.schedule(job.schedule, async () => {
        await this.executeSyncJob(job.id);
      }, {
        scheduled: true,
        timezone: 'Europe/Lisbon', // Portugal timezone
      });
    }

    this.jobs.set(job.id, job);
    console.log(`📅 Sync job '${job.name}' ${job.isActive ? 'scheduled' : 'created'} with pattern: ${job.schedule}`);
  }

  private getNextRunTime(schedule: string): Date {
    try {
      const task = cron.schedule(schedule, () => {}, { scheduled: false });
      // This is a simplified implementation - in production you'd use a proper cron parser
      const now = new Date();
      now.setHours(now.getHours() + 1); // Approximate next run
      return now;
    } catch {
      return new Date();
    }
  }

  private async executeSyncJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    console.log(`🔄 Starting sync job: ${job.name}`);
    job.lastRun = new Date();

    try {
      // Determine sync parameters based on job type
      let dateFrom: string | undefined;
      let dateTo: string | undefined;

      switch (jobId) {
        case 'daily-sync':
          // Sync last 2 days to catch any delayed transactions
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          dateFrom = twoDaysAgo.toISOString().split('T')[0];
          break;

        case 'business-hours-sync':
          // Sync just today for frequent updates
          dateFrom = new Date().toISOString().split('T')[0];
          break;

        case 'weekly-full-sync':
          // Sync last 30 days for comprehensive update
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          dateFrom = thirtyDaysAgo.toISOString().split('T')[0];
          break;
      }

      const result = await gocardlessApiService.syncAllAccounts(dateFrom, dateTo);

      // Log sync results
      await this.logSyncResult(jobId, result);

      console.log(`✅ Sync job '${job.name}' completed:`, {
        created: result.created,
        updated: result.updated,
        accounts: result.accountsProcessed,
        errors: result.errors.length,
      });

      // Update next run time
      job.nextRun = this.getNextRunTime(job.schedule);

    } catch (error) {
      console.error(`❌ Sync job '${job.name}' failed:`, error);
      
      // Log error
      await this.logSyncError(jobId, error);
    }
  }

  private async logSyncResult(jobId: string, result: any) {
    try {
      // Create an audit log entry for the sync
      await prisma.auditLog.create({
        data: {
          tableName: 'sync_jobs',
          recordId: jobId,
          action: 'SYNC_COMPLETED',
          newValues: {
            ...result,
            timestamp: new Date(),
            jobId,
          },
        },
      });
    } catch (error) {
      console.error('Failed to log sync result:', error);
    }
  }

  private async logSyncError(jobId: string, error: any) {
    try {
      await prisma.auditLog.create({
        data: {
          tableName: 'sync_jobs',
          recordId: jobId,
          action: 'SYNC_ERROR',
          newValues: {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            jobId,
          },
        },
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }
  }

  startJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.task) {
      job.task.start();
      job.isActive = true;
      console.log(`▶️ Started sync job: ${job.name}`);
    }
  }

  stopJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.task) {
      job.task.stop();
      job.isActive = false;
      console.log(`⏸️ Stopped sync job: ${job.name}`);
    }
  }

  removeJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (job?.task) {
      job.task.destroy();
    }
    this.jobs.delete(jobId);
    console.log(`🗑️ Removed sync job: ${jobId}`);
  }

  getJobStatus(jobId: string): SyncJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): SyncJob[] {
    return Array.from(this.jobs.values()).map(job => ({
      ...job,
      task: undefined, // Don't expose the task object
    }));
  }

  async triggerManualSync(jobId?: string): Promise<any> {
    if (jobId) {
      await this.executeSyncJob(jobId);
    } else {
      // Trigger a manual sync similar to daily-sync
      const result = await gocardlessApiService.syncAllAccounts();
      await this.logSyncResult('manual-sync', result);
      return result;
    }
  }

  // Get sync statistics
  async getSyncStatistics(days = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const syncLogs = await prisma.auditLog.findMany({
        where: {
          tableName: 'sync_jobs',
          action: { in: ['SYNC_COMPLETED', 'SYNC_ERROR'] },
          timestamp: { gte: since },
        },
        orderBy: { timestamp: 'desc' },
      });

      const completed = syncLogs.filter(log => log.action === 'SYNC_COMPLETED');
      const errors = syncLogs.filter(log => log.action === 'SYNC_ERROR');

      const totalCreated = completed.reduce((sum, log) => {
        const values = log.newValues as any;
        return sum + (values?.created || 0);
      }, 0);

      const totalUpdated = completed.reduce((sum, log) => {
        const values = log.newValues as any;
        return sum + (values?.updated || 0);
      }, 0);

      return {
        period: { days, since },
        totalSyncs: syncLogs.length,
        successfulSyncs: completed.length,
        failedSyncs: errors.length,
        successRate: syncLogs.length > 0 ? (completed.length / syncLogs.length) * 100 : 0,
        totalTransactionsCreated: totalCreated,
        totalTransactionsUpdated: totalUpdated,
        lastSync: syncLogs[0]?.timestamp || null,
        recentErrors: errors.slice(0, 5).map(log => ({
          timestamp: log.timestamp,
          error: (log.newValues as any)?.error,
          jobId: (log.newValues as any)?.jobId,
        })),
      };
    } catch (error) {
      console.error('Error getting sync statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const syncScheduler = new SyncScheduler();