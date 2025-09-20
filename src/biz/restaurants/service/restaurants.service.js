import { uploadToS3 } from "../../../utils/s3.js";
import { registerRestaurantResponseDto } from "../dto/response/restaurants.response.dto.js";
import { addRestaurant } from "../repository/restaurants.repository.js";

// 현준 추가
import {
  findRestaurantByIdRepo,
  findBizRestaurantDetailRepo,
  getRestaurantReviewStatsRepo,
  getRestaurantFavoriteCountRepo,
} from "../repository/restaurants.repository.js";
import {
  PermissionDeniedError,
  UnprocessableInputValueError,
} from "../../../error.js";

export const registerRestaurant = async (data) => {
  const restaurantImages = [];
  const menuImages = [];
  for (let image of data.images) {
    restaurantImages.push(await uploadToS3(image, 2));
  }
  for (let image of data.menuImages) {
    menuImages.push(await uploadToS3(image, 3));
  }
  data.restaurantImageNames = restaurantImages;
  data.menuImageNames = menuImages;
  const restaurantId = await addRestaurant(data);
  console.log(restaurantId);
  return registerRestaurantResponseDto(restaurantId);
};

/**
 * 현준 식당 상세 조회
 * **[Restaurants (BIZ)]**
 * **<🧠 Service>**
 * ***getBizRestaurantDetailSvc***
 * - (1) 식당 존재/소유자 확인
 * - (2) 상세 정보 조회 (사진/메뉴/도장혜택)
 * - (3) 리뷰 통계(개수/평균) & 즐겨찾기 수 계산
 * - (4) controller → response.dto에서 쓰기 좋은 형태로 반환
 */
export const getBizRestaurantDetailSvc = async ({ restaurantId, ownerId }) => {
  // 1) 존재/소유자 확인
  const base = await findRestaurantByIdRepo(restaurantId);
  if (!base) {
    throw new UnprocessableInputValueError("존재하지 않는 식당입니다.", {
      restaurantId,
    });
  }
  if (base.ownerId !== ownerId) {
    throw new PermissionDeniedError("해당 식당에 대한 권한이 없습니다.", {
      restaurantId,
      ownerId,
    });
  }

  // 2) 상세 + 3) 통계 병렬
  const [detail, reviewAgg, favoriteCount] = await Promise.all([
    findBizRestaurantDetailRepo({ restaurantId, ownerId }),
    getRestaurantReviewStatsRepo(restaurantId),
    getRestaurantFavoriteCountRepo(restaurantId),
  ]);

  // reviewAgg: {_count:{_all:number}, _avg:{score:number|null}}
  const reviewCount = reviewAgg?._count?._all ?? 0;
  const reviewAvg = reviewAgg?._avg?.score ?? null; // 리뷰 없으면 null

  return {
    restaurant: detail, // include: photos/menu/benefits
    stats: {
      reviewCount,
      reviewAvg, // 리뷰 평균
      favoriteCount, // 즐겨찾기 수
    },
  };
};
