// src/biz/reviews/repository/biz.reviews.repository.js
import { prisma } from "../../../db.config.js";

/**
 * (안전) 정렬 컬럼 화이트리스트
 * - 사용자가 임의 컬럼을 넣어도 DB 에러가 나지 않도록 방어
 */
const ALLOWED_SORT_FIELDS = new Set(["createdAt", "score", "id"]);

/**
 * 사장님(ownerId)이 소유한 식당인지 확인
 * - 존재 + 소유 둘 다 만족하면 해당 Restaurant 반환
 * - 없으면 null
 */
export const findRestaurantByIdAndOwnerRepo = async ({
  ownerId,
  restaurantId,
}) => {
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, ownerId },
    select: { id: true, name: true, ownerId: true },
  });
  return restaurant; // null 가능
};

/**
 * 사장님(ownerId)이 소유한 모든 식당들 목록 (id 배열)
 * - restaurantId를 따로 주지 않았을 때 필터링에 사용
 */
export const findOwnedRestaurantIdsRepo = async ({ ownerId }) => {
  const rows = await prisma.restaurant.findMany({
    where: { ownerId },
    select: { id: true },
  });
  return rows.map((r) => r.id);
};

/**
 * 사장님 리뷰 개수 카운트
 * - restaurantId가 있으면: 해당 식당 + 소유자 일치
 * - 없으면: 소유한 모든 식당의 리뷰
 */
export const countBizReviewsRepo = async ({ ownerId, restaurantId }) => {
  const where = restaurantId
    ? { restaurantId, restaurant: { ownerId } }
    : { restaurant: { ownerId } };

  return prisma.review.count({ where });
};

/**
 * 사장님 리뷰 목록 조회
 * - 페이지네이션: skip / take
 * - 정렬: sortBy(desc|asc) (화이트리스트 내 컬럼만 허용)
 * - restaurantId(옵션): 특정 식당만
 * - 포함관계: 작성자, 식당, 사진, 메뉴(이름)까지 최소 정보 제공
 */
export const listBizReviewsRepo = async ({
  ownerId,
  restaurantId, // optional
  skip,
  take,
  sortBy = "createdAt",
  order = "desc",
}) => {
  const safeSortBy = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : "createdAt";
  const where = restaurantId
    ? { restaurantId, restaurant: { ownerId } }
    : { restaurant: { ownerId } };

  const reviews = await prisma.review.findMany({
    where,
    skip,
    take,
    orderBy: { [safeSortBy]: order === "asc" ? "asc" : "desc" },
    select: {
      id: true,
      content: true,
      feedback: true,
      score: true,
      createdAt: true,
      updatedAt: true,
      // 작성자(리뷰어)
      user: {
        select: {
          id: true,
          nickname: true,
          profile: true,
        },
      },
      // 식당
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
      // 리뷰 사진
      reviewPhoto: {
        select: {
          id: true,
          imageName: true,
          leftoverRatio: true,
          createdAt: true,
        },
      },
      // 리뷰에 포함된 메뉴(이름 + 잔반율)
      reviewMenu: {
        select: {
          id: true,
          leftoverRatio: true,
          menu: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return reviews;
};

export const listBizReviewSummariesRepo = async ({
  ownerId,
  restaurantId,
  skip,
  take,
  order, // 'asc' | 'desc'
}) => {
  const where = {
    restaurant: { ownerId }, // 오너 소유 식당 필터
    ...(restaurantId ? { restaurantId } : {}),
  };
  return prisma.review.findMany({
    where,
    select: {
      id: true, // 프론트에 안줘도 되지만 내부 정렬/디버그용
      content: true,
      createdAt: true,
      detailFeedback: true,
      restaurantId: true,
    },
    orderBy: { createdAt: order },
    skip,
    take,
  });
};
