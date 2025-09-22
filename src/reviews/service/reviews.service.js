// src/reviews/service/reviews.service.js
import { prisma } from "../../db.config.js";
import {
  findRestaurantByIdRepo,
  createReviewRepo,
  createReviewPhotosByKeysRepo,
  listPhotosByReviewIdRepo,
  findReviewByIdRepo,
  listMyReviewsRepo,
} from "../repository/reviews.repository.js";
import { deleteFromS3 } from "../../utils/s3.js";
import { eventEmitter } from "../../index.js"; // ⭐ 스탬프 이벤트 사용

/* =========================
 * 도메인 전용 에러 클래스
 * ========================= */
class RestaurantNotFoundError extends Error {
  constructor(message = "식당을 찾을 수 없습니다.", meta = {}) {
    super(message);
    this.name = "RestaurantNotFoundError";
    this.statusCode = 404;
    this.errorCode = "R404";
    this.meta = meta;
  }
}

class ReviewNotFoundError extends Error {
  constructor(message = "리뷰를 찾을 수 없습니다.", meta = {}) {
    super(message);
    this.name = "ReviewNotFoundError";
    this.statusCode = 404;
    this.errorCode = "V404";
    this.meta = meta;
  }
}

class ForbiddenReviewEditError extends Error {
  constructor(message = "본인 리뷰만 삭제할 수 있습니다.", meta = {}) {
    super(message);
    this.name = "ForbiddenReviewEditError";
    this.statusCode = 403;
    this.errorCode = "V403";
    this.meta = meta;
  }
}

class S3DeleteError extends Error {
  constructor(
    message = "이미지 삭제에 실패했습니다. 다시 시도해 주세요.",
    meta = {}
  ) {
    super(message);
    this.name = "S3DeleteError";
    this.statusCode = 502;
    this.errorCode = "S3_502";
    this.meta = meta;
  }
}

/**
 * **[Reviews]**
 * **<🧠 Service>**
 * ***createReviewSvc***
 * 리뷰 생성 → 이미지 파일명 저장 → 사진 목록 포함 반환
 * (동일 식당에 대한 중복 리뷰 허용)
 * @param {{ userId:number, restaurantId:number, content:string, imageKeys?:string[], score:number }} params
 * @returns {Promise<{review:Object, photos:Array}>}
 */
export const createReviewSvc = async ({
  userId,
  restaurantId,
  content,
  imageKeys = [],
  score, // ⭐ 필수 (0~5)
  detailFeedback = null,
}) => {
  // 1) 식당 존재 확인
  const restaurant = await findRestaurantByIdRepo(restaurantId);
  if (!restaurant) {
    throw new RestaurantNotFoundError(undefined, { restaurantId });
  }

  // 2) 리뷰 생성 (content + score)
  const created = await createReviewRepo({
    userId,
    restaurantId,
    content,
    score,
    detailFeedback,
  });

  // 3) 이미지(파일명) 저장
  if (imageKeys.length) {
    await createReviewPhotosByKeysRepo({ reviewId: created.id, imageKeys });
  }

  // 4) 4.0 이상이면 스탬프 적립 이벤트 발행
  if (typeof score === "number" && score >= 4) {
    // 필요 시 reviewId까지 함께 전달
    eventEmitter.emit("REQUEST_ADD_STAMP", {
      userId,
      restaurantId,
    });
  }

  // 5) 사진 목록 조회
  const photos = await listPhotosByReviewIdRepo(created.id);

  return { review: created, photos };
};

/**
 * **[Reviews]**
 * **<🧠 Service>**
 * ***deleteReviewWithFilesSvc***
 * S3의 모든 리뷰 이미지 삭제 성공 시에만 DB에서 ReviewPhoto → Review 순으로 삭제
 * (사진과 리뷰 글 **동시에** 삭제 규칙)
 * @param {{ userId:number, reviewId:number }} params
 * @returns {Promise<{id:number}>}
 */
export const deleteReviewWithFilesSvc = async ({ userId, reviewId }) => {
  // 1) 존재/소유권 확인
  const review = await findReviewByIdRepo(reviewId);
  if (!review) throw new ReviewNotFoundError(undefined, { reviewId });
  if (review.userId !== userId) {
    throw new ForbiddenReviewEditError(undefined, {
      userId,
      reviewUserId: review.userId,
      reviewId,
    });
  }

  // 2) 현재 사진 목록
  const photos = await listPhotosByReviewIdRepo(reviewId); // [{ id, imageName }, ...]

  // 3) S3에서 먼저 모두 삭제 (하나라도 실패하면 전체 실패)
  const TYPE_REVIEW = 1;
  if (photos.length) {
    const results = await Promise.allSettled(
      photos.map((p) => deleteFromS3(p.imageName, TYPE_REVIEW))
    );
    const failed = results.find((r) => r.status === "rejected");
    if (failed) {
      throw new S3DeleteError(undefined, {
        reviewId,
        failedItems: results
          .map((r, i) => ({ idx: i, status: r.status }))
          .filter((x) => x.status === "rejected"),
      });
    }
  }

  // 4) DB에서 사진 → 리뷰 순서로 원자적 삭제
  const deleted = await prisma.$transaction(async (tx) => {
    await tx.reviewPhoto.deleteMany({ where: { reviewId } });
    return tx.review.delete({
      where: { id: reviewId },
      select: { id: true },
    });
  });

  return deleted; // { id }
};

/**
 * **[Reviews]**
 * **<🧠 Service>**
 * ***listMyReviewsSvc***
 * 내 리뷰 목록(페이지네이션)
 * @param {{ userId:number, page:number, size:number }} params
 * @returns {Promise<Array<Object>>}
 */
export const listMyReviewsSvc = async ({ userId, page, size }) => {
  return listMyReviewsRepo({ userId, page, size });
};
