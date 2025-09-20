import { Router } from "express";
import {
  searchRestaurantsCtrl,
  getRestaurantDetailCtrl,
  handleGetRestaurantReviews,
} from "../controller/restaurants.controller.js";
import { identifyAccessToken } from "../../auth/middleware/auth.middleware.js";

const r = Router({ mergeParams: true });

/* restaurantId 파라미터 검증 미들웨어
 * restaurantId가 숫자가 아닐경우 404 반환
 */
function onlyDigits404(req, res, next) {
  const { restaurantId } = req.params;
  if (restaurantId !== undefined && !/^\d+$/.test(String(restaurantId))) {
    return res
      .status(404)
      .json({ resultType: "FAILURE", error: "NOT_FOUND", success: null });
  }
  next();
}

/* 주변 식당 검색 라우터
 * GET /api/restaurants/nearby
 */
r.get(
  "/nearby",
  /*
    #swagger.tags = ['Restaurants']
    #swagger.summary = '주변 식당 검색'
    #swagger.description = '지도의 bbox(경계 영역)와 카테고리, 페이지 정보를 기준으로 식당 목록을 조회합니다.'
    #swagger.parameters['bbox'] = {
      in: 'query',
      required: true,
      type: 'string',
      description: '검색 영역 (예: "126.97,37.55,126.99,37.57")'
    }
    #swagger.parameters['category'] = {
      in: 'query',
      type: 'string',
      description: '식당 카테고리 (예: KOREAN, JAPANESE, CAFE)'
    }
    #swagger.parameters['page'] = {
      in: 'query',
      type: 'integer',
      default: 1,
      description: '페이지 번호'
    }
    #swagger.parameters['size'] = {
      in: 'query',
      type: 'integer',
      default: 20,
      description: '페이지 크기'
    }
    #swagger.responses[200] = {
      description: '주변 식당 목록',
      schema: {
        resultType: "SUCCESS",
        error: null,
        success: {
          page: 1,
          size: 20,
          total: 100,
          items: [
            { id: 1, name: "맛집", category: "KOREAN", address: "서울시 ..." }
          ]
        }
      }
    }
  */
  searchRestaurantsCtrl,
);

/* 식당 상세 조회 라우터
 * GET /api/restaurants/:restaurantId/detail
 */
r.get(
  "/:restaurantId/detail",
  onlyDigits404,
  identifyAccessToken,
  /*
    #swagger.tags = ['Restaurants']
    #swagger.summary = '식당 상세 조회'
    #swagger.description = '특정 식당의 상세 정보를 조회합니다.'
    #swagger.parameters['restaurantId'] = {
      in: 'path',
      required: true,
      type: 'integer',
      description: '식당 ID'
    }
    #swagger.responses[200] = {
      description: '식당 상세 정보',
      schema: {
        resultType: "SUCCESS",
        error: null,
        success: {
          id: 1,
          name: "맛집",
          category: "KOREAN",
          address: "서울시 ...",
          telephone: "010-1234-5678",
          feedback: "",
          reviewCount: 12,
          favoriteCount: 5,
          isMyFavorite: true,
          photos: ["photo1.jpg"],
          menus: [{ id: 1, name: "비빔밥", photo: "menu1.jpg" }]
        }
      }
    }
  */
  getRestaurantDetailCtrl,
);

/* 식당 리뷰 조회 라우터
 * GET /api/restaurants/:restaurantId/reviews
 */
r.get(
  "/:restaurantId/reviews",
  onlyDigits404,
  identifyAccessToken,
  /*
    #swagger.tags = ['Restaurants']
    #swagger.summary = '식당 리뷰 목록 조회'
    #swagger.description = '특정 식당의 리뷰 목록을 조회합니다.'
    #swagger.parameters['restaurantId'] = {
      in: 'path',
      required: true,
      type: 'integer',
      description: '식당 ID'
    }
    #swagger.parameters['page'] = {
      in: 'query',
      type: 'integer',
      default: 1,
      description: '페이지 번호'
    }
    #swagger.parameters['size'] = {
      in: 'query',
      type: 'integer',
      default: 20,
      description: '페이지 크기'
    }
    #swagger.parameters['orderBy'] = {
      in: 'query',
      type: 'string',
      enum: ['LATEST', 'HIGH_SCORE', 'LOW_SCORE'],
      default: 'LATEST',
      description: '정렬 기준'
    }
    #swagger.responses[200] = {
      description: '리뷰 목록',
      schema: {
        resultType: "SUCCESS",
        error: null,
        success: {
          page: 1,
          size: 20,
          total: 40,
          items: [
            {
              id: 1,
              userId: 5,
              nickname: "홍길동",
              content: "맛있어요!",
              leftoverRate: 10,
              createdAt: "2025-09-20T12:00:00Z",
              images: ["review1.jpg"],
              isMine: true
            }
          ]
        }
      }
    }
  */
  handleGetRestaurantReviews,
);

export default r;
