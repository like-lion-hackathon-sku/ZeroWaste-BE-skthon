// src/reviews/dto/request/reviews.request.dto.js
import { InvalidInputValueError } from "../../../error.js";

/**
 * **[Review]**
 * **<🧺⬇️ Request DTO>**
 * 리뷰 생성
 * body: { content: string, imageKeys?: string[] }
 * path: /restaurants/:id/reviews
 */
export const parseCreateReviewRequest = (req) => {
  const restaurantId = Number(req.params.id);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new InvalidInputValueError(
      "restaurantId가 올바르지 않습니다.",
      req.params
    );
  }

  const userId = req?.payload?.id;
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new InvalidInputValueError("인증이 필요합니다.", {});
  }

  const { content, imageKeys } = req.body ?? {};

  const text = typeof content === "string" ? content.trim() : "";
  if (text.length < 1 || text.length > 1000) {
    throw new InvalidInputValueError(
      "content는 1~1000자여야 합니다.",
      req.body
    );
  }

  // ReviewPhoto.imageName 은 VarChar(50) + @unique → 길이 자르고 공백 제거
  let keys = [];
  if (typeof imageKeys === "string") {
    keys = imageKeys
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  } else if (Array.isArray(imageKeys)) {
    keys = imageKeys
      .map((v) => (typeof v === "string" ? v.trim() : ""))
      .filter(Boolean);
  }
  keys = keys.map((k) => k.slice(0, 50)).slice(0, 5);
  
  return { userId, restaurantId, content: text, imageKeys: keys };
};

/**
 * **[Review]**
 * **<🧺⬇️ Request DTO>**
 * 리뷰 삭제
 */
export const parseDeleteMyReviews = (req) => {
  const reviewId = Number(req.params.reviewId ?? req.params.id);
  if (!Number.isInteger(reviewId) || reviewId <= 0) {
    throw new InvalidInputValueError(
      "reviewId가 올바르지 않습니다.",
      req.params
    );
  }
  return { reviewId };
};

/**
 * **[Review]**
 * **<🧺⬇️ Request DTO>**
 * 내 리뷰 목록 조회
 */
export const parseGetMyReviews = (req) => {
  const { page = "1", size = "10" } = req.query ?? {};
  const p = Math.max(1, Number.parseInt(page, 10) || 1);
  const s = Math.min(50, Math.max(1, Number.parseInt(size, 10) || 10));
  return { page: p, size: s };
};
