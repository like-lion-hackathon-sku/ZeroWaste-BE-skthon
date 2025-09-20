// 위치: src / biz / security / biz.guard.js
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "../../generated/prisma/index.js";

/* Prisma 싱글턴 (순환참조 방지 및 커넥션 절약) */
const g = globalThis;
const prisma = g.__fwzmPrisma ?? new PrismaClient();
if (!g.__fwzmPrisma) g.__fwzmPrisma = prisma;

/* 사장님 권한 부여 가드(Admin도 가능) */
export function requireRoleBiz(req, res, next) {
  const role = req.user?.role;
  if (role === "BIZ" || role === "ADMIN") return next();
  return res.status(StatusCodes.FORBIDDEN).json({
    resultType: "FAILURE",
    error: "FORBIDDEN_BIZ_ONLY",
    success: null,
  });
}

/* 🔐 ADMIN 전용 가드 */
export function requireRoleAdmin(req, res, next) {
  if (req.user?.role === "ADMIN") return next();
  return res.status(StatusCodes.FORBIDDEN).json({
    resultType: "FAILURE",
    error: "FORBIDDEN_ADMIN_ONLY",
    success: null,
  });
}

/**
 * 🏪 식당 소유자 또는 ADMIN만 통과
 * - restaurantId는 우선순위로 params → body → query 에서 탐색
 * - 유효하지 않으면 400, 존재하지 않으면 404
 */
export async function requireOwnerOrAdmin(req, res, next) {
  try {
    const raw =
      req.params?.restaurantId ??
      req.body?.restaurantId ??
      req.query?.restaurantId;

    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        resultType: "FAILURE",
        error: "INVALID_RESTAURANT_ID",
        success: null,
      });
    }

    // 식당 기본 정보에서 ownerId만 가져오기
    const r = await prisma.restaurants.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!r) {
      return res.status(StatusCodes.NOT_FOUND).json({
        resultType: "FAILURE",
        error: "RESTAURANT_NOT_FOUND",
        success: null,
      });
    }

    // ADMIN은 패스, 아니면 소유자 비교
    if (req.user?.role === "ADMIN" || r.ownerId === req.user?.id) {
      return next();
    }

    return res.status(StatusCodes.FORBIDDEN).json({
      resultType: "FAILURE",
      error: "FORBIDDEN_NOT_OWNER",
      success: null,
    });
  } catch (e) {
    // 예기치 못한 오류는 next로 전달
    return next(e);
  }
}

/**
 * 🧭 편의 미들웨어: body.restaurantId 기준 소유자 검증
 * - 라우트에서 body에만 식별자가 오는 경우 사용
 */
export async function requireOwnerFromBodyOrAdmin(req, res, next) {
  req.params = {
    ...req.params,
    restaurantId: req.body?.restaurantId,
  };
  return requireOwnerOrAdmin(req, res, next);
}
