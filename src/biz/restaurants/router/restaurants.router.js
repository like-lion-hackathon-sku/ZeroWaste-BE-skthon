import express from "express";
import {
  authenticateAccessToken,
  verifyUserIsActive,
} from "../../../auth/middleware/auth.middleware.js";
import {
  handleRegisterRestaurant,
  handleGetBizRestaurantDetail,
  handleDeleteBizRestaurant, // ✅ 추가
  handleListBizRestaurants, // ✅ 추가
} from "../controller/restaurants.controller.js";
import multer from "multer";

const router = express.Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage() });

/** 등록 */
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "menuImages", maxCount: 50 },
  ]),
  authenticateAccessToken,
  verifyUserIsActive,
  handleRegisterRestaurant,
);

/** ✅ 전체 조회: GET /api/biz/restaurants?page=&size= */
router.get(
  "/",
  authenticateAccessToken,
  verifyUserIsActive,
  handleListBizRestaurants,
);

/** ✅ 상세 조회: GET /api/biz/restaurants/:restaurantId */
router.get(
  "/:restaurantId",
  authenticateAccessToken,
  verifyUserIsActive,
  handleGetBizRestaurantDetail,
);

/** ✅ 삭제: DELETE /api/biz/restaurants/:restaurantId */
router.delete(
  "/:restaurantId",
  authenticateAccessToken,
  verifyUserIsActive,
  handleDeleteBizRestaurant,
);

/* (선택) 배지 관련 기존 라우트 유지 시, 경로 충돌 없으므로 그대로 둡니다. */
router.get(
  "/:restaurantId/badges",
  authenticateAccessToken,
  verifyUserIsActive,
);

export default router;
