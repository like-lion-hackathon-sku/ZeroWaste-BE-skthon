// src/biz/reviews/router/biz.reviews.router.js
import { Router } from "express";
import { authenticateAccessToken } from "../../../auth/middleware/auth.middleware.js";
import {
  handleListBizReviews,
  handleListBizReviewSummaries,
} from "../controller/reviews.controller.js";

const router = Router();
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", authenticateAccessToken, wrap(handleListBizReviews));

// ⬇️ 추가 라우트 (기존 get("/") 옆에)
router.get(
  "/:restaurantId/summaries",
  authenticateAccessToken,
  wrap(handleListBizReviewSummaries)
);
export default router;
