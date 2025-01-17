import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const comments = await Comment.find({ video: videoId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select("-video -_id")
            .populate({
                path: "owner",
                select: "username"
            });

        const totalComments = await Comment.countDocuments({ video: videoId });

        return res.status(200).json(new ApiResponse(200, { comments, totalComments }, "Comments found successfully"));
    } catch (error) {
        console.log("Error getting comments", error);
        throw new ApiError(500, "Failed to get comments");
    }
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const owner = req.user?._id;

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    try {
        const comment = await Comment.create({
            content,
            video: videoId,
            owner
        });

        const createdComment = await Comment.findById(comment?._id)
        if (!createdComment) {
            throw new ApiError(500, "Failed to add comment");
        }

        return res.status(200).json(new ApiResponse(200, createdComment, "Comment added successfully"));
    } catch (error) {
        console.log("Error adding comment", error);
        throw new ApiError(500, "Failed to add comment");
    }
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Content is required");
    }

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        if (comment.owner.toString() !== req.user?._id) {
            throw new ApiError(403, "Access denied");
        }
        comment.content = content;
        await comment.save();

        return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
    } catch (error) {
        console.log("Error updating comment", error);
        throw new ApiError(500, "Failed to update comment");
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    try {
        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        if (comment.owner.toString() !== req.user?._id) {
            throw new ApiError(403, "Access denied");
        }

        await Comment.findByIdAndDelete(comment._id);

        return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
    } catch (error) {
        console.log("Error deleting comment", error);
        throw new ApiError(500, "Failed to delete comment");
    }
})

export { getVideoComments, addComment, updateComment, deleteComment }