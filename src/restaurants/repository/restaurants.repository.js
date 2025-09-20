// 위치: src/restaurants/repository/restaurants.repository.js
import { PrismaClient } from "../../generated/prisma/index.js";

// Prisma 싱글턴
const g = globalThis;
export const prisma = g.__zwPrisma ?? new PrismaClient();
if (!g.__zwPrisma) g.__zwPrisma = prisma;

// DB에 저장된 좌표는 정수 스케일(예: 1270619110 ≈ 127.0619110) → 1e7 스케일
const SCALE = 1e7;

/** center+radiusKm → bbox(Int 스케일)로 변환 */
function bboxFromCenter({ lat, lng, radiusKm }) {
  const deltaDeg = radiusKm / 111.0; // 위경도 1도 ≈ 111km
  const minX = Math.round((lng - deltaDeg) * SCALE);
  const maxX = Math.round((lng + deltaDeg) * SCALE);
  const minY = Math.round((lat - deltaDeg) * SCALE);
  const maxY = Math.round((lat + deltaDeg) * SCALE);
  return { minX, minY, maxX, maxY };
}

/** 공통 where 생성 (bbox: float/int 모두 허용, 내부는 정수 비교) */
function buildWhere({ bbox, center, category }) {
  let range;
  if (center) {
    // center가 오면 bbox로 치환
    const b = bboxFromCenter(center);
    range = {
      mapx: { gte: b.minX, lte: b.maxX },
      mapy: { gte: b.minY, lte: b.maxY },
    };
  } else if (bbox) {
    // bbox가 실수더라도 정수로 비교 (스케일 곱)
    const minX = Math.round(bbox.minX * SCALE);
    const maxX = Math.round(bbox.maxX * SCALE);
    const minY = Math.round(bbox.minY * SCALE);
    const maxY = Math.round(bbox.maxY * SCALE);
    range = {
      mapx: { gte: minX, lte: maxX },
      mapy: { gte: minY, lte: maxY },
    };
  } else {
    // 이 경우는 발생하지 않게 상위에서 보장
    range = {};
  }

  return {
    ...range,
    ...(category ? { category } : {}),
  };
}

/** 목록 */
export function findNearbyRestaurants({
  bbox,
  center,
  category,
  offset,
  limit,
}) {
  const where = buildWhere({ bbox, center, category });
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

/** 개수 */
export function countNearbyRestaurants({ bbox, center, category }) {
  const where = buildWhere({ bbox, center, category });
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
        rating: null,
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
