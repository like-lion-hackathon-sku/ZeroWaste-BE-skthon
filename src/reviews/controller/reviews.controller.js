import { uploadToS3 } from "../../utils/s3.js";
import {
  parseCreateReviewRequest,
  parseDeleteMyReviews,
  parseGetMyReviews,
} from "../dto/request/reviews.request.dto.js";
import {
  createReviewSvc,
  deleteReviewWithFilesSvc,
  listMyReviewsSvc,
} from "../service/reviews.service.js";
import {
  mapReview,
  mapMyReview,
} from "../dto/response/reviews.response.dto.js";

const TYPE_REVIEW = 1;

export const handleCreateReviews = async (req, res, next) => {
  /*
    #swagger.summary = '리뷰 생성'
    #swagger.description = '특정 식당에 새로운 리뷰를 작성합니다.'
    #swagger.tags = ['Reviews']

    #swagger.parameters['id'] = {
      in: 'path',
      required: true,
      description: '식당 ID (URL 경로 파라미터)',
      type: 'integer',
      example: 1
    }

    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              content: { type: "string", example: "정말 맛있었어요!" },
              score:   { type: "number", example: 4.0, minimum: 0, maximum: 5 },
              images:  { type: "array", items: { type: "string", format: "binary" } },
              menuId:  { type: "integer", example: 3 }
            },
            required: ["content", "score"]
          }
        }
      }
    }

    #swagger.responses[201] = {
      description: '리뷰 작성 성공',
      content: { "application/json": { schema: {
        type: "object",
        properties: {
          id:           { type: "number", example: 1 },
          restaurantId: { type: "number", example: 10 },
          userId:       { type: "number", example: 5 },
          content:      { type: "string", example: "정말 맛있었어요!" },
          score:        { type: "number", example: 4.0 },
          created_at:   { type: "string", example: "2025-09-11T04:12:34.000Z" },
          images:       { type: "array", items: { type: "string" }, example: ["a1b2c3.jpg","d4e5f6.png"] },
          menuId:       { type: "integer", example: 3 }
        }
      }}}
    }
  */
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const uploadedNames = files.length
      ? await Promise.all(files.map((f) => uploadToS3(f, TYPE_REVIEW)))
      : [];

    const parsed = parseCreateReviewRequest({
      ...req,
      body: { ...req.body, imageKeys: uploadedNames },
    });
    const {
      userId,
      restaurantId,
      content,
      imageKeys,
      score,
      detailFeedback,
      menuId, // ✅ 단일 메뉴 아이디
    } = parsed;

    const { review, photos } = await createReviewSvc({
      userId,
      restaurantId,
      content,
      imageKeys,
      score,
      detailFeedback,
      menuId,
    });

    return res.status(201).json(mapReview(review, photos, menuId)); // ✅ 메뉴명 배열 제거, mapReview는 menuId만 포함
  } catch (err) {
    return next(err);
  }
};

export const handleDeleteReviews = async (req, res, next) => {
  /*
    #swagger.summary = '리뷰 삭제'
    #swagger.description = '내가 작성한 특정 리뷰를 삭제합니다.'
    #swagger.tags = ['Reviews']

    #swagger.parameters['reviewId'] = {
      in: 'path',
      required: true,
      schema: { type: 'integer', example: 1 },
      description: '리뷰 ID (URL 경로 파라미터)'
    }

    #swagger.responses[204] = { description: '리뷰 삭제 성공 (No Content)' }
    #swagger.responses[403] = { description: '본인 리뷰가 아님' }
    #swagger.responses[404] = { description: '리뷰를 찾을 수 없음' }
  */
  try {
    const { reviewId } = parseDeleteMyReviews(req);
    const userId = req.payload.id;
    await deleteReviewWithFilesSvc({ userId, reviewId });
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

export const handleGetMyReviews = async (req, res, next) => {
  /*
    #swagger.summary = '내 리뷰 목록 조회'
    #swagger.description = '로그인한 사용자가 작성한 리뷰 목록을 조회합니다.'
    #swagger.tags = ['Reviews']

    #swagger.parameters['page'] = {
      in: 'query', required: false, schema: { type: 'integer', example: 1 }
    }
    #swagger.parameters['size'] = {
      in: 'query', required: false, schema: { type: 'integer', example: 10 }
    }

    #swagger.responses[200] = {
      description: '내 리뷰 목록 조회 성공',
      content:{
        "application/json":{
          schema:{
            type:"array",
            items:{
              type:"object",
              properties:{
                id:{ type:"number", example:1 },
                restaurantId:{ type:"number", example:10 },
                userId:{ type:"number", example:5 },
                nickname:{ type:"string", example:"현준" },
                content:{ type:"string", example:"맛있었어요." },
                score:{ type:"number", example:4.0 },
                created_at:{ type:"string", example:"2025-09-11T04:12:34.000Z" },
                images:{ type:"array", items:{ type:"string" }, example:["a1b2c3.jpg"] },
                menuId:{ type:"integer", example:3 } // ✅ 응답에도 menuId 포함
              }
            }
          }
        }
      }
    }
  */
  try {
    const { page, size } = parseGetMyReviews(req);
    const userId = req.payload.id;
    const reviews = await listMyReviewsSvc({ userId, page, size });
    return res.status(200).json(reviews.map(mapMyReview)); // mapMyReview는 menuId 포함
  } catch (err) {
    return next(err);
  }
};
