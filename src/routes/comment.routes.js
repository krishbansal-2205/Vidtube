import { Router } from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/c/:commentId").patch(verifyJWT, updateComment).delete(verifyJWT, deleteComment);
router.route("/:videoId").get(getVideoComments).post(verifyJWT, addComment);

export default router