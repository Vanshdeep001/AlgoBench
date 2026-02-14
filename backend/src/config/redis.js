const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19796.c245.us-east-1-3.ec2.cloud.redislabs.com',
        port: 19796,
        reconnectStrategy: (retries) => {
            if (retries > 20) return new Error('Redis max retries reached');
            return Math.min(retries * 200, 3000);
        }
    }
});

// Prevent Redis connection errors from crashing the Node process
redisClient.on('error', (err) => {
    console.error('Redis client error:', err.message);
});
redisClient.on('reconnecting', () => {
    console.log('Redis reconnecting...');
});
redisClient.on('end', () => {
    console.warn('Redis connection closed');
});

module.exports = redisClient;