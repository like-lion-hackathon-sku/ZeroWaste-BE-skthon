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
import { mapReview, mapMyReview } from "../dto/response/reviews.response.dto.js";

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
    type: 'integer',                 // ✅ swagger-autogen에서 꼭 필요
    schema: { type: 'integer' },     // (OAS3 호환용, 있어도 무방)
    example: 1
  }

  #swagger.requestBody = {
    required : true,
    content:{
      "multipart/form-data":{
        schema:{
          type:"object",
          properties:{
            content:{ type:"string", example:"정말 맛있었어요!" },
            score:{ type:"number", example:4.0, minimum:0, maximum:5 },
            images:{ type:"array", items:{ type:"string", format:"binary" } },
            menuIds:{ type:"array", items:{ type:"integer" }, example:[3,7] }
          },
          required:["content","score"]
        }
      }
    }
  }

  #swagger.responses[201] = {
    description: '리뷰 작성 성공',
    content:{ "application/json":{
      schema:{ type:"object", properties:{
        id:{ type:"number", example:1 },
        restaurantId:{ type:"number", example:10 },
        userId:{ type:"number", example:5 },
        content:{ type:"string", example:"정말 맛있었어요!" },
        score:{ type:"number", example:4.0 },
        created_at:{ type:"string", example:"2025-09-11T04:12:34.000Z" },
        images:{ type:"array", items:{ type:"string" }, example:["a1b2c3.jpg","d4e5f6.png"] },
        menuIds:{ type:"array", items:{ type:"integer" }, example:[3,7] }
      }}
    }}
  }

  #swagger.responses[400] = { description: '올바르지 않은 입력 값' }
  #swagger.responses[404] = { description: '식당을 찾을 수 없음' }
*/
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const uploadedNames = files.length
      ? await Promise.all(files.map((f) => uploadToS3(f, TYPE_REVIEW)))
      : [];

    const parsed = parseCreateReviewRequest({ ...req, body: { ...req.body, imageKeys: uploadedNames } });
    const { userId, restaurantId, content, imageKeys, score, detailFeedback, menuIds } = parsed;

    const { review, photos, menuNames } = await createReviewSvc({
      userId,
      restaurantId,
      content,
      imageKeys,
      score,
      detailFeedback,
      menuIds,         // ✅ 전달
    });

    return res.status(201).json(mapReview(review, photos, menuNames)); // ✅ 메뉴 이름 배열 내려줌
  } catch (err) {
    return next(err);
  }
};

export const handleDeleteReviews = async (req, res, next) => {
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
  try {
    const { page, size } = parseGetMyReviews(req);
    const userId = req.payload.id;
    const reviews = await listMyReviewsSvc({ userId, page, size });
    return res.status(200).json(reviews.map(mapMyReview)); // mapMyReview가 메뉴명 포함해서 매핑
  } catch (err) {
    return next(err);
  }
};
