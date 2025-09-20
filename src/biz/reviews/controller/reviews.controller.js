// src/biz/reviews/controller/biz.reviews.controller.js
import { StatusCodes } from "http-status-codes";
import {
  parseBizListReviewsQuery,
  parseBizListReviewSummariesQuery,
} from "../dto/request/reviews.request.dto.js";
import {
  listBizReviewsSvc,
  listBizReviewSummariesSvc,
} from "../service/reviews.service.js";
import {
  mapBizReviewsList,
  mapBizReviewSummariesArray, // ✅ 배열만 반환하는 매퍼
} from "../dto/response/reviews.response.dto.js";

/**
 * **[Biz Reviews]**
 * **<🕹️ Controller>**
 * ***handleListBizReviews***
 * 사장님이 소유한 식당들의 리뷰 목록 조회
 * - GET /api/biz/reviews?restaurantId=&page=&size=&sortBy=&order=
 */
export const handleListBizReviews = async (req, res, next) => {
  /*
    #swagger.summary = '사장님 리뷰 목록 조회'
    #swagger.description = '사장님이 소유한 식당 리뷰를 페이지네이션으로 조회합니다.'
    #swagger.tags = ['Reviews']

    #swagger.parameters['restaurantId'] = {
      in: 'query', required: false, schema: { type: 'integer', example: 12 },
      description: '특정 식당만 필터링(선택)'
    }
    #swagger.parameters['page'] = {
      in: 'query', required: false, schema: { type: 'integer', example: 1 },
      description: '1부터 시작하는 페이지 번호(기본값 1)'
    }
    #swagger.parameters['size'] = {
      in: 'query', required: false, schema: { type: 'integer', example: 10 },
      description: '페이지당 개수(기본값 10, 최대 50)'
    }
    #swagger.parameters['sortBy'] = {
      in: 'query', required: false,
      schema: { type: 'string', enum: ['createdAt','score','id'], example: 'createdAt' },
      description: '정렬 컬럼(기본값 createdAt)'
    }
    #swagger.parameters['order'] = {
      in: 'query', required: false,
      schema: { type: 'string', enum: ['asc','desc'], example: 'desc' },
      description: '정렬 방향(기본값 desc)'
    }

    #swagger.responses[200] = {
      description: '사장님 리뷰 목록 조회 성공',
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              meta: {
                type: "object",
                properties: {
                  page: { type: "integer", example: 1 },
                  size: { type: "integer", example: 10 },
                  total: { type: "integer", example: 37 },
                  totalPages: { type: "integer", example: 4 }
                }
              },
              reviews: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer", example: 101 },
                    restaurant: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 12 },
                        name: { type: "string", example: "숭례도담" }
                      }
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer", example: 5 },
                        nickname: { type: "string", example: "현준" },
                        profile: { type: "string", nullable: true, example: "profile.jpg" }
                      }
                    },
                    content: { type: "string", example: "맛있고 잔반 없이 먹었어요!" },
                    feedback: { type: "string", nullable: true, example: null },
                    score: { type: "number", example: 4.5 },
                    photos: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 301 },
                          imageName: { type: "string", example: "r_101_1.jpg" },
                          leftoverRatio: { type: "number", example: 0.1 },
                          createdAt: { type: "string", example: "2025-09-20T12:34:56.000Z" }
                        }
                      }
                    },
                    menus: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer", example: 41 },
                          name: { type: "string", example: "김치찌개" },
                          leftoverRatio: { type: "number", example: 0.2 }
                        }
                      }
                    },
                    createdAt: { type: "string", example: "2025-09-20T12:34:56.000Z" },
                    updatedAt: { type: "string", nullable: true, example: "2025-09-20T14:12:00.000Z" }
                  }
                }
              }
            }
          }
        }
      }
    }
    #swagger.responses[400] = { description: '잘못된 요청 파라미터' }
    #swagger.responses[401] = { description: '로그인 필요' }
  */

  try {
    const query = parseBizListReviewsQuery(req);
    const svcResult = await listBizReviewsSvc(query);
    const response = mapBizReviewsList(svcResult);
    return res.status(StatusCodes.OK).json(response);
  } catch (err) {
    return next(err);
  }
};

/**
 * **[Biz Reviews]**
 * **<🕹️ Controller>**
 * ***handleListBizReviewSummaries***
 * content/created_at만 반환하는 요약 목록
 * - GET /api/biz/reviews/summaries?restaurantId=&page=&size=&order=
 */
export const handleListBizReviewSummaries = async (req, res, next) => {
  /*
    #swagger.summary = '사장님 리뷰 요약 목록'
    #swagger.description = '각 리뷰의 content, created_at만 배열로 반환합니다.'
    #swagger.tags = ['Reviews']
    #swagger.parameters['restaurantId'] = { in:'path', required:true, schema:{ type:'integer', example: 12 } }    #swagger.parameters['page']        = { in:'query', required:false, schema:{ type:'integer', example: 1 } }
    #swagger.parameters['size']        = { in:'query', required:false, schema:{ type:'integer', example: 10 } }
    #swagger.parameters['order']       = { in:'query', required:false, schema:{ type:'string', enum:['asc','desc'], example:'desc' } }
    #swagger.responses[200] = {
      description: '요약 목록 반환(배열)',
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: {
              type: "object",
              properties: {
                content:     { type: "string", example: "맛있었어요!" },
                created_at:  { type: "string", example: "2025-09-20T12:34:56.000Z" }
                detail_feedback: { type: "string", nullable: true, example: "반찬이 조금 짰어요."}
              }
            }
          }
        }
      }
    }
    #swagger.responses[401] = { description: '로그인 필요' }
  */
  try {
    const q = parseBizListReviewSummariesQuery(req);
    const svc = await listBizReviewSummariesSvc(q);
    // ✅ meta 제거, 배열만 반환
    const reviewsOnly = mapBizReviewSummariesArray(svc);
    return res.status(StatusCodes.OK).json(reviewsOnly);
  } catch (e) {
    return next(e);
  }
};
