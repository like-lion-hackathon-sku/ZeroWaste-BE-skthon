// 위치: src / restaurants / repository / restaurants.repository.js
import { PrismaClient } from "../../generated/prisma/index.js";

const g = globalThis;
/** @type {PrismaClient} - 프로세스 전역 Prisma 싱글턴 */
const prisma = g.__fwzmPrisma ?? new PrismaClient();
if (!g.__fwzmPrisma) g.__fwzmPrisma = prisma;
export { prisma };

/** ─────────────────────────────
 * 공통 where: BBox + (선택)키워드/카테고리
 *  + 필요시 '사장님 등록만' 강제하려면 isPartnered: true 추가
 * ───────────────────────────── */
function buildBBoxWhere({ bbox, q, category }) {
  const where = {
    AND: [
      { mapx: { gte: bbox.minX } },
      { mapx: { lte: bbox.maxX } },
      { mapy: { gte: bbox.minY } },
      { mapy: { lte: bbox.maxY } },
    ],
  };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
      { telephone: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;

  // 👉 사장님 등록 식당만 노출하고 싶으면 아래 주석 해제
  where.isPartnered = true;

  return where;
}

/** BBox 총 개수 */
export async function countInBBox({ bbox, q = "", category = null } = {}) {
  return prisma.restaurants.count({
    where: buildBBoxWhere({ bbox, q, category }),
  });
}

/** BBox 목록 */
export async function findInBBox({
  bbox,
  q = "",
  category = null,
  page = 1,
  size = 20,
} = {}) {
  const skip = Math.max(0, (Number(page) - 1) * Number(size));
  const take = Math.min(Math.max(Number(size) || 20, 1), 50);
  const where = buildBBoxWhere({ bbox, q, category });

  return prisma.restaurants.findMany({
    where,
    orderBy: [{ id: "desc" }],
    skip,
    take,
    select: {
      id: true,
      name: true,
      category: true,
      address: true,
      telephone: true,
      mapx: true,
      mapy: true,
      isSponsored: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/** 단건 기본 조회 */
export async function findById(id) {
  return prisma.restaurants.findUnique({ where: { id: Number(id) } });
}

/**
 * 상세 조회 (기본 + 통계 + 갤러리/리뷰 일부)
 *  - 평균 평점: reviews._avg.rating
 *  - 리뷰 수: reviews._count
 *  - 사진 수: reviewPhotos._count
 *  - 잔반 평균: reviewPhotos._avg.leftoverRatio → ecoScore 계산
 */
export async function findDetailById(restaurantId) {
  const id = Number(restaurantId);
  const base = await prisma.restaurants.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      category: true,
      address: true,
      telephone: true,
      mapx: true,
      mapy: true,
      isSponsored: true,
      createdAt: true,
      updatedAt: true,
      // 갤러리(식당 사진) 있으면 사용
      photos: {
        select: { id: true, url: true },
        take: 12,
        orderBy: { id: "desc" },
      },
      // 최신 리뷰 일부
      reviews: {
        select: {
          id: true,
          rating: true,
          content: true,
          createdAt: true,
          user: { select: { id: true, nickname: true } },
          photos: { select: { id: true, url: true } },
        },
        orderBy: { id: "desc" },
        take: 10,
      },
    },
  });
  if (!base) return null;

  const [reviewAgg, photoAgg, leftoverAgg, ratingAgg] = await Promise.all([
    prisma.reviews.aggregate({
      _count: { _all: true },
      where: { restaurantsId: id },
    }),
    prisma.reviewPhotos.aggregate({
      _count: { _all: true },
      where: { reviews: { restaurantsId: id } },
    }),
    prisma.reviewPhotos.aggregate({
      _avg: { leftoverRatio: true },
      where: { reviews: { restaurantsId: id } },
    }),
    prisma.reviews.aggregate({
      _avg: { rating: true },
      where: { restaurantsId: id },
    }),
  ]);

  const reviewCount = reviewAgg?._count?._all ?? 0;
  const photoCount = photoAgg?._count?._all ?? 0;
  const avgLeftover = leftoverAgg?._avg?.leftoverRatio ?? null;
  const ratingAvg = ratingAgg?._avg?.rating ?? 0;
  const ecoScore =
    avgLeftover == null ? null : Math.round((1 - avgLeftover) * 5 * 10) / 10;

  return {
    id: base.id,
    name: base.name,
    category: base.category,
    address: base.address,
    telephone: base.telephone,
    mapx: base.mapx,
    mapy: base.mapy,
    isSponsored: base.isSponsored,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,

    // 상세 화면용
    stats: {
      reviews: reviewCount,
      photos: photoCount,
      avgRating: ratingAvg ? Number(ratingAvg.toFixed(1)) : 0,
      avgLeftoverRatio: avgLeftover,
      ecoScore,
    },
    gallery: base.photos ?? [],
    reviews: base.reviews ?? [],
  };
}

/** 즐겨찾기 여부 */
export async function isFavorite(userId, restaurantsId) {
  if (!userId) return false;
  const found = await prisma.favorites.findFirst({
    where: { userId: Number(userId), restaurantsId: Number(restaurantsId) },
    select: { id: true },
  });
  return !!found;
}
