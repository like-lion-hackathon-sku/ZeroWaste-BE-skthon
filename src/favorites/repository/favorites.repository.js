// 위치: src / favorites / repository / favorites.repository.js
import { PrismaClient } from "../../generated/prisma/index.js";

const g = globalThis;
/** @type {PrismaClient} */
const prisma = g.__fwzmPrisma ?? new PrismaClient();
if (!g.__fwzmPrisma) g.__fwzmPrisma = prisma;

/* 즐겨찾기 추가(멱등) - 스키마 단수형에 맞춤 */
export async function ensureFavorite(userId, restaurantId) {
  return prisma.$transaction(async (tx) => {
    // 단수형: tx.favorite
    const existing = await tx.favorite.findFirst({
      where: { userId: Number(userId), restaurantId: Number(restaurantId) },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    if (existing) return false;

    const created = await tx.favorite.create({
      data: { userId: Number(userId), restaurantId: Number(restaurantId) },
      select: { id: true },
    });

    // 혹시 모를 중복 정리
    const dupes = await tx.favorite.findMany({
      where: { userId: Number(userId), restaurantId: Number(restaurantId) },
      select: { id: true },
      orderBy: { id: "asc" },
    });

    if (dupes.length > 1) {
      const keepId = dupes[0].id;
      const toDelete = dupes.slice(1).map((d) => d.id);
      await tx.favorite.deleteMany({ where: { id: { in: toDelete } } });
      return created.id === keepId;
    }

    return true;
  });
}

/** 즐겨찾기 삭제 (단수형) */
export async function deleteFavorite(userId, restaurantId) {
  await prisma.favorite.deleteMany({
    where: { userId: Number(userId), restaurantId: Number(restaurantId) },
  });
}

/** 내 즐겨찾기 목록 조회 (단수형 + 관계명 매핑) */
export async function findByUser(userId, { page = 1, size = 20 } = {}) {
  const safePage = Number.isFinite(+page) && +page > 0 ? +page : 1;
  const safeSizeRaw = Number.isFinite(+size) && +size > 0 ? +size : 20;
  const safeSize = Math.min(Math.max(safeSizeRaw, 1), 50);
  const skip = (safePage - 1) * safeSize;
  const take = safeSize;

  const where = { userId: Number(userId) };

  const [total, rows] = await Promise.all([
    prisma.favorite.count({ where }),
    prisma.favorite.findMany({
      where,
      include: {
        // 스키마 관계명: Favorite.restaurant (단수)
        restaurant: {
          select: {
            id: true,
            name: true,
            category: true,
            address: true,
            telephone: true,
            mapx: true,
            mapy: true,
          },
        },
      },
      orderBy: [{ id: "desc" }],
      skip,
      take,
    }),
  ]);

  const items = rows.map((r) => ({
    id: r.id,
    restaurantId: r.restaurant?.id ?? null,
    name: r.restaurant?.name ?? null,
    category: r.restaurant?.category ?? null,
    address: r.restaurant?.address ?? null,
    telephone: r.restaurant?.telephone ?? null,
    mapx: r.restaurant?.mapx ?? null,
    mapy: r.restaurant?.mapy ?? null,
  }));

  return { items, pageInfo: { page: safePage, size: safeSize, total } };
}
