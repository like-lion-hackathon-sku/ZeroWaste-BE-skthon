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

/** bbox= "minX,minY,maxX,maxY" 파싱 */
function parseBbox(bboxStr) {
  if (!bboxStr) throw new BadRequestError("bbox is required");
  const parts = String(bboxStr)
    .split(",")
    .map((v) => +v);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    throw new BadRequestError("bbox must be 'minX,minY,maxX,maxY'");
  }
  const [minX, minY, maxX, maxY] = parts;
  if (minX >= maxX || minY >= maxY)
    throw new BadRequestError("bbox is invalid");
  return { minX, minY, maxX, maxY };
}

/** 주변 식당 검색 쿼리 파서 */
export function parseNearbyQuery(query) {
  const bbox = parseBbox(query.bbox);
  const page = toPosInt(query.page, 1);
  const size = toPosInt(query.size, 20);
  const category = query.category
    ? String(query.category).toUpperCase()
    : undefined;
  return { bbox, page, size, category };
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
