import type { NestWorkerOptions } from '@nestjs/bullmq/dist/interfaces/worker-options.interface';
import type { JobsOptions } from 'bullmq';

export const YtdlQueueConfig: {
  queueName: string;
  worker: NestWorkerOptions;
  jobOpts: JobsOptions;
} = {
  queueName: 'ytdl',
  worker: {
    concurrency: 4,
  },
  jobOpts: {
    // Jobs can linger in queue for much longer, this does not - for example, set a timer to clean a completed job after an hour
    // but simply performs the cleanup when new events occur - jobs added, for example
    // I could play with this and periodically trigger cleanup https://docs.nestjs.com/techniques/task-scheduling
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // or keep up to 1000 jobs
    },
    removeOnFail: {
      age: 48 * 3600, // keep up to 48 hours
      count: 1000, // or keep up to 1000 jobs
    },
  },
};
