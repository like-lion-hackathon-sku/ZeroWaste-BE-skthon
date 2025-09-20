// src/reviews/routes/reviews.routes.js

import { Router } from "express";
import multer from "multer";
import { InvalidInputValueError } from "../../error.js";
import { authenticateAccessToken } from "../../auth/middleware/auth.middleware.js";
import {
  handleCreateReviews,
  handleDeleteReviews,
  handleGetMyReviews,
} from "../controller/reviews.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) {
      // 400으로 처리되도록 커스텀 에러 사용
      return cb(
        new InvalidInputValueError("이미지 파일만 업로드 가능합니다.", {
          mimetype: file.mimetype,
        })
      );
    }
    cb(null, true);
  },
}).array("images", 5);

/// multer 에러를 next로 안전하게 전달하는 래퍼
const uploadReviewImages = (req, res, next) => {
  upload(req, res, (err) => {
    if (!err) return next();
    // MulterError 혹은 커스텀 에러를 그대로 전달
    return next(
      err instanceof Error
        ? err
        : new InvalidInputValueError("업로드 처리 중 오류가 발생했습니다.", {})
    );
  });
};

const router = Router();

// 생성: 업로드 파서 → 컨트롤러 (S3 업로드는 컨트롤러에서 수행)
router.post(
  "/restaurants/:id/reviews",
  authenticateAccessToken,
  uploadReviewImages,
  handleCreateReviews
);

// 삭제
router.delete(
  "/reviews/:reviewId",
  authenticateAccessToken,
  handleDeleteReviews
);

// 내 리뷰 목록
router.get("/reviews/me", authenticateAccessToken, handleGetMyReviews);

export default router;