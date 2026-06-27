// Connection options for BullMQ (which uses ioredis internally).
// Kept separate from config/redis.js, which is a node-redis client used for
// caching and rate limiting. Both point at the same Redis instance.

const base = () => ({
    host: process.env.REDIS_HOST || 'redis-13547.c301.ap-south-1-1.ec2.cloud.redislabs.com',
    port: parseInt(process.env.REDIS_PORT || '13547', 10),
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASS
});

// Back off up to 30s between reconnect attempts when Redis is unreachable.
const retryStrategy = (times) => Math.min(times * 1000, 30000);

// Producer (Queue.add): fail fast when Redis is down so the controller can
// fall back to inline judging instead of hanging.
const producerConnection = () => ({
    ...base(),
    enableOfflineQueue: false,
    maxRetriesPerRequest: 2,
    retryStrategy
});

// Worker: BullMQ requires maxRetriesPerRequest: null for blocking commands.
const workerConnection = () => ({
    ...base(),
    maxRetriesPerRequest: null,
    retryStrategy
});

module.exports = { producerConnection, workerConnection };
