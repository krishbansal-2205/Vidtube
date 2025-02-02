import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.models.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user?._id;

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    });

    const createdPlaylist = await Playlist.findById(playlist?._id);
    if (!createdPlaylist) {
        throw new ApiError(500, "Failed to create playlist");
    }

    return res.status(200).json(new ApiResponse(200, createdPlaylist, "Playlist created successfully"));
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists found successfully"));
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            createdAt: 1,
                            views: 1
                        }
                    }
                ]
            }
        }, {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
                owner: { $arrayElemAt: ["$owner", 0] }
            }
        }
    ])


    return res.status(200).json(new ApiResponse(200, playlist[0], "Playlist found successfully"));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const playlist = await Playlist.findByIdAndUpdate(req.playlist?._id, {
        $addToSet: { videos: videoId }
    }, { new: true });

    if (!playlist) {
        throw new ApiError(500, "Failed to add video to playlist");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const playlist = await Playlist.findByIdAndUpdate(req.playlist?._id, {
        $pull: { videos: videoId }
    }, { new: true });

    if (!playlist) {
        throw new ApiError(500, "Failed to remove video from playlist");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
})

const deletePlaylist = asyncHandler(async (req, res) => {
    await Playlist.findByIdAndDelete(req.playlist?._id);
    return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.findByIdAndUpdate(req.playlist?._id, {
        $set: {
            name,
            description
        }
    }, { new: true });

    if (!playlist) {
        throw new ApiError(500, "Failed to update playlist");
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));
})

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist }