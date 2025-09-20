// 위치: src / favorites / dto / response / favorites.response.dto.js

/* 공동 응답 래퍼
 * 모든 API 응답을 `{ resultType, error, success }` 형태로 감쌉니다.
 */
export function wrap(resultType, data = null, error = null) {
  return { resultType, error, success: data };
}

/* 즐겨찾기 목록 조회 응답 생성 */
export function buildListFavoritesResponse(items, page, size, totalCount) {
  return wrap("SUCCESS", { items, page, size, totalCount }, null);
}

/* 즐겨찾기 추가 응답 생성 */
export function buildUpsertFavoriteResponse(row) {
  return wrap("SUCCESS", row, null);
}

/* 즐겨찾기 삭제 응답 생성 */
export function buildRemoveFavoriteResponse() {
  return wrap("SUCCESS", true, null);
}

/* 공통 에러 처리 */
export function buildError(message) {
  return wrap("FAILURE", null, message);
}
