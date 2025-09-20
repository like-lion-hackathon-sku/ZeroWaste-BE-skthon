// src/biz/reviews/dto/request/biz.reviews.request.dto.js
import {
  InvalidInputValueError,
  LoginRequiredError,
} from "../../../../error.js";

// 1 이상 정수로 파싱, 아니면 기본값
const toPositiveInt = (v, def) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  const i = Math.trunc(n);
  return i > 0 ? i : def;
};

const ALLOWED_SORT = new Set(["createdAt", "score", "id"]);

/** 전체 목록 파서 */
export const parseBizListReviewsQuery = (req) => {
  // ✅ 인증 체크: req.user / req.payload 모두 지원
  const ownerId = req?.user?.id ?? req?.payload?.id;
  if (!ownerId) throw new LoginRequiredError("로그인이 필요합니다.", null);

  // restaurantId: 선택값 (query)
  const rawRestaurantId = req.query.restaurantId;
  let restaurantId;
  if (rawRestaurantId !== undefined && rawRestaurantId !== "") {
    const parsed = Number(rawRestaurantId);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new InvalidInputValueError("restaurantId는 양의 정수여야 합니다.", {
        restaurantId: rawRestaurantId,
      });
    }
    restaurantId = parsed;
  }

  // 페이지네이션
  const page = toPositiveInt(req.query.page, 1); // 1-based
  const size = Math.min(toPositiveInt(req.query.size, 10), 50); // 최대 50개
  const skip = (page - 1) * size;

  // 정렬
  const sortBy = String(req.query.sortBy || "createdAt");
  const order =
    String(req.query.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const safeSortBy = ALLOWED_SORT.has(sortBy) ? sortBy : "createdAt";

  return {
    ownerId,
    restaurantId, // undefined면 ‘내 모든 식당’ 대상
    page,
    size,
    skip,
    sortBy: safeSortBy,
    order,
  };
};

/** 요약용 파서 (path: /api/biz/reviews/:restaurantId/summaries) */
export const parseBizListReviewSummariesQuery = (req) => {
  // ✅ 인증 체크
  const ownerId = req?.user?.id ?? req?.payload?.id;
  if (!ownerId) throw new LoginRequiredError("로그인이 필요합니다.", null);

  // ✅ restaurantId를 path param에서 필수로 받음
  const rawRestaurantId = req.params.restaurantId;
  const restaurantId = Number(rawRestaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    throw new InvalidInputValueError("restaurantId는 양의 정수여야 합니다.", {
      restaurantId: rawRestaurantId,
    });
  }

  // 페이지네이션
  const page = toPositiveInt(req.query.page, 1);
  const size = Math.min(toPositiveInt(req.query.size, 10), 50);
  const skip = (page - 1) * size;

  // 정렬(요약은 createdAt만, asc/desc만 허용)
  const order =
    String(req.query.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  return {
    ownerId,
    restaurantId,
    page,
    size,
    skip,
    sortBy: "createdAt",
    order,
  };
};
