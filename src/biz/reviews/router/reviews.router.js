// src/biz/reviews/router/biz.reviews.router.js
import { Router } from "express";
import { handleListBizReviews } from "../controller/reviews.controller.js"

const router = Router();

// 비동기 에러 핸들링 래퍼 (프로젝트에 공용이 있으면 그걸 쓰면 됨)
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * [GET] 사장님 리뷰 목록 조회
 * - 최종 경로는 앱에서 mount한 basePath에 따라 달라짐
 *   예: app.use('/api/biz/reviews', router) 로 마운트하면 => GET /api/biz/reviews
 *       app.use('/api/biz', router) 로 마운트하면           => GET /api/biz/reviews
 */
router.get("/", wrap(handleListBizReviews));

export default router;
