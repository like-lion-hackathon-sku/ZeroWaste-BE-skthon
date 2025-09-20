// 위치: src/restaurants/repository/restaurants.repository.js
import prisma from "../../generated/prisma/index.js";

/** bbox 내 식당 목록 */
export function findNearbyRestaurants({ bbox, category, offset, limit }) {
  const where = {
    mapx: { gte: bbox.minX, lte: bbox.maxX },
    mapy: { gte: bbox.minY, lte: bbox.maxY },
    ...(category ? { category } : {}),
  };

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

export function countNearbyRestaurants({ bbox, category }) {
  const where = {
    mapx: { gte: bbox.minX, lte: bbox.maxX },
    mapy: { gte: bbox.minY, lte: bbox.maxY },
    ...(category ? { category } : {}),
  };
  return prisma.restaurant.count({ where });
}

/** 상세 + 통계 + 개인화(즐겨찾기 여부) */
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
  // 별점 필드가 없으므로 기본 정렬은 최신순
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
        rating: null, // 스키마에 rating 없음
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

