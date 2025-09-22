import { InvalidInputValueError } from "../../../error.js";

/**
 * **[Review]**
 * **<🧺⬇️ Request DTO>**
 * 리뷰 생성
 * body: { content: string, imageKeys?: string[] | string, score: number(0~5), detailFeedback?: string }
 * path: /restaurants/:id/reviews
 */
export const parseCreateReviewRequest = (req) => {
  const restaurantId = Number(req.params.id);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new InvalidInputValueError(
      "restaurantId가 올바르지 않습니다.",
      req.params,
    );
  }

  const userId = req?.payload?.id;
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new InvalidInputValueError("인증이 필요합니다.", {});
  }

  const { content, imageKeys, score, detailFeedback } = req.body ?? {};

  // ✅ score
  if (score === undefined) {
    throw new InvalidInputValueError("score는 필수입니다.(0~5)", req.body);
  }
  const s = Number(score);
  if (!Number.isFinite(s) || s < 0 || s > 5) {
    throw new InvalidInputValueError("score는 0~5 사이여야 합니다.", req.body);
  }
  const normScore = s;

  // ✅ content
  const text = typeof content === "string" ? content.trim() : "";
  if (text.length < 1 || text.length > 1000) {
    throw new InvalidInputValueError(
      "content는 1~1000자여야 합니다.",
      req.body,
    );
  }

  // ✅ detailFeedback (선택)
  // DB 스키마: review.detailFeedback (TEXT)
  let detail = "";
  if (typeof detailFeedback === "string") {
    detail = detailFeedback.trim();
    if (detail.length > 2000) {
      throw new InvalidInputValueError(
        "detailFeedback는 최대 2000자입니다.",
        req.body,
      );
    }
  }

  // ✅ imageKeys: 문자열/배열 모두 허용 → 파일명만 추출, 50자 제한, 최대 5개
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

  return {
    userId,
    restaurantId,
    content: text,
    imageKeys: keys,
    score: normScore,
    detailFeedback: detail || null, // 없으면 null
  };
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
      req.params,
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