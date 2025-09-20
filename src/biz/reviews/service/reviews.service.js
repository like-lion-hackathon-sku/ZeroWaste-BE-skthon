// src/biz/reviews/service/biz.reviews.service.js
import { PermissionDeniedError } from "../../../error.js";
import {
  findRestaurantByIdAndOwnerRepo,
  countBizReviewsRepo,
  listBizReviewsRepo,
} from "../repository/reviews.repository.js";

import { listBizReviewSummariesRepo } from "../repository/reviews.repository.js";
/**
 * 사장님 리뷰 목록 조회 서비스
 */
export const listBizReviewsSvc = async (p) => {
  const { ownerId, restaurantId, page, size, skip, sortBy, order } = p;

  // 단일 식당이면 소유 검증
  if (restaurantId) {
    const restaurant = await findRestaurantByIdAndOwnerRepo({
      ownerId,
      restaurantId,
    });
    if (!restaurant) {
      throw new PermissionDeniedError("해당 식당에 대한 권한이 없습니다.", {
        ownerId,
        restaurantId,
      });
    }
  }

  // 개수/목록 병렬 조회
  const [total, rows] = await Promise.all([
    countBizReviewsRepo({ ownerId, restaurantId }),
    listBizReviewsRepo({
      ownerId,
      restaurantId,
      skip,
      take: size,
      sortBy,
      order,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / size);

  return {
    meta: { page, size, total, totalPages },
    items: rows,
  };
};

// 요약용
export const listBizReviewSummariesSvc = async (p) => {
  const { ownerId, restaurantId, page, size, skip, order } = p;

  // 오너 검증은 기존 단건검증 로직 쓰고 싶으면 선택적으로 호출(restaurantId 있을 때)
  // if (restaurantId) {
  //   const owned = await findRestaurantByIdAndOwnerRepo({ ownerId, restaurantId });
  //   if (!owned) throw new PermissionDeniedError("해당 식당에 대한 권한이 없습니다.", { ownerId, restaurantId });
  // }

  const [total, rows] = await Promise.all([
    countBizReviewsRepo({ ownerId, restaurantId }),
    listBizReviewSummariesRepo({
      ownerId,
      restaurantId,
      skip,
      take: size,
      order,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / size);
  return { meta: { page, size, total, totalPages }, items: rows };
};
