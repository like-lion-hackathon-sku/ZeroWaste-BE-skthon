// service
import * as repo from "../repository/restaurants.repository.js";

/** 식당 목록 조회 */
export async function searchRestaurants({ page, size, category }) {
  const offset = (page - 1) * size;
  const [items, total] = await Promise.all([
    repo.findRestaurants({ category, offset, limit: size }),
    repo.countRestaurants({ category }),
  ]);
  return { page, size, total, items };
}

/** 상세 */
export async function getRestaurantDetail({ restaurantId, userId }) {
  return repo.findRestaurantByIdWithStats({ restaurantId, userId });
}

/** 리뷰 */
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
