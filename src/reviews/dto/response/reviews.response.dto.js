// ✅ .env에 이미 있는 값만 사용
const BUCKET = process.env.AWS_S3_BUCKET || "";
const REGION = process.env.AWS_REGION || "ap-northeast-2";

// s3.js에서 typeEnum[1] = "review" 로 업로드하므로 기본 prefix는 'review/'
const REVIEW_PREFIX = "review/";

/**
 * **[Reviews]**
 * **<🧺⬆️ Response DTO>**
 * ***toPublicUrl***
 * - 절대 URL이면 그대로 반환
 * - S3 키(파일명)면 S3 퍼블릭 엔드포인트로 조합
 * - 키에 prefix 없으면 기본적으로 'review/'를 붙여줌
 */
export const toPublicUrl = (keyOrUrl, prefix = REVIEW_PREFIX) => {
  if (!keyOrUrl) return "";
  if (/^https?:\/\//i.test(keyOrUrl)) return keyOrUrl;

  const base =
    BUCKET && REGION ? `https://${BUCKET}.s3.${REGION}.amazonaws.com` : "";

  const cleanKey = String(keyOrUrl).replace(/^\/+/, "");
  const fullKey = cleanKey.startsWith(prefix)
    ? cleanKey
    : `${prefix}${cleanKey}`;

  return base ? `${base}/${fullKey}` : fullKey;
};

/**
 * **[Reviews]**
 * **<🧺⬆️ Response DTO>**
 * ***mapReview***
 * 서비스의 { review, photos } 결과를 응답 스펙으로 매핑
 */
export const mapReview = (review, photos = []) => {
  return {
    id: review.id,
    reviewId: review.id,
    restaurantId: review.restaurantId,
    userId: review.userId,
    content: review.content,
    score: review.score,
    feedback: review.feedback ?? null,
    detailFeedback: review.detailFeedback ?? null,
    created_at: review.createdAt, // 프론트 요구: snake_case
    images: photos.map((p) => p.imageName), // 파일명만 전달
    menuId: review.menuId ?? null,
    menuName: review.menu?.name ?? null,
  };
};

/**
 * **[Reviews]**
 * **<🧺⬆️ Response DTO>**
 * ***mapMyReview***
 * 내 리뷰 목록의 각 원소 매핑
 */
export const mapMyReview = (review) => {
  // reviewMenu가 배열일 수 있으니 첫 번째 메뉴만 사용
  let menuId = null;
  let menuName = null;
  if (Array.isArray(review.reviewMenu) && review.reviewMenu.length > 0) {
    const first = review.reviewMenu[0];
    menuId = first?.menuId ?? null;
    menuName = first?.menu?.name ?? null;
  }

  return {
    id: review.id,
    reviewId: review.id,
    restaurantId: review.restaurantId,
    restaurantName: review.restaurantName?.name ?? null, // 식당 이름 추가
    userId: review.userId,
    nickname: review.user?.nickname ?? null,
    content: review.content,
    score: review.score,
    feedback: review.feedback ?? null,
    detailFeedback: review.detailFeedback ?? null,
    created_at: review.createdAt, // 프론트 요구: snake_case
    images: Array.isArray(review.reviewPhoto)
      ? review.reviewPhoto.map((p) => p.imageName) // 파일명만 전달
      : [],
    menuId,
    menuName,
  };
};

/**
 * **[Reviews]**
 * **<🧺⬆️ Response DTO>**
 * ***mapMyReviewsList***
 */
export const mapMyReviewsList = (items, page, size) => ({
  page,
  size,
  items: items.map(mapMyReview),
});
