import express from "express";
import {
  handleGetAllStamps,
  handleGetStampHistories,
  handleUseStamp,
} from "../controller/stamps.controller.js";
import {
  authenticateAccessToken,
  verifyUserIsActive,
} from "../../auth/middleware/auth.middleware.js";

const router = express.Router({ mergeParams: true });

router.get(
  "/me",
  authenticateAccessToken,
  verifyUserIsActive,
  handleGetAllStamps
);
router.post(
  "/me/use",
  authenticateAccessToken,
  verifyUserIsActive,
  handleUseStamp
);

router.get(
  "/me/history",
  authenticateAccessToken,
  verifyUserIsActive,
  handleGetStampHistories
);

export default router;
