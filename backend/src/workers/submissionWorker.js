const { Worker } = require('bullmq');
const { workerConnection } = require('../config/queueRedis');
const { QUEUE_NAME } = require('../services/execution/submissionQueue');
const { judgeSubmission, markSubmissionFailed } = require('../services/execution/executionService');

// Processes queued submissions. Runs in-process with the API by default
// (started from index.js), or standalone via: node src/workers/submissionWorker.js
const startWorker = () => {
    const worker = new Worker(
        QUEUE_NAME,
        async (job) => {
            await judgeSubmission(job.data.submissionId);
        },
        {
            connection: workerConnection(),
            concurrency: parseInt(process.env.JUDGE_CONCURRENCY || '2', 10),
            // Throttle to stay inside the hosted Judge0 quota. Note: the limit is
            // per job (= one submission = one batch of hidden test cases).
            limiter: {
                max: parseInt(process.env.JUDGE0_JOBS_PER_MINUTE || '30', 10),
                duration: 60000
            }
        }
    );

    worker.on('failed', (job, err) => {
        console.error(`Submission job ${job?.id} failed:`, err.message);
        if (job && job.attemptsMade >= (job.opts.attempts || 1)) {
            markSubmissionFailed(job.data.submissionId, 'Judging failed: ' + err.message)
                .catch((e) => console.error('Failed to mark submission as failed:', e.message));
        }
    });
    // Connection retries fire this repeatedly when Redis is down — log each
    // distinct message at most once per minute instead of spamming.
    let lastErrorMsg = null;
    let lastErrorAt = 0;
    worker.on('error', (err) => {
        const now = Date.now();
        if (err.message !== lastErrorMsg || now - lastErrorAt > 60000) {
            console.error('Submission worker error:', err.message);
            lastErrorMsg = err.message;
            lastErrorAt = now;
        }
    });

    console.log('Submission worker started (queue: ' + QUEUE_NAME + ')');
    return worker;
};

module.exports = { startWorker };

if (require.main === module) {
    require('dotenv').config();
    const main = require('../config/db');
    main()
        .then(() => {
            console.log('MongoDB connected (worker)');
            startWorker();
        })
        .catch((err) => {
            console.error('Worker startup error:', err);
            process.exit(1);
        });
}
