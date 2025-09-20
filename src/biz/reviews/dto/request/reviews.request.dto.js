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

export const parseBizListReviewsQuery = (req) => {
  // 인증 체크
  const ownerId = req?.user?.id;
  if (!ownerId) throw new LoginRequiredError("로그인이 필요합니다.", null);

  // restaurantId: 선택값
  const rawRestaurantId = req.query.restaurantId;
  let restaurantId = undefined;
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
