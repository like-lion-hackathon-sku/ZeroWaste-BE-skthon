// 위치: src / favorites / service / favorites.service.js
import * as favRepo from "../repository/favorites.repository.js";
import * as restRepo from "../../restaurants/repository/restaurants.repository.js";

/* 즐겨찾기 추가 서비스 */
export async function addFavorite({ userId, restaurantId }) {
  const rid = Number(restaurantId);
  if (!Number.isFinite(rid) || rid <= 0) {
    const err = new Error("RESTAURANT_ID_REQUIRED");
    err.status = 400;
    throw err;
  }

  const exists = await restRepo.findById(rid); // prisma.restaurant 기준
  if (!exists) {
    const err = new Error("RESTAURANT_NOT_FOUND");
    err.status = 404;
    throw err;
  }

  const created = await favRepo.ensureFavorite(userId, rid);
  return { restaurantId: rid, created };
}

/* 즐겨찾기 삭제 서비스 */
export async function removeFavorite(userId, restaurantId) {
  await favRepo.deleteFavorite(userId, Number(restaurantId));
}

/* 즐겨찾기 목록 조회 서비스 */
export async function listMyFavorites(userId, q) {
  return favRepo.findByUser(Number(userId), q);
}
