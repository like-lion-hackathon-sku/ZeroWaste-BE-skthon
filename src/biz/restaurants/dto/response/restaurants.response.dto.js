//  위치: src / biz / restaurants / dto / response / restaurants.response.dto.js
export class RestaurantResponseDto {
  constructor(entity) {
    this.id = entity.id;
    this.name = entity.name;
    this.category = entity.category;
    this.address = entity.address;
    this.telephone = entity.telephone;
    this.mapx = entity.mapx ?? null;
    this.mapy = entity.mapy ?? null;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}

export class EnsureRestaurantResponseDto {
  constructor({ restaurantId, created }) {
    this.restaurantId = restaurantId;
    this.created = created;
  }
}

export const ok = (data) => ({
  resultType: "SUCCESS",
  error: null,
  success: data,
});
export const fail = (error) => ({
  resultType: "FAILURE",
  error,
  success: null,
});
