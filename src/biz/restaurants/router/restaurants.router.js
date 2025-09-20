// src/biz/restaurants/router/restaurants.router.js
import { Router } from "express";
import {
  createRestaurantByBizCtrl,
  updateRestaurantByBizCtrl,
  deleteRestaurantByBizCtrl,
  listMyBizRestaurantsCtrl,
  getBizRestaurantDetailCtrl,
  searchRestaurantCandidatesCtrl,
} from "../controller/restaurants.controller.js";
import {
  authenticateAccessToken,
  verifyUserIsActive,
} from "../../../auth/middleware/auth.middleware.js";
import { requireRoleBiz } from "../../security/biz.guard.js";

const r = Router();
r.use(authenticateAccessToken, verifyUserIsActive);

/**
 * @swagger
 * /api/biz/restaurants/search:
 *   get:
 *     tags:
 *       - BizRestaurants
 *     summary: 사업체 식당 후보 검색 (네이버 API)
 *     description: 네이버 로컬 검색을 이용해 식당 후보를 가져옵니다.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 7
 *         description: 최대 검색 개수(1~30)
 *     responses:
 *       200:
 *         description: 검색 성공
 */
r.get("/restaurants/search", searchRestaurantCandidatesCtrl);

/**
 * @swagger
 * /api/biz/restaurants:
 *   post:
 *     tags:
 *       - BizRestaurants
 *     summary: 사업체 식당 등록
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 example: "테스트 식당"
 *               address:
 *                 type: string
 *                 example: "서울특별시 어딘가 1-2"
 *               telephone:
 *                 type: string
 *                 example: "02-1234-5678"
 *               mapx:
 *                 type: integer
 *                 example: 1270123456
 *               mapy:
 *                 type: integer
 *                 example: 375987654
 *               category:
 *                 type: string
 *                 enum: [KOREAN, JAPANESE, CHINESE, WESTERN, FASTFOOD, CAFE, ETC]
 *                 example: KOREAN
 *     responses:
 *       201:
 *         description: 등록 성공
 */
r.post("/restaurants", createRestaurantByBizCtrl);

/**
 * @swagger
 * /api/biz/restaurants:
 *   put:
 *     tags:
 *       - BizRestaurants
 *     summary: 사업체 식당 수정
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 수정할 식당 ID
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               telephone:
 *                 type: string
 *               mapx:
 *                 type: integer
 *               mapy:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: 수정 성공
 */
r.put("/restaurants", updateRestaurantByBizCtrl);

/**
 * @swagger
 * /api/biz/restaurants:
 *   delete:
 *     tags:
 *       - BizRestaurants
 *     summary: 사업체 식당 삭제
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: integer
 *                 description: 삭제할 식당 ID
 *     responses:
 *       200:
 *         description: 삭제 성공
 */
r.delete("/restaurants", deleteRestaurantByBizCtrl);

/**
 * @swagger
 * /api/biz/restaurants:
 *   get:
 *     tags:
 *       - BizRestaurants
 *     summary: 내 사업체 식당 목록 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 조회 성공
 */
r.get("/restaurants", listMyBizRestaurantsCtrl);

/**
 * @swagger
 * /api/biz/restaurants/{restaurantId}:
 *   get:
 *     tags:
 *       - BizRestaurants
 *     summary: 사업체 식당 상세 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조회할 식당 ID
 *     responses:
 *       200:
 *         description: 조회 성공
 *       404:
 *         description: 식당 없음
 */
r.get("/restaurants/:restaurantId", getBizRestaurantDetailCtrl);

export default r;
