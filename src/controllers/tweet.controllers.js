import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const owner = req.user?._id;
    if (!owner) {
        throw new ApiError(401, "Unauthorized user");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    try {
        const tweet = await Tweet.create({
            content,
            owner
        });

        const createdTweet = await Tweet.aggregate([
            { $match: { _id: tweet._id } },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                fullName: 1,
                                email: 1
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    owner: { $first: "$owner" }
                }
            }
        ])
        if (!createdTweet) {
            throw new ApiError(500, "Failed to create tweet");
        }

        return res.status(201).json(new ApiResponse(201, createdTweet[0], "Tweet created successfully"));
    } catch (error) {
        console.log("Error creating tweet", error);
        throw new ApiError(500, "Failed to create tweet");
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 })
        .select("-owner -_id");
    

    return res.status(200).json(new ApiResponse(200, tweets, "Tweets found successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const tweet = await Tweet.findByIdAndUpdate(req.tweet?._id, {
        $set: {
            content
        }
    }, { new: true });

    return res.status(200).json(new ApiResponse(200, tweet.content, "Tweet updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    await Tweet.findByIdAndDelete(req.tweet?._id);
    return res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
})

export { createTweet, getUserTweets, updateTweet, deleteTweet }