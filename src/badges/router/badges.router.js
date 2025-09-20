import { Router } from "express";
import { authenticateAccessToken } from "../../auth/middleware/auth.middleware.js";
import {
  handleListBadges,
  handleListMyBadges,
} from "../controller/badges.controller.js";

const router = Router();

/**
 * 전체 배지 목록
 * GET /badges?type=USER|RESTAURANT&page=1&size=20
 * - 공개 엔드포인트 (인증 불필요)
 */
router.get("/", handleListBadges);

/**
 * 내 배지 목록
 * GET /badges/me?page=1&size=20
 * - 보호 엔드포인트 (인증 필요)
 * - auth.middleware에서 req.user.id 세팅됨
 */
router.get("/me", authenticateAccessToken, handleListMyBadges);

export default router;
