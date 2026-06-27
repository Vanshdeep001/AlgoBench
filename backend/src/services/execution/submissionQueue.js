const { Queue } = require('bullmq');
const { producerConnection } = require('../../config/queueRedis');

const QUEUE_NAME = 'submissions';

let queue = null;

const getQueue = () => {
    if (!queue) {
        queue = new Queue(QUEUE_NAME, {
            connection: producerConnection(),
            defaultJobOptions: {
                attempts: 2,
                backoff: { type: 'exponential', delay: 2000 },
                removeOnComplete: 100,
                removeOnFail: 200
            }
        });
        queue.on('error', (err) => {
            console.error('Submission queue error:', err.message);
        });
    }
    return queue;
};

const ENQUEUE_TIMEOUT_MS = 2000;

// Throws if Redis is unreachable (fast), so the caller can fall back to inline judging.
const enqueueSubmission = async (submissionId) => {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('enqueue timed out')), ENQUEUE_TIMEOUT_MS);
    });
    try {
        await Promise.race([
            getQueue().add('judge', { submissionId: String(submissionId) }),
            timeout
        ]);
    } finally {
        clearTimeout(timer);
    }
};

module.exports = { QUEUE_NAME, getQueue, enqueueSubmission };
