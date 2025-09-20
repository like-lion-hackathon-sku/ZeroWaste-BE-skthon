// request
// import { toFoodCategoryEnum } from "../../utils/category.mapper.js";
class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
  }
}

function toPosInt(v, d) {
  const n = Math.floor(+v);
  return Number.isFinite(n) && n > 0 ? n : d;
}

/** 주변 식당 검색 쿼리 파서 */
export function parseNearbyQuery(query) {
  const page = toPosInt(query.page, 1);
  const size = toPosInt(query.size, 20);

  // 검색창(q) 또는 category 둘 다 지원
  // 예) ?q=한식  / ?category=한식  / ?category=KOREAN
  const raw = query.q ?? query.category;

  let category;
  if (raw) {
    // 1) 한글/별칭 → enum
    category = toFoodCategoryEnum(raw);
    // 2) 이미 enum 문자열(KOREAN 등)로 온 경우도 통과
    if (!category) {
      const up = String(raw).trim().toUpperCase();
      const enums = new Set([
        "KOREAN",
        "JAPANESE",
        "CHINESE",
        "WESTERN",
        "FASTFOOD",
        "CAFE",
        "ETC",
      ]);
      if (enums.has(up)) category = up;
    }
  }

  return { page, size, category };
}
/** 리뷰 목록 쿼리 파서 */
export function parseListReviewsQuery(query) {
  const page = toPosInt(query.page, 1);
  const size = toPosInt(query.size, 20);
  const valid = new Set(["LATEST", "HIGH_SCORE", "LOW_SCORE"]);
  const orderBy = valid.has(String(query.orderBy))
    ? String(query.orderBy)
    : "LATEST";
  return { page, size, orderBy };
}
