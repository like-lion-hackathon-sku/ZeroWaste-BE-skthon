// 위치: src / biz / restaurants / dto / request / restaurants.request.dto.js

/* 등록 요청 DTO (스키마에 맞는 필드만 남김) */
export class CreateRestaurantRequestDto {
  constructor(payload) {
    this.name = payload.name;
    this.address = payload.address;
    this.telephone = payload.telephone ?? "";
    this.mapx = payload.mapx ?? null;
    this.mapy = payload.mapy ?? null;
    this.category = payload.category; // KOREAN / JAPAESE / CHINESE / ...
  }
}

/* 수정 요청 DTO */
export class UpdateRestaurantRequestDto {
  constructor(payload) {
    this.id = Number(payload.id);
    this.name = payload.name ?? null;
    this.address = payload.address ?? null;
    this.telephone = payload.telephone ?? null;
    this.mapx = payload.mapx ?? null;
    this.mapy = payload.mapy ?? null;
    this.category = payload.category ?? null;
  }
}

/* 네이버 후보 검색 쿼리 파싱 */
export function parseSearchCandidatesQuery(req) {
  const q = (req.query.q ?? "").toString().trim();
  const limit = Number(req.query.limit ?? 7);
  if (!q) {
    const err = new Error("q is required");
    err.status = 400;
    throw err;
  }
  return { q, limit: Math.min(Math.max(limit || 7, 1), 30) };
}
