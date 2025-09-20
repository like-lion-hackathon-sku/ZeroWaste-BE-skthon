// // 위치: src/biz/restaurants/dto/request/restaurants.request.dto.js

// /** 공통 BadRequest 에러 */
// export class BadRequestError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = "BadRequestError";
//     this.status = 400;
//   }
// }

// /* 등록 요청 DTO (스키마에 맞는 필드만 남김) */
// export class CreateRestaurantRequestDto {
//   constructor(payload = {}) {
//     this.name = String(payload.name ?? "").trim();
//     this.address = String(payload.address ?? "").trim();
//     this.telephone = String(payload.telephone ?? "");
//     this.mapx = Number.isFinite(+payload.mapx) ? +payload.mapx : null;
//     this.mapy = Number.isFinite(+payload.mapy) ? +payload.mapy : null;
//     this.category = String(payload.category ?? "").trim(); // KOREAN / JAPANESE / CHINESE / ...
//     if (!this.name) throw new BadRequestError("name is required");
//     if (!this.address) throw new BadRequestError("address is required");
//     if (!this.category) throw new BadRequestError("category is required");
//   }
// }

// /* 수정 요청 DTO */
// export class UpdateRestaurantRequestDto {
//   constructor(payload = {}) {
//     const idNum = Number(payload.id);
//     if (!Number.isInteger(idNum) || idNum <= 0) {
//       throw new BadRequestError("valid id is required");
//     }
//     this.id = idNum;
//     this.name = payload.name ?? null;
//     this.address = payload.address ?? null;
//     this.telephone = payload.telephone ?? null;
//     this.mapx = payload.mapx ?? null;
//     this.mapy = payload.mapy ?? null;
//     this.category = payload.category ?? null;
//   }
// }

// /* 네이버 후보 검색 쿼리 파싱 */
// export function parseSearchCandidatesQuery(req) {
//   const q = (req?.query?.q ?? "").toString().trim();
//   const limitRaw = Number(req?.query?.limit ?? 7);
//   if (!q) {
//     const err = new BadRequestError("q is required");
//     throw err;
//   }
//   const limit = Math.min(
//     Math.max(Number.isFinite(limitRaw) ? limitRaw : 7, 1),
//     30,
//   );
//   return { q, limit };
// }
