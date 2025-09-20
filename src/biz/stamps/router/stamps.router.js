import express from "express";
import {
  verifyUserIsActive,
  authenticateAccessToken,
} from "../../../auth/middleware/auth.middleware.js";
import { handleVerifyStamps } from "../controller/stamps.controller.js";

const router = express.Router({ mergeParams: true });

router.post(
  "/use",
  authenticateAccessToken,
  verifyUserIsActive,
  handleVerifyStamps
);

export default router;
