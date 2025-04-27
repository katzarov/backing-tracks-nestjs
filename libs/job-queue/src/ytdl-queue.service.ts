import { randomUUID } from 'node:crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { JobState, JobType } from 'bullmq';
import { YtdlQueueConfig } from './ytdl-queue.config';
import {
  YtdlJob,
  YtdlJobData,
  YtdlJobFormatted,
  YtdlJobProgress,
  YtdlQueue,
} from './ytdl-queue.interface';

@Injectable()
export class YtdlQueueService {
  constructor(
    @InjectQueue(YtdlQueueConfig.queueName)
    private ytdlQueue: YtdlQueue,
  ) {}

  private getJobId() {
    return { jobId: randomUUID() };
  }

  private isJobBelongsToUser(userId: number, job: YtdlJob) {
    return userId === job.data.userId;
  }

  private formatJobData(
    job: YtdlJob,
    jobState: JobState | 'unknown',
  ): YtdlJobFormatted {
    return {
      name: job.name,
      id: job.id,
      data: job.data,
      state: jobState,
      // TODO do patch package to fix the types of the lib.. ts module augmentation would not work in this case
      // TODO ideally bullmq exposes this as a generic.. should do it myself.. easy first issue
      progress: job.progress as YtdlJobProgress, // see above todos
      returnvalue: job.returnvalue,
      timestamp: job.timestamp,
      finishedOn: job.finishedOn,
      // processedOn: job.processedOn,
      // failedReason: job.failedReason,
      // stacktrace: job.stacktrace,
    };
  }

  async addYtdlJob(jobData: YtdlJobData) {
    const addedJob = await this.ytdlQueue.add('yt_download', jobData, {
      ...YtdlQueueConfig.jobOpts,
      ...this.getJobId(),
    });

    return addedJob;
  }

  // TODO err handle all of these and where it is consumed as well
  async getJobById(jobId: string) {
    const job = await this.ytdlQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const jobState = await job.getState();
    const formattedJob = this.formatJobData(job, jobState);

    return formattedJob;
  }

  async getAllJobsOfUser(userId: number) {
    const jobStates: JobType[] = ['active', 'waiting', 'completed', 'failed'];

    const jobs = await this.ytdlQueue.getJobs(jobStates);

    const count = {
      active: 0,
      waiting: 0,
      failed: 0,
    };

    // this is not scalable, but since this is just a v1 and for v2 we are going to be using SQS + whatever else is necessary to build a job queue on AWS, I will let this slide.
    const jobsOfUserPromise = jobs
      .filter((job) => this.isJobBelongsToUser(userId, job))
      .map(async (job) => {
        const jobState = await job.getState();

        if (jobState === 'active') {
          count.active++;
        } else if (jobState === 'waiting') {
          count.waiting++;
        } else if (jobState === 'failed') {
          count.failed++;
        }

        // TODO remove user ID from job state when sending to client
        return this.formatJobData(job, jobState);
      });

    const jobsOfUser = await Promise.all(jobsOfUserPromise);

    return { jobs: jobsOfUser, count };
  }
}
