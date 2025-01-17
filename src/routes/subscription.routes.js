import { Router } from "express";
import { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers } from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router
    .route("/c/:channelId")
    .get(verifyJWT, getSubscribedChannels)
    .post(verifyJWT, toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router