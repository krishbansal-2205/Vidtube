import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controllers.js";
import { verifyJWT, verifyOwner } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/").get(getAllVideos);
router.route("/publish").post(verifyJWT,
    upload.fields([{ name: "videoFile", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]),
    publishAVideo);

router.route("/:videoId").get(verifyJWT, getVideoById);
router.route("/:videoId").patch(verifyJWT, verifyOwner, upload.single("thumbnail"), updateVideo);
router.route("/:videoId").delete(verifyJWT, verifyOwner, deleteVideo);

router.route("/toggle-publish/:videoId").patch(verifyJWT, verifyOwner, togglePublishStatus);

export default router;