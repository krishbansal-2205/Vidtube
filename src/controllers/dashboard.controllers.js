import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    try {
        const totalVideos = await Video.countDocuments({ owner: userId });
        const totalSubscribers = await Subscription.countDocuments({ channel: userId });
        const totalVideoViews = await Video.aggregate([
            {
                $match: {
                    owner: userId
                }
            }, {
                $group: {
                    _id: null,
                    totalViews: {
                        $sum: "$views"
                    }
                }
            }
        ]);

        const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });
        const totalVideoLikes = await Like.countDocuments({ video: { $in: videos.map(video => video._id) } });

        return res.status(200).json(new ApiResponse(200, { totalVideos, totalSubscribers, totalVideoViews, totalVideoLikes }, "Channel stats found successfully"));
    } catch (error) {
        console.log("Error getting channel stats", error);
        throw new ApiError(500, "Failed to get channel stats");
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    try {
        const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 }).select("-owner");

        return res.status(200).json(new ApiResponse(200, videos, "Channel videos found successfully"));
    } catch (error) {
        console.log("Error getting channel videos", error);
        throw new ApiError(500, "Failed to get channel videos");
    }
})

export {
    getChannelStats,
    getChannelVideos
}