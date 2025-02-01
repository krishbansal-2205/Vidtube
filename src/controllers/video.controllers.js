import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { User } from "../models/user.models.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const filter = { isPublished: true };
    if (query) {
        filter.title = { $regex: query, $options: 'i' }; // Case-insensitive search
    }
    if (userId) {
        filter.owner = userId;
    }

    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = sortType === 'asc' ? 1 : -1;
    }

    try {
        const videos = await Video.find(filter)
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalVideos = await Video.countDocuments(filter);

        if (!videos.length) {
            return res.status(404).json(new ApiError(404, "No videos found"));
        }

        return res.status(200).json(
            new ApiResponse(200, { videos, total: totalVideos }, "Videos retrieved successfully")
        );
    } catch (error) {
        console.error("Error fetching videos:", error);
        if (!(error instanceof ApiError)) {
            throw new ApiError(500, "Failed to fetch videos");
        }
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, duration } = req.body;
    const owner = req.user?._id;
    if (!owner) {
        throw new ApiError(401, "Unauthorized user");
    }
    const videoFilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;
    if (!videoFilePath || !thumbnailPath) {
        throw new ApiError(400, "Video file and thumbnail are required");
    }
    if ([title, description, duration].some((field => !field?.trim()))) {
        fs.unlinkSync(videoFilePath);
        fs.unlinkSync(thumbnailPath);
        throw new ApiError(400, "All fields are required");
    }

    let videoFile;
    try {
        videoFile = await uploadOnCloudinary(videoFilePath);
    } catch (error) {
        console.log("Error uploading video", error);
        throw new ApiError(500, "Failed to upload video");
    }
    let thumbnail;
    try {
        thumbnail = await uploadOnCloudinary(thumbnailPath);
    } catch (error) {
        console.log("Error uploading thumbnail", error);
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    try {
        const video = new Video({
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            title,
            description,
            duration,
            owner
        })

        await video.save();

        const createdVideo = await Video.findById(video._id)
        if (!createdVideo) {
            throw new ApiError(500, "Failed to create video");
        }

        return res.status(201).json(new ApiResponse(201, createdVideo, "Video created successfully"));
    } catch (error) {
        console.log("Error creating video", error);
        if (videoFile) await deleteFromCloudinary(videoFile.public_id);
        if (thumbnail) await deleteFromCloudinary(thumbnail.public_id);
        throw new ApiError(500, "Failed to create video");
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    // const videoIdObject = new mongoose.Types.ObjectId(videoId);
    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: { watchHistory: videoId }
    }, { new: true });
    const video = await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    }, { new: true });
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res.status(200).json(new ApiResponse(200, video, "Video found successfully"));
})

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const thumbnailPath = req.file?.path;
    if (!thumbnailPath) {
        throw new ApiError(400, "Thumbnail is required");
    }
    if (!title || !description) {
        throw new ApiError(400, "Title and description are required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    if (!thumbnail.url) {
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const video = await Video.findByIdAndUpdate(req.video?._id, {
        $set: {
            title,
            description,
            thumbnail: thumbnail.url
        }
    }, { new: true });

    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
})

const deleteVideo = asyncHandler(async (req, res) => {
    await Video.findByIdAndDelete(req.video?._id);
    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const video = await Video.findByIdAndUpdate(req.video?._id, {
        $set: {
            isPublished: !req.video?.isPublished
        }
    }, { new: true });
    return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }