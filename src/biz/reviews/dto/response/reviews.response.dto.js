// src/biz/reviews/dto/response/biz.reviews.response.dto.js

/**
 * 단일 리뷰 매핑
 */
export const mapBizReview = (r) => ({
  id: r.id,
  restaurant: r.restaurant
    ? { id: r.restaurant.id, name: r.restaurant.name }
    : null,
  user: r.user
    ? { id: r.user.id, nickname: r.user.nickname, profile: r.user.profile }
    : null,
  content: r.content,
  feedback: r.feedback ?? null,
  score: r.score,
  photos: (r.reviewPhoto ?? []).map((p) => ({
    id: p.id,
    imageName: p.imageName,
    leftoverRatio: p.leftoverRatio,
    createdAt: p.createdAt,
  })),
  menus: (r.reviewMenu ?? []).map((m) => ({
    id: m.id,
    name: m.menu?.name ?? null,
    leftoverRatio: m.leftoverRatio,
  })),
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

/**
 * 목록 응답 매핑
 * @param {{meta:{page:number,size:number,total:number,totalPages:number}, items:any[]}} svcResult
 */
export const mapBizReviewsList = (svcResult) => ({
  meta: svcResult.meta,
  reviews: svcResult.items.map(mapBizReview),
});

// 요약용
export const mapBizReviewSummary = (r) => ({
  content: r.content,
  created_at: r.createdAt,
  detail_feedback: r.detailFeedback ?? null,
});

// ⬇️ 추가: 배열만 반환하는 매퍼
export const mapBizReviewSummariesArray = (svcResult) =>
  svcResult.items.map(mapBizReviewSummary);
