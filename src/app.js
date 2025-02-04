import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_RIGIN,
        credentials: true
    })
)

//common middleware
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))

app.use(cookieParser());

//import routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);

app.use((err, req, res, next) => {
    console.error("Error Middleware Caught:", err);

    // Check if the error is an instance of ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: err.data,
            errors: err.errors
        });
    }

    // Default error response
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});
export { app }