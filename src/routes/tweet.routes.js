import { Router } from "express";
import { createTweet, getUserTweets, updateTweet, deleteTweet } from "../controllers/tweet.controllers.js";
import { verifyJWT, verifyTweetOwner } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/").post(verifyJWT, createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(verifyJWT, verifyTweetOwner, updateTweet)
    .delete(verifyJWT, verifyTweetOwner, deleteTweet);

export default router