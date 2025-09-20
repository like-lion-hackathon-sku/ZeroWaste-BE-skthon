// 위치: src / biz / restaurants / dto / response / restaurants.response.dto.js

/**
 * 📌 식당 응답 DTO
 * @typedef {Object} RestaurantResponseDto
 * @property {number} id - 식당 ID
 * @property {string} name - 식당 이름
 * @property {string} category - 카테고리
 * @property {string} address - 주소
 * @property {string} telephone - 전화번호
 * @property {number} mapx - 지도 X 좌표 (경도)
 * @property {number} mapy - 지도 Y 좌표 (위도)
 * @property {boolean} isSponsored - 스폰서 여부
 * @property {Date} createdAt - 생성 시각
 * @property {Date} updatedAt - 수정 시각
 */
export class RestaurantResponseDto {
  constructor(entity) {
    this.id = entity.id;
    this.name = entity.name;
    this.category = entity.category;
    this.address = entity.address;
    this.telephone = entity.telephone;
    this.mapx = entity.mapx;
    this.mapy = entity.mapy;
    this.isSponsored = entity.isSponsored ?? false;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

/**
 * 📌 식당 생성/수정 후 응답 DTO
 * @typedef {Object} EnsureRestaurantResponseDto
 * @property {number} restaurantId - 생성/수정된 식당 ID
 * @property {boolean} created - 신규 생성 여부
 */
export class EnsureRestaurantResponseDto {
  constructor({ restaurantId, created }) {
    this.restaurantId = restaurantId;
    this.created = created;
  }
}
