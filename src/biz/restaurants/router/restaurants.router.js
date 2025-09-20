import express from "express";
import {
  authenticateAccessToken,
  verifyUserIsActive,
} from "../../../auth/middleware/auth.middleware.js";
import { handleRegisterRestaurant } from "../controller/restaurants.controller.js";
//현준 추가
import { handleGetBizRestaurantDetail } from "../controller/restaurants.controller.js";
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
  handleRegisterRestaurant
);
router.delete("/", authenticateAccessToken, verifyUserIsActive);
router.get("/", authenticateAccessToken, verifyUserIsActive);
router.get("/:restaurantId", authenticateAccessToken, verifyUserIsActive);
router.get(
  "/:restaurantId/badges",
  authenticateAccessToken,
  verifyUserIsActive
);
//현준 추가
router.get("/:restaurantId", handleGetBizRestaurantDetail);
export default router;
