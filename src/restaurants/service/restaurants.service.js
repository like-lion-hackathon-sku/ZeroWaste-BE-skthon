import * as repo from "../repository/restaurants.repository.js";

/** bbox 내 식당 검색 */
export async function searchNearbyRestaurants({ bbox, page, size, category }) {
  const offset = (page - 1) * size;
  const [items, total] = await Promise.all([
    repo.findNearbyRestaurants({ bbox, category, offset, limit: size }),
    repo.countNearbyRestaurants({ bbox, category }),
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
