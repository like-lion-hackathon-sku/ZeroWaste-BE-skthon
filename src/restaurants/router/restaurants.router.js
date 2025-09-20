// 위치: src / restaurants / router / restaurans.router.js
import { Router } from "express";
import {
  searchRestaurantsCtrl,
  getRestaurantDetailCtrl,
} from "../controller/restaurants.controller.js";
import { identifyAccessToken } from "../../auth/middleware/auth.middleware.js";
import { handleGetRestaurantReviews } from "../controller/restaurant-reviews.controller.js";

const r = Router({ mergeParams: true });

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

/* 주변 식당 검색 라우터
 * 매서드: GET
 * 엔드포인트: api/restaurants/nearby
 */
r.get("/nearby", searchRestaurantsCtrl);

/* 식당 상세 조회 라우터
 * 매서드: GET
 * 엔드포인트: api/restaurants/:restaurantId/detail
 */
r.get(
  "/:restaurantId/detail",
  onlyDigits404,
  identifyAccessToken,
  getRestaurantDetailCtrl,
);

/* 식당 리뷰 조회 라우터
 * 매서드: GET
 * 엔드포인트: api/restaurants/:restaurantId/reviews
 */
r.get(
  "/:restaurantId/reviews",
  onlyDigits404,
  identifyAccessToken,
  handleGetRestaurantReviews,
);

export default r;
