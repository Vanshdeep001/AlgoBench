const express = require('express')
const app = express();
require('dotenv').config();
const main = require('./config/db')
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit")
const aiRouter = require("./routes/aiChatting")
const userProfileRouter = require("./routes/userProfile");
const communityRouter = require("./routes/community");
const contestRouter = require("./routes/contests");
const adminContestRouter = require("./routes/adminContests");
const noteRouter = require("./routes/note");
const cors = require('cors')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const paymentRouter = require('../payments/payment');

// Trigger Nodemon Restart - 1
// console.log("Hello")

app.use(cors({
    // origin: 'api.algobench.site', // AWS deployment origin (commented out for local dev)
    origin: 'http://localhost:5173', // Local development origin
    credentials: true
}))

// Security headers (CSP, X-Frame-Options, HSTS, nosniff, etc.)
app.use(helmet());

// Prevent NoSQL injection ($gt, $where, etc. stripped from req.body/query)
const sanitizeObject = (obj) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else if (obj[key] instanceof Object) {
                sanitizeObject(obj[key]);
            }
        }
    }
};
app.use((req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
});

// Global rate limiter — 100 requests per 15 min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/user', userProfileRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/community', communityRouter);
app.use('/contest', contestRouter);
app.use('/admin/contests', adminContestRouter);
app.use('/note', noteRouter);
app.use('/payment', paymentRouter);


const InitalizeConnection = async () => {
    try {
        await main();
        console.log("MongoDB connected");

        // Pre-warm the problem list / companies caches so the first Problems
        // page load is instant instead of waiting on a ~2s query.
        try {
            const { warmProblemCaches } = require('./controllers/userProblem');
            warmProblemCaches().then(() => console.log('Problem caches warmed'));
        } catch (e) {
            console.warn('Could not warm problem caches:', e.message);
        }

        try {
            await redisClient.connect();
            console.log("Redis connected");
        } catch (redisErr) {
            console.warn("Redis connection failed (server will run without Redis):", redisErr.message);
        }

        // Start the submission judging worker in-process (set START_WORKER=false
        // to run it as a separate process: node src/workers/submissionWorker.js)
        if (process.env.START_WORKER !== 'false') {
            try {
                const { startWorker } = require('./workers/submissionWorker');
                startWorker();
            } catch (workerErr) {
                console.warn("Submission worker failed to start (submissions will be judged inline):", workerErr.message);
            }
        }

        app.listen(process.env.PORT, () => {
            console.log("Server listening at port number: " + process.env.PORT);
        }).on('error', (err) => {
            if (err.code === 'ECONNRESET') {
                console.warn("Server connection reset - client may have disconnected");
            } else {
                console.error("Server error:", err);
            }
        });

    } catch (err) {
        console.error("Startup error:", err);
        process.exit(1);
    }
};

InitalizeConnection();

