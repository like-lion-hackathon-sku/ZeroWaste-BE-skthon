import { prisma } from "../../db.config.js";

/* 전체 배지 목록 */
export async function findBadgesRepo({ type, skip, take }) {
  const where = type ? { type } : undefined; // Badge.type: "USER" | "RESTAURANT"
  return prisma.badge.findMany({ where, orderBy: { id: "asc" }, skip, take });
}

/* 전체 배지 개수 */
export async function countBadgesRepo({ type }) {
  const where = type ? { type } : undefined;
  return prisma.badge.count({ where });
}

/* 내 배지 목록 (UserBadge ↔ Badge join) */
export async function findMyBadgesRepo({ userId, skip, take }) {
  return prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { id: "desc" },
    skip,
    take,
  });
}

/* 내 배지 개수 */
export async function countMyBadgesRepo({ userId }) {
  return prisma.userBadge.count({ where: { userId } });
}

/** 사용자가 작성한 리뷰 개수 */
export async function countReviewsByUserRepo({ userId }) {
  return prisma.review.count({ where: { userId } });
}
