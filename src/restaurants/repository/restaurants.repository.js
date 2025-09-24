// repository
import { prisma } from "../../db.config.js";

const g = globalThis;
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
// src/restaurants/repository/restaurants.repository.js

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
      rows.map((r) => {
        const leftoverRate = r.reviewMenu.length
          ? Math.round(
              (r.reviewMenu.reduce((s, m) => s + (m.leftoverRatio ?? 0), 0) /
                r.reviewMenu.length) *
                100,
            )
          : null;

        // ✅ detailFeedback 생성 로직
        // - 우선순위 1: 연결된 reviewFeedback[] 이 있으면 message/type을 문자열 배열로
        // - 우선순위 2: review.detailFeedback(문자열/JSON) 필드가 있으면 배열로 normalize
        let detailFeedback = null;

        if (Array.isArray(r.reviewFeedback) && r.reviewFeedback.length > 0) {
          detailFeedback = r.reviewFeedback.map(
            (f) => f?.message ?? f?.type ?? "",
          ).filter(Boolean);
          if (detailFeedback.length === 0) detailFeedback = null;
        } else if (typeof r.detailFeedback !== "undefined") {
          // r.detailFeedback 이 문자열이면 [str], 배열/JSON이면 그대로, 그 외는 null
          if (typeof r.detailFeedback === "string" && r.detailFeedback.trim()) {
            detailFeedback = [r.detailFeedback.trim()];
          } else if (Array.isArray(r.detailFeedback)) {
            detailFeedback = r.detailFeedback.map(String).filter(Boolean);
            if (detailFeedback.length === 0) detailFeedback = null;
          } else if (r.detailFeedback && typeof r.detailFeedback === "object") {
            // JSON 객체라면 값들을 문자열로 풀어 배열화 (원하면 커스터마이즈)
            const vals = Object.values(r.detailFeedback).map(String).filter(Boolean);
            detailFeedback = vals.length ? vals : null;
          }
        }

        return {
          id: r.id,
          userId: r.userId,
          nickname: r.user?.nickname ?? null,
          score: r.score,
          leftoverRate,
          content: r.content,
          createdAt: r.createdAt,
          images: r.reviewPhoto.map((p) => p.imageName),
          isMine: userId ? r.userId === userId : false,
          // ✅ 신규 필드 추가
          detailFeedback: r.detailFeedback ?? null, // string | null
        };
      }),
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

export const getRestaurantBenefitsById = async (data) => {
  return await prisma.stampReward.findMany({
    select: {
      condition: true,
      reward: true,
    },
    where: {
      restaurantId: data.restaurantId,
    },
    orderBy: {
      condition: "asc",
    },
  });
};
