import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose, { Schema } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user?._id;

    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"));
    }

    const subscription = await Subscription.create({
        subscriber: userId,
        channel: channelId,
    });

    const Newsubscription = await Subscription.findById(subscription._id)
    if (!Newsubscription) {
        throw new ApiError(500, "Failed to subscribe");
    }

    return res.status(200).json(new ApiResponse(200, Newsubscription, "Subscribed successfully"));
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const subscribers = await Subscription.aggregate([
        { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                        }
                    }
                ]
            }
        }, {
            $addFields: {
                subscriber: { $arrayElemAt: ["$subscriber", 0] }
            }
        }, {
            $sort: {
                createdAt: -1
            }
        }, {
            $project: {
                _id: 0,
                channel: 0,
                __v: 0
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers found successfully"));
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const channels = await Subscription.aggregate([
        { $match: { subscriber: userId } },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                        }
                    }
                ]
            }
        }, {
            $addFields: {
                channel: { $arrayElemAt: ["$channel", 0] }
            }
        }, {
            $sort: {
                createdAt: -1
            }
        }, {
            $project: {
                _id: 0,
                subscriber: 0,
                __v: 0
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, channels, "Channels found successfully"));
})

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }