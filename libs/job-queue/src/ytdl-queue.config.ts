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
