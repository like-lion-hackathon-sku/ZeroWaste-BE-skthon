// 위치: src/restaurants/dto/request/restaurants.request.dto.js
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
  const parts = String(bboxStr ?? "")
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

/** 주변 식당 검색 쿼리 파서
 *  - 우선순위 1) bbox
 *  - 우선순위 2) lat,lng,(radiusKm)
 */
export function parseNearbyQuery(query) {
  const page = toPosInt(query.page, 1);
  const size = toPosInt(query.size, 20);
  const category = query.category
    ? String(query.category).toUpperCase()
    : undefined;

  if (query.bbox) {
    const bbox = parseBbox(query.bbox);
    return { mode: "bbox", bbox, page, size, category };
  }

  const lat = Number(query.lat);
  const lng = Number(query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new BadRequestError("either 'bbox' or 'lat,lng' is required");
  }
  // 기본 반경: 2km (0.1~20km 제한)
  let radiusKm = Number(query.radiusKm ?? 2);
  radiusKm = Math.min(Math.max(radiusKm || 2, 0.1), 20);

  return {
    mode: "center",
    center: { lat, lng, radiusKm },
    page,
    size,
    category,
  };
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

export { BadRequestError };
