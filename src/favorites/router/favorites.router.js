import { Router } from "express";
import {
  upsertFavorite,
  removeFavoriteById,
  listMyFavoritesCtrl,
} from "../controller/favorites.controller.js";
import {
  authenticateAccessToken,
  verifyUserIsActive,
} from "../../auth/middleware/auth.middleware.js";

const r = Router();

/* 즐겨찾기 접근 제한 핸들러
 * 모든 라우트는 인증된 사용자만 접근 가능합니다.
 * AccessToken 인증과 사용자 활성화 여부를 검증합니다.
 */
r.use(authenticateAccessToken, verifyUserIsActive);

/* restaurantId 파라미터 검증 미들웨어
 * restaurantId가 숫자가 아닐경우 404 반환
 */
function onlyDigits404(req, res, next) {
  const { restaurantId } = req.params;
  if (restaurantId !== undefined && !/^\d+$/.test(String(restaurantId))) {
    return res
      .status(404)
      .json({ resultType: "FAILURE", error: "NOT_FOUND", success: null });
  }
  next();
}

/* 즐겨찾기 목록 조회
 * GET /api/favorites
 */
r.get("/", authenticateAccessToken, verifyUserIsActive, listMyFavoritesCtrl);

/* 즐겨찾기 추가
 * POST /api/favorites
 */
r.post("/", upsertFavorite);

/* 즐겨찾기 삭제
 * DELETE /api/favorites/:restaurantId
 */
r.delete("/:restaurantId", onlyDigits404, removeFavoriteById);

export default r;
