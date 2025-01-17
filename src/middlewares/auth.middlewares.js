import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import { Playlist } from "../models/playlist.models.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new ApiError(401, "Unauthorized");
    }
    try {
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodeToken._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized user");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized user");
    }
})

const verifyOwner = asyncHandler(async (req, _, next) => {
    const loggedInUserId = req.user?._id;
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    // console.log(loggedInUserId);     both are of objectId format
    // console.log(video.owner);        can compare directly
    if (video.owner.toString() !== loggedInUserId.toString()) {
        throw new ApiError(403, "Access denied");
    }

    req.video = video;
    next();
})

const verifyTweetOwner = asyncHandler(async (req, _, next) => {
    const loggedInUserId = req.user?._id;
    const { tweetId } = req.params;
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    // console.log(loggedInUserId);     both are of objectId format
    // console.log(video.owner);        can compare directly
    if (tweet.owner.toString() !== loggedInUserId.toString()) {
        throw new ApiError(403, "Access denied");
    }

    req.tweet = tweet;
    next();
})

const verifyPlaylistOwner = asyncHandler(async (req, _, next) => {
    const loggedInUserId = req.user?._id;
    const { playlistId } = req.params;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    // console.log(loggedInUserId);     both are of objectId format
    // console.log(video.owner);        can compare directly
    if (playlist.owner.toString() !== loggedInUserId.toString()) {
        throw new ApiError(403, "Access denied");
    }

    req.playlist = playlist;
    next();
})

export { verifyJWT, verifyOwner, verifyTweetOwner, verifyPlaylistOwner };