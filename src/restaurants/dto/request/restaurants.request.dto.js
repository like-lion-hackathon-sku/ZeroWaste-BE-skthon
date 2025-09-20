// 위치: src/restaurants/dto/request/restaurants.request.dto.js

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

/** :restaurantId 경로 파라미터 파서 */
export function parseRestaurantIdParam(params = {}) {
  const raw = params.restaurantId ?? params.id ?? params.restaurantID;
  if (raw === undefined) {
    throw new BadRequestError("restaurantId is required");
  }
  const num = Number(raw);
  if (!Number.isInteger(num) || num <= 0) {
    throw new BadRequestError(`invalid restaurantId: ${raw}`);
  }
  return { restaurantId: num };
}

/** 주변 식당 검색 쿼리 파서 */
export function parseNearbyQuery(query = {}) {
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
export function parseListReviewsQuery(query = {}) {
  const page = toPosInt(query.page, 1);
  const size = toPosInt(query.size, 20);
  const valid = new Set(["LATEST", "HIGH_SCORE", "LOW_SCORE"]);
  const orderBy = valid.has(String(query.orderBy))
    ? String(query.orderBy)
    : "LATEST";
  return { page, size, orderBy };
}

// 한글/영문/별칭 → FoodCategory enum 매핑
// enum: KOREAN | JAPANESE | CHINESE | WESTERN | FASTFOOD | CAFE | ETC
export function toFoodCategoryEnum(input) {
  const s = String(input ?? "")
    .trim()
    .toLowerCase();
  if (!s) return undefined;

  const table = [
    // 한식
    { keys: ["한식", "korean", "ko"], value: "KOREAN" },

    // 일식
    { keys: ["일식", "japanese", "jp"], value: "JAPANESE" },

    // 중식
    { keys: ["중식", "chinese", "cn"], value: "CHINESE" },

    // 양식
    {
      keys: ["양식", "western", "it", "이탈리아", "스테이크"],
      value: "WESTERN",
    },

    // 패스트푸드 (분식/버거/치킨 등 포함 가능)
    {
      keys: ["패스트푸드", "패푸", "fastfood", "분식", "버거", "치킨"],
      value: "FASTFOOD",
    },

    // 카페
    { keys: ["카페", "cafe", "커피"], value: "CAFE" },

    // 기타
    { keys: ["기타", "etc", "그외"], value: "ETC" },
  ];

  for (const row of table) {
    if (row.keys.includes(s)) return row.value;
  }
  return undefined; // 매칭 안 되면 카테고리 필터 없이 검색
}
