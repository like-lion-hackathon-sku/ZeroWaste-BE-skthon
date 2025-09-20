// // 위치: src/biz/security/biz.guard.js
// import { StatusCodes } from "http-status-codes";

// /* BIZ 전용 접근 가드 (스키마 기준: USER | BIZ) */
// export function requireRoleBiz(req, res, next) {
//   if (req.user?.role === "BIZ") return next();
//   return res.status(StatusCodes.FORBIDDEN).json({
//     resultType: "FAILURE",
//     error: "FORBIDDEN_BIZ_ONLY",
//     success: null,
//   });
// }

// /* ADMIN 가드 (스키마에 ADMIN 없음 → 항상 403) */
// export function requireRoleAdmin(_req, res) {
//   return res.status(StatusCodes.FORBIDDEN).json({
//     resultType: "FAILURE",
//     error: "FORBIDDEN_ADMIN_ONLY",
//     success: null,
//   });
// }

// /**
//  * 소유자 또는 ADMIN 가드 (임시 비활성)
//  * - 현재 스키마에 Restaurant.ownerId, ADMIN 역할이 없음
//  * - 필요 시 스키마에 ownerId 추가 후 하단 주석 코드로 대체
//  */
// export async function requireOwnerOrAdmin(_req, res) {
//   return res.status(StatusCodes.NOT_IMPLEMENTED).json({
//     resultType: "FAILURE",
//     error: "OWNER_CHECK_NOT_SUPPORTED_YET",
//     success: null,
//   });
// }

// /**
//  * body.restaurantId 기반 소유자 검증 (임시 비활성)
//  */
// export async function requireOwnerFromBodyOrAdmin(req, res, next) {
//   req.params = { ...req.params, restaurantId: req.body?.restaurantId };
//   return requireOwnerOrAdmin(req, res, next);
// }
