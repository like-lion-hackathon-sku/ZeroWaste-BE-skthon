import {
  findBadgesRepo,
  countBadgesRepo,
  findMyBadgesRepo,
  countMyBadgesRepo,
  countReviewsByUserRepo,
} from "../repository/badges.repository.js";

export async function listBadgesSvc({ type, skip, take, page, size }) {
  const [items, total] = await Promise.all([
    findBadgesRepo({ type, skip, take }),
    countBadgesRepo({ type }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / size));
  return { items, page, size, total, totalPages };
}

export async function listMyBadgesSvc({ userId, skip, take, page, size }) {
  // 로그인/활성화 검사는 미들웨어가 이미 보장.
  const [rows, total, reviewCount] = await Promise.all([
    findMyBadgesRepo({ userId, skip, take }),
    countMyBadgesRepo({ userId }),
    countReviewsByUserRepo({ userId }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / size));
  return { rows, page, size, total, totalPages, reviewCount };
}
