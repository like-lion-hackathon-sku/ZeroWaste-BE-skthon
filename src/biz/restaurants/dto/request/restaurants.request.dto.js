// // 위치: src/restaurants/dto/request/restaurants.request.dto.js

// /** 공통 BadRequest 에러 */
// export class BadRequestError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = "BadRequestError";
//     this.status = 400;
//   }
// }

// /** :restaurantId 경로 파라미터 파싱 */
// export function parseRestaurantIdParam(params = {}) {
//   const raw = params.restaurantId ?? params.id ?? params.restaurantID;
//   if (raw === undefined) throw new BadRequestError("restaurantId is required");
//   const num = Number(raw);
//   if (!Number.isInteger(num) || num <= 0) {
//     throw new BadRequestError(`invalid restaurantId: ${raw}`);
//   }
//   return { restaurantId: num };
// }

// /**
//  * /restaurants/nearby? 쿼리 파싱
//  * 지원:
//  *  - bbox=left,bottom,right,top (정수/실수)
//  *  - 혹은 center=lng,lat & radius=m
//  *  - page/size
//  */
// export function parseNearbyQuery(query = {}) {
//   const q = {};
//   if (typeof query.bbox === "string" && query.bbox.trim()) {
//     const parts = query.bbox.split(",").map((v) => Number(v));
//     if (parts.length !== 4 || parts.some((v) => !Number.isFinite(v))) {
//       throw new BadRequestError("bbox must be 'left,bottom,right,top'");
//     }
//     const [left, bottom, right, top] = parts;
//     if (!(left < right && bottom < top)) {
//       throw new BadRequestError(
//         "bbox is invalid: left<right and bottom<top required",
//       );
//     }
//     q.bbox = { left, bottom, right, top };
//   }

//   if (query.center !== undefined) {
//     const [lng, lat] = String(query.center).split(",").map(Number);
//     if (![lng, lat].every(Number.isFinite)) {
//       throw new BadRequestError("center must be 'lng,lat'");
//     }
//     const radius = Number(query.radius ?? 1000);
//     if (!Number.isFinite(radius) || radius <= 0) {
//       throw new BadRequestError("radius must be a positive number");
//     }
//     q.center = { lng, lat, radius };
//   }

//   // bbox 또는 center 둘 중 하나는 있어야 한다고 강제하고 싶다면 아래 주석 해제
//   if (!q.bbox && !q.center) {
//     throw new BadRequestError("either bbox or center must be provided");
//   }

//   q.page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
//   q.size = Math.min(100, Math.max(1, parseInt(query.size ?? "20", 10) || 20));
//   return q;
// }

// /** 식당 리뷰 목록 쿼리 */
// export function parseListReviewsQuery(query = {}) {
//   const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
//   const size = Math.min(
//     100,
//     Math.max(1, parseInt(query.size ?? "20", 10) || 20),
//   );
//   const sort = (query.sort ?? "latest").toString(); // latest | best 등
//   return { page, size, sort };
// }

// /** (옵션) 키워드 기반 DB 검색용 */
// export function parseSearchQuery(query = {}) {
//   const keyword = (query.keyword ?? "").toString().trim();
//   const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
//   const size = Math.min(
//     100,
//     Math.max(1, parseInt(query.size ?? "20", 10) || 20),
//   );
//   return { keyword, page, size };
// }
