// 위치: src / biz / restaurants / router / restaurants.router.js
import { Router } from "express";
import {
  createRestaurantByBizCtrl,
  updateRestaurantByBizCtrl,
  deleteRestaurantByBizCtrl,
  listMyBizRestaurantsCtrl,
  getBizRestaurantDetailCtrl,
} from "../controller/restaurants.controller.js";
import {
  authenticateAccessToken,
  verifyUserIsActive,
} from "../../../auth/middleware/auth.middleware.js";
import {
  requireRoleBiz,
  requireOwnerOrAdmin,
} from "../../security/biz.guard.js";

const r = Router();

/* 사장님 모드 접근 제한 핸들러
 * 모든 라우트는 인증된 사용자만 접근 가능합니다.
 * AccessToken 인증과 사용자 활성화 여부를 검증합니다.
 */
r.use(authenticateAccessToken, verifyUserIsActive, requireRoleBiz);

/* 사업체 식당 등록 라우터
 * 매서드: POST
 * 엔드포인트: /api/biz/restaurants
 */
r.post("/api/biz/restaurants", createRestaurantByBizCtrl);

/* 사업체 식당 수정 라우터
 * 매서드: PUT
 * 엔드포인트: /api/biz/restaurants
 */
r.put("/api/biz/restaurants", updateRestaurantByBizCtrl);

/* 사업체 식당 삭제 라우터
 * 매서드: DELETE
 * 엔드포인트: /api/biz/restaurants
 */
r.delete("/api/biz/restaurants", deleteRestaurantByBizCtrl);

/* 사업체 식당 전체 조회 라우터
 * 매서드: GET
 * 엔드포인트: /api/biz/restaurants
 */
r.get("/api/biz/restaurants", listMyBizRestaurantsCtrl);

/* 식당 상세 조회 라우터
 * 매서드: GET
 * 엔드포인트: /api/biz/restaurants/:restaurantId
 */
r.get(
  "/api/biz/restaurants/:restaurantId",
  requireOwnerOrAdmin,
  getBizRestaurantDetailCtrl,
);
export default r;
