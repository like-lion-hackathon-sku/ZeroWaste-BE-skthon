// 위치: src/restaurants/service/restaurants.service.js
import * as repo from "../repository/restaurants.repository.js";

/** 주변 식당 검색 (bbox OR center) */
export async function searchNearbyRestaurants({
  mode,
  bbox,
  center,
  page,
  size,
  category,
}) {
  const offset = (page - 1) * size;

  const [items, total] = await Promise.all([
    repo.findNearbyRestaurants({ bbox, center, category, offset, limit: size }),
    repo.countNearbyRestaurants({ bbox, center, category }),
  ]);

  return { page, size, total, items };
}

/** 상세 + 집계 + 개인화(즐겨찾기 여부) */
export async function getRestaurantDetail({ restaurantId, userId }) {
  return repo.findRestaurantByIdWithStats({ restaurantId, userId });
}

/** 리뷰 목록 */
export async function getRestaurantReviews({
  restaurantId,
  userId,
  page,
  size,
  orderBy,
}) {
  const offset = (page - 1) * size;
  const [items, total] = await Promise.all([
    repo.listRestaurantReviews({
      restaurantId,
      userId,
      offset,
      limit: size,
      orderBy,
    }),
    repo.countRestaurantReviews({ restaurantId }),
  ]);
  return { page, size, total, items };
}
