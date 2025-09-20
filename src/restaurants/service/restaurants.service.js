// 위치: src / restaurants / service / restaurans.service.js
import * as restRepo from "../repository/restaurants.repository.js";

/* 주변 식당 검색 서비스 */
export async function searchRestaurantsInDb(query = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const size = Math.min(Math.max(Number(query.size) || 20, 1), 50);
  const q = String(query.q ?? "").trim();
  const category = query.category ? String(query.category) : null;
  const bbox = query.bbox; // {minX,minY,maxX,maxY}

  const [items, total] = await Promise.all([
    restRepo.findInBBox({ bbox, q, category, page, size }),
    restRepo.countInBBox({ bbox, q, category }),
  ]);

  return { items, page, size, total };
}

/* 식당 상세 조회 서비스 */
export async function getRestaurantDetail(restaurantId, userId) {
  const detail = await restRepo.findDetailById(restaurantId);
  if (!detail) {
    const err = new Error("RESTAURANT_NOT_FOUND");
    err.status = 404;
    throw err;
  }
  const favorite = await restRepo.isFavorite(userId, restaurantId);

  return { ...detail, isFavorite: favorite };
}
