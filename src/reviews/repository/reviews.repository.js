// src/reviews/repository/reviews.repository.js
import { prisma } from "../../db.config.js";

/**
 * **[Reviews]**
 * **<📦 Repository>**
 * ***findRestaurantByIdRepo***
 * 특정 식당 ID로 식당 존재 여부를 조회합니다.
 * @param {number} restaurantId - 조회할 식당 ID
 * @returns {Promise<Object|null>} - 식당 객체 또는 null
 */
export const findRestaurantByIdRepo = async (restaurantId) => {
  return prisma.restaurant.findUnique({ where: { id: restaurantId } });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***findReviewByUserAndRestaurantRepo***
 * (사용 안 할 수 있음) 특정 유저가 특정 식당에 작성한 리뷰 존재 여부를 조회합니다.
 * @param {Object} params
 * @param {number} params.userId - 유저 ID
 * @param {number} params.restaurantId - 식당 ID
 * @returns {Promise<Object|null>} - 리뷰 객체(일부 선택 필드) 또는 null
 */
export const findReviewByUserAndRestaurantRepo = async ({
  userId,
  restaurantId,
}) => {
  return prisma.review.findFirst({
    where: { userId, restaurantId },
    select: { id: true },
  });
};

/* ✅ 식당 소속 메뉴 검증: menuIds -> 그 식당의 실제 메뉴만 반환 */
export const findMenusByIdsForRestaurantRepo = async ({ restaurantId, ids }) => {
  if (!ids?.length) return [];
  return prisma.menu.findMany({
    where: { restaurantId, id: { in: ids } },
    select: { id: true, name: true },
  });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***createReviewMenusRepo***
 * 리뷰-메뉴 매핑을 생성합니다. leftoverRatio는 초기값 1로 설정합니다.
 * @param {{ reviewId:number, menuIds:number[] }} params
 * @returns {Promise<{count:number}>}
 */
export const createReviewMenusRepo = async ({ reviewId, menuIds }) => {
  if (!menuIds?.length) return { count: 0 };
  const rows = menuIds.map((menuId) => ({
    reviewId,
    menuId,
    leftoverRatio: 1, // 스키마에 default가 없으므로 초기값으로 1 지정
  }));
  return prisma.reviewMenu.createMany({
    data: rows,
    skipDuplicates: true,
  });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***createReviewRepo***
 * 새 리뷰를 생성합니다.
 * @param {Object} params
 * @param {number} params.userId - 작성자 유저 ID
 * @param {number} params.restaurantId - 식당 ID
 * @param {string} params.content - 리뷰 내용
 * @param {number} params.score - 평점(0~5) ※ 스키마상 필수
 * @returns {Promise<Object>} - 생성된 리뷰 객체(선택 필드 포함)
 */
export const createReviewRepo = async ({
  userId,
  restaurantId,
  content,
  score,
  detailFeedback = null,
}) => {
  return prisma.review.create({
    data: {
      userId,
      restaurantId,
      content,
      score,
      detailFeedback,
    },
    select: {
      id: true,
      userId: true,
      restaurantId: true,
      content: true,
      score: true,
      detailFeedback: true,
      createdAt: true,
    },
  });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***createReviewPhotosByKeysRepo***
 * 리뷰에 대한 이미지들을 파일명(=S3 키) 기반으로 다건 생성합니다.
 * @param {Object} params
 * @param {number} params.reviewId - 리뷰 ID
 * @param {string[]} params.imageKeys - 파일명 배열
 * @returns {Promise<{count:number}>} - 생성 건수
 */
export const createReviewPhotosByKeysRepo = async ({ reviewId, imageKeys }) => {
  if (!imageKeys?.length) return { count: 0 };
  const rows = imageKeys.map((name) => ({ reviewId, imageName: name }));
  return prisma.reviewPhoto.createMany({ data: rows, skipDuplicates: true });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***listPhotosByReviewIdRepo***
 * 특정 리뷰에 연결된 이미지 목록을 조회합니다.
 * @param {number} reviewId - 리뷰 ID
 * @returns {Promise<Array<{id:number,imageName:string,createdAt:Date}>>} - 이미지 목록
 */
export const listPhotosByReviewIdRepo = async (reviewId) => {
  return prisma.reviewPhoto.findMany({
    where: { reviewId },
    select: { id: true, imageName: true, createdAt: true },
    orderBy: { id: "asc" },
  });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***findReviewByIdRepo***
 * 리뷰 ID로 단일 리뷰를 조회합니다.
 * @param {number} reviewId - 리뷰 ID
 * @returns {Promise<Object|null>} - 리뷰 객체 또는 null
 */
export const findReviewByIdRepo = async (reviewId) => {
  return prisma.review.findUnique({ where: { id: reviewId } });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***deleteReviewRepo***
 * 특정 리뷰를 삭제합니다. (권한 체크는 서비스 레이어에서 수행 권장)
 * @param {number} reviewId - 삭제할 리뷰 ID
 * @returns {Promise<Object>} - 삭제된 리뷰 객체
 */
export const deleteReviewRepo = async (reviewId) => {
  return prisma.review.delete({
    where: { id: reviewId },
    select: {
      id: true,
      userId: true,
      restaurantId: true,
      content: true,
      score: true,
      createdAt: true,
    },
  });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***addPhotosToReviewRepo***
 * 특정 리뷰에 이미지를 추가합니다. (파일명 배열 기반)
 * @param {Object} params
 * @param {number} params.reviewId - 리뷰 ID
 * @param {string[]} params.imageKeys - 추가할 파일명 배열
 * @returns {Promise<{count:number}>} - 추가 건수
 */
export const addPhotosToReviewRepo = async ({ reviewId, imageKeys }) => {
  if (!imageKeys?.length) return { count: 0 };
  const rows = imageKeys.map((name) => ({ reviewId, imageName: name }));
  return prisma.reviewPhoto.createMany({ data: rows, skipDuplicates: true });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***removePhotosFromReviewRepo***
 * 특정 리뷰에서 이미지를 삭제합니다. (reviewPhoto.id 배열 기반)
 * @param {Object} params
 * @param {number} params.reviewId - 리뷰 ID
 * @param {number[]} params.photoIds - 삭제할 reviewPhoto.id 배열
 * @returns {Promise<{count:number}>} - 삭제 건수
 */
export const removePhotosFromReviewRepo = async ({ reviewId, photoIds }) => {
  if (!photoIds?.length) return { count: 0 };
  return prisma.reviewPhoto.deleteMany({
    where: { reviewId, id: { in: photoIds } },
  });
};

/**
 * **[Reviews]**
 * **<🗄️ Repository>**
 * ***listMyReviewsRepo***
 * 특정 유저가 작성한 리뷰 목록을 페이지네이션하여 조회합니다.
 * @param {Object} params
 * @param {number} params.userId - 유저 ID
 * @param {number} params.page - 페이지 번호
 * @param {number} params.size - 페이지 크기
 * @returns {Promise<Array<Object>>} - 리뷰 목록 배열(사진/작성자 닉네임 포함)
 */
export const listMyReviewsRepo = async ({ userId, page, size }) => {
  const skip = (page - 1) * size;
  return prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: size,
    include: {
      reviewPhoto: {
        select: { id: true, imageName: true, createdAt: true },
        orderBy: { id: "asc" },
      },
      // 메뉴명 포함
      reviewMenu: {
        include: { menu: { select: { name: true } } },
      },
      user: { select: { nickname: true } },
    },
  });
};
