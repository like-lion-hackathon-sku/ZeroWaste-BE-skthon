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

/**
 * @swagger
 * /api/restaurants/nearby:
 *   get:
 *     tags: [Restaurants]
 *     summary: 주변 식당 검색
 *     description: 지도의 bbox(경계 영역)과 카테고리, 페이지 정보를 기준으로 식당 목록을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: bbox
 *         required: true
 *         schema: { type: string }
 *         description: '검색 영역 (예: "126.97,37.56,126.99,37.58" = minX,minY,maxX,maxY)'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [KOREAN, JAPANESE, CHINESE, WESTERN, FASTFOOD, CAFE, ETC]
 *         description: 식당 카테고리(선택)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: 주변 식당 목록
 */
r.get("/nearby", searchRestaurantsCtrl);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/detail:
 *   get:
 *     tags: [Restaurants]
 *     summary: 식당 상세 조회
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema: { type: integer }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 식당 상세 정보
 */
r.get(
  "/:restaurantId/detail",
  onlyDigits404,
  identifyAccessToken,
  getRestaurantDetailCtrl,
);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/reviews:
 *   get:
 *     tags: [Restaurants]
 *     summary: 식당 리뷰 목록 조회
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [LATEST, HIGH_SCORE, LOW_SCORE]
 *           default: LATEST
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 리뷰 목록
 */
r.get(
  "/:restaurantId/reviews",
  onlyDigits404,
  identifyAccessToken,
  handleGetRestaurantReviews,
);

export default r;
