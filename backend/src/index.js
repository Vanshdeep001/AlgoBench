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
const videoRouter = require("./routes/videoCreator");
const userProfileRouter = require("./routes/userProfile");
const userHeatmapRouter = require("./routes/userHeatmap");
const userAcceptanceRouter = require("./routes/userAcceptance");
const communityRouter = require("./routes/community");
const contestRouter = require("./routes/contests");
const adminContestRouter = require("./routes/adminContests");
const cors = require('cors')

// console.log("Hello")

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/user', userProfileRouter);
app.use('/user', userHeatmapRouter);
app.use('/user', userAcceptanceRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use("/video", videoRouter);
app.use('/community', communityRouter);
app.use('/contest', contestRouter);
app.use('/admin/contests', adminContestRouter);


const InitalizeConnection = async () => {
    try {
        await main();
        console.log("MongoDB connected");

        try {
            await redisClient.connect();
            console.log("Redis connected");
        } catch (redisErr) {
            console.warn("Redis connection failed (server will run without Redis):", redisErr.message);
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

