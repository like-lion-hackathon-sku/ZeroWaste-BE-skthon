// 위치: src / biz / restaurants / dto / request / restaurants.request.dto.js

/**
 * 📌 사업자 전용 식당 등록 요청 DTO
 * @typedef {Object} CreateRestaurantRequestDto
 * @property {string} name - 식당 이름 (필수)
 * @property {string} address - 주소 (필수)
 * @property {string} telephone - 전화번호 (선택)
 * @property {number} mapx - 지도 X 좌표 (경도)
 * @property {number} mapy - 지도 Y 좌표 (위도)
 * @property {string} category - 카테고리 (예: KOREAN, CAFE)
 * @property {string} [licenseNumber] - 사업자 등록 번호
 * @property {string} [licenseImageUrl] - 사업자 등록증 이미지 URL
 */
export class CreateRestaurantRequestDto {
  constructor(payload) {
    this.name = payload.name;
    this.address = payload.address;
    this.telephone = payload.telephone ?? "";
    this.mapx = payload.mapx;
    this.mapy = payload.mapy;
    this.category = payload.category;
    this.licenseNumber = payload.licenseNumber ?? null;
    this.licenseImageUrl = payload.licenseImageUrl ?? null;
  }
}

/**
 * 📌 사업자 전용 식당 수정 요청 DTO
 * @typedef {Object} UpdateRestaurantRequestDto
 * @property {number} id - 식당 ID (필수)
 * @property {string} [name] - 식당 이름
 * @property {string} [address] - 주소
 * @property {string} [telephone] - 전화번호
 * @property {number} [mapx] - 지도 X 좌표 (경도)
 * @property {number} [mapy] - 지도 Y 좌표 (위도)
 * @property {string} [category] - 카테고리
 */
export class UpdateRestaurantRequestDto {
  constructor(payload) {
    this.id = payload.id;
    this.name = payload.name ?? null;
    this.address = payload.address ?? null;
    this.telephone = payload.telephone ?? null;
    this.mapx = payload.mapx ?? null;
    this.mapy = payload.mapy ?? null;
    this.category = payload.category ?? null;
  }
}
