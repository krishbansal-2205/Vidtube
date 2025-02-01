import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user?._id;

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, "Video unliked successfully"));
    }

    const like = await Like.create({
        video: videoId,
        likedBy: userId,
    });

    const createdLike = await Like.findById(like?._id)
    if (!createdLike) {
        throw new ApiError(500, "Failed to like video");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video liked successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user?._id;

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, "Comment unliked successfully"));
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: userId,
    });

    const createdLike = await Like.findById(like?._id)
    if (!createdLike) {
        throw new ApiError(500, "Failed to like comment");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Comment liked successfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user?._id;

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, 'Tweet unliked successfully'));
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: userId
    });

    const createdLike = await Like.findById(like?._id);
    if (!createdLike) {
        throw new ApiError(500, 'Failed to like tweet');
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Tweet liked successfully'));
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const videos = await Like.aggregate([
        { $match: { likedBy: userId }, video: { $exists: true } },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    { $match: { isPublished: true } },
                    {
                        $project: {
                            videoFile: 1,
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            views: 1,
                            isPublished: 1,
                            createdAt: 1,
                            updatedAt: 1,
                        }
                    }
                ]
            }
        }, {
            $project: {
                video: { $first: "$video" },
                _id: 0,
                __v: 0,
                likedBy: 0
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
})

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos }