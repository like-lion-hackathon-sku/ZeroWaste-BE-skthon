// src/reviews/controller/reviews.controller.js

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

// S3 type enum in utils/s3.js: 0=profile, 1=review, 2=restaurant
const TYPE_REVIEW = 1;

/**
 * **[Review]**
 *  **<🕹️ Controller>**
 *  ***handleCreateReviews***
 *  리뷰 생성 (multipart/form-data: images[] + content)
 */
export const handleCreateReviews = async (req, res, next) => {
  /*
  #swagger.summary = '리뷰 생성'
  #swagger.description = '특정 식당에 새로운 리뷰를 작성합니다.'
  #swagger.tags = ['Reviews']
  #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            content: { type: "string", example: "정말 맛있었어요!" },
            images: {
              type: "array",
              items: { type: "string", format: "binary" }
            }
          },
          required: ["content"]
        }
      }
    }
  }
  #swagger.responses[201] = {
    description: '리뷰 작성 성공',
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            restaurantId: { type: "number", example: 10 },
            userId: { type: "number", example: 5 },
            content: { type: "string", example: "정말 맛있었어요!" },
            created_at: { type: "string", example: "2025-09-11T04:12:34.000Z" },
            images: {
              type: "array",
              items: { type: "string" },
              example: ["a1b2c3.jpg", "d4e5f6.png"] // 응답은 파일명 배열
            }
          }
        }
      }
    }
  }
  #swagger.responses[400] = { description: '올바르지 않은 입력 값' }
  #swagger.responses[404] = { description: '식당을 찾을 수 없음' }
*/

  try {
    // 1) 업로드 파일을 S3로 올려 파일명 배열 확보
    const files = Array.isArray(req.files) ? req.files : [];
    const uploadedNames = files.length
      ? await Promise.all(files.map((f) => uploadToS3(f, TYPE_REVIEW)))
      : [];

    // 2) DTO 파싱 (imageKeys를 body에 주입해서 전달)
    const parsed = parseCreateReviewRequest({
      ...req,
      body: { ...req.body, imageKeys: uploadedNames },
    });
    const { userId, restaurantId, content, imageKeys } = parsed;

    // 3) 서비스 호출
    const { review, photos } = await createReviewSvc({
      userId,
      restaurantId,
      content,
      imageKeys,
    });

    // 4) 응답
    return res.status(201).json(mapReview(review, photos));
  } catch (err) {
    return next(err);
  }
};

/**
 * **[Review]**
 *  **<🕹️ Controller>**
 *  ***handleDeleteReviews***
 *  리뷰 삭제
 */
export const handleDeleteReviews = async (req, res, next) => {
  /*
  #swagger.summary = '리뷰 삭제'
  #swagger.description = '내가 작성한 특정 리뷰를 삭제합니다.'
  #swagger.tags = ['Reviews']
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

/**
 * **[Review]**
 *  **<🕹️ Controller>**
 *  ***handleGetMyReviews***
 *  내 리뷰 목록 조회 (페이지네이션)
 */
export const handleGetMyReviews = async (req, res, next) => {
  /*
  #swagger.summary = '내 리뷰 목록 조회'
  #swagger.description = '로그인한 사용자가 작성한 리뷰 목록을 조회합니다.'
  #swagger.tags = ['Reviews']
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
              created_at:{ type:"string", example:"2025-09-11T04:12:34.000Z" },
              images:{ type:"array", items:{ type:"string" } }
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
    return res.status(200).json(reviews.map(mapMyReview));
  } catch (err) {
    return next(err);
  }
};
