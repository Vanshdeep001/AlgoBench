const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19796.c245.us-east-1-3.ec2.cloud.redislabs.com',
        port: 19796
    }
});

module.exports = redisClient;