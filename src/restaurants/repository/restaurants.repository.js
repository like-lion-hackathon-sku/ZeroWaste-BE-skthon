// repository
import { PrismaClient } from "../../generated/prisma/index.js";

const g = globalThis;
export const prisma = g.__zwPrisma ?? new PrismaClient();
if (!g.__zwPrisma) g.__zwPrisma = prisma;

/** 식당 목록 */
export function findRestaurants({ category, offset, limit }) {
  const where = category ? { category } : {};
  return prisma.restaurant.findMany({
    where,
    orderBy: { id: "asc" },
    skip: offset,
    take: limit,
    include: {
      restaurantBadge: { include: { badge: true } },
    },
  });
}

export function countRestaurants({ category }) {
  const where = category ? { category } : {};
  return prisma.restaurant.count({ where });
}

/** 상세 + 통계 + 개인화 */
export function findRestaurantByIdWithStats({ restaurantId, userId }) {
  return prisma.restaurant
    .findUnique({
      where: { id: restaurantId },
      include: {
        menu: true,
        restaurantPhoto: true,
        restaurantBadge: { include: { badge: true } },
        _count: { select: { review: true, favorite: true } },
        ...(userId
          ? {
              favorite: {
                where: { userId },
                select: { id: true },
                take: 1,
              },
            }
          : {}),
      },
    })
    .then((r) => {
      if (!r) return null;
      const isMyFavorite = Array.isArray(r.favorite) && r.favorite.length > 0;
      return { ...r, isMyFavorite };
    });
}

/** 리뷰 목록 */
export function listRestaurantReviews({
  restaurantId,
  userId,
  offset,
  limit,
  orderBy,
}) {
  const order =
    orderBy === "HIGH_SCORE"
      ? [{ reviewMenu: { _avg: { leftoverRatio: "asc" } } }]
      : orderBy === "LOW_SCORE"
        ? [{ reviewMenu: { _avg: { leftoverRatio: "desc" } } }]
        : [{ createdAt: "desc" }];

  return prisma.review
    .findMany({
      where: { restaurantId },
      orderBy: order,
      skip: offset,
      take: limit,
      include: {
        user: { select: { id: true, nickname: true } },
        reviewPhoto: true,
        reviewMenu: true,
      },
    })
    .then((rows) =>
      rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        nickname: r.user?.nickname ?? null,
        leftoverRate: r.reviewMenu.length
          ? Math.round(
              (r.reviewMenu.reduce((s, m) => s + (m.leftoverRatio ?? 0), 0) /
                r.reviewMenu.length) *
                100,
            )
          : null,
        content: r.content,
        createdAt: r.createdAt,
        images: r.reviewPhoto.map((p) => p.imageName),
        isMine: userId ? r.userId === userId : false,
      })),
    );
}

export function countRestaurantReviews({ restaurantId }) {
  return prisma.review.count({ where: { restaurantId } });
}
// 존재 확인용 (가벼운 쿼리)
export function findById(id) {
  const rid = Number(id);
  if (!Number.isInteger(rid) || rid <= 0) return Promise.resolve(null);
  return prisma.restaurant.findUnique({
    where: { id: rid },
    select: { id: true }, // 존재만 확인
  });
}
