import { Router } from "express";
import { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers } from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router
    .route("/c/:channelId")
    .post(verifyJWT, toggleSubscription);

router.route("/u/:channelId").get(getUserChannelSubscribers);
router.route("/u").get(verifyJWT, getSubscribedChannels);

export default router