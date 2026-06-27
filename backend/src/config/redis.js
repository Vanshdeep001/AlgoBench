const { createClient } = require('redis');

const redisClient = createClient({
    username: process.env.REDIS_USER || 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST || 'redis-13547.c301.ap-south-1-1.ec2.cloud.redislabs.com',
        port: parseInt(process.env.REDIS_PORT || '13547', 10),
        reconnectStrategy: (retries) => {
            if (retries > 3) return new Error('Redis max retries reached'); // Reduced from 20 for local dev
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