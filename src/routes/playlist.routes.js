import { Router } from "express";
import { createPlaylist, getPlaylistById, updatePlaylist, deletePlaylist, addVideoToPlaylist, removeVideoFromPlaylist, getUserPlaylists } from "../controllers/playlist.controllers.js";
import { verifyJWT, verifyPlaylistOwner } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist)

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(verifyPlaylistOwner, updatePlaylist)
    .delete(verifyPlaylistOwner, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyPlaylistOwner, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyPlaylistOwner, removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router