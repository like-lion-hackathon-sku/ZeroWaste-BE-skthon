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
  const category = query.category
    ? String(query.category).toUpperCase()
    : undefined;
  return { page, size, category };
}

/** :restaurantId 파서 */
export function parseRestaurantIdParam(params) {
  const id = +params.restaurantId;
  if (!Number.isFinite(id) || id <= 0)
    throw new BadRequestError("restaurantId must be positive integer");
  return { restaurantId: id };
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
