"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSpecificWorkers = exports.setupScheduledJobs = void 0;
const bullmq_1 = require("bullmq");
const imageCleanupJob_1 = require("./jobs/imageCleanupJob");
const schedulingService_1 = require("./services/schedulingService");
// This file will now only contain specific worker definitions if needed, or be removed if all workers are in index.ts
// For now, keeping it to define the scheduledPostsWorker if it's distinct from the main workers in index.ts
const scheduledPostsWorker = new bullmq_1.Worker('scheduledPosts', (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    if (job.name === 'publishPost') {
        yield (0, schedulingService_1.processScheduledPosts)(job.data);
    }
}), {
    connection: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') },
});
const setupScheduledJobs = () => {
    console.log('Setting up scheduled jobs...');
    (0, imageCleanupJob_1.scheduleImageCleanup)();
};
exports.setupScheduledJobs = setupScheduledJobs;
const startSpecificWorkers = () => {
    console.log('Starting specific queue workers...');
    scheduledPostsWorker.on('completed', job => {
        console.log(`Job ${job.id} has completed!`);
    });
    scheduledPostsWorker.on('failed', (job, err) => {
        console.log(`Job ${job === null || job === void 0 ? void 0 : job.id} has failed with ${err.message}`);
    });
};
exports.startSpecificWorkers = startSpecificWorkers;
