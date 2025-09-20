// router
import { Router } from "express";
import {
  searchRestaurantsCtrl,
  getRestaurantDetailCtrl,
  handleGetRestaurantReviews,
} from "../controller/restaurants.controller.js";
import { identifyAccessToken } from "../../auth/middleware/auth.middleware.js";

const r = Router({ mergeParams: true });

function onlyDigits404(req, res, next) {
  const { restaurantId } = req.params;
  if (restaurantId !== undefined && !/^\d+$/.test(String(restaurantId))) {
    return res
      .status(404)
      .json({ resultType: "FAILURE", error: "NOT_FOUND", success: null });
  }
  next();
}

/** DB 기준 식당 목록 조회 */
r.get("/nearby", searchRestaurantsCtrl);

/** DB 기준 식당 상세 조회 */
r.get(
  "/:restaurantId/detail",
  onlyDigits404,
  identifyAccessToken,
  getRestaurantDetailCtrl,
);

/** 리뷰 조회 */
r.get(
  "/:restaurantId/reviews",
  onlyDigits404,
  identifyAccessToken,
  handleGetRestaurantReviews,
);

export default r;
