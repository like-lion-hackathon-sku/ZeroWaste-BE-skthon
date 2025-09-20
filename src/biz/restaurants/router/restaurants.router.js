import express from "express";
import {
  authenticateAccessToken,
  verifyUserIsActive,
} from "../../../auth/middleware/auth.middleware.js";
import {
  handleRegisterRestaurant,
  handleListMyBizRestaurants,
  handleGetMyBizRestaurantDetail,
  handleDeleteMyBizRestaurant,
} from "../controller/restaurants.controller.js";
import multer from "multer";

const router = express.Router({ mergeParams: true });
const upload = multer({
  storage: multer.memoryStorage(),
});

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
router.get(
  "/",
  authenticateAccessToken,
  verifyUserIsActive,
  handleListMyBizRestaurants,
);
+router.get(
  "/:restaurantId",
  authenticateAccessToken,
  verifyUserIsActive,
  handleGetMyBizRestaurantDetail,
);
+router.delete(
  "/",
  authenticateAccessToken,
  verifyUserIsActive,
  handleDeleteMyBizRestaurant,
);
router.get(
  "/:restaurantId/badges",
  authenticateAccessToken,
  verifyUserIsActive,
);

export default router;
