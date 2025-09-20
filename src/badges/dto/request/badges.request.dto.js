import { InvalidInputValueError } from "../../../error.js";

/* 공통: 정수 파서 */
function parsePositiveInt(value, { name, def, min = 1, max } = {}) {
  if (value === undefined || value === null || value === "") return def;
  const n = Number(value);
  if (!Number.isInteger(n)) {
    throw new InvalidInputValueError(`${name} must be an integer`, {
      [name]: value,
    });
  }
  if (n < min)
    throw new InvalidInputValueError(`${name} must be >= ${min}`, {
      [name]: value,
    });
  if (max !== undefined && n > max) {
    throw new InvalidInputValueError(`${name} must be <= ${max}`, {
      [name]: value,
    });
  }
  return n;
}

/* 공통: enum 파서 */
function parseEnum(value, { name, allow } = {}) {
  if (value === undefined || value === null || value === "") return undefined;
  if (!allow.includes(value)) {
    throw new InvalidInputValueError(
      `${name} must be one of: ${allow.join(", ")}`,
      { [name]: value }
    );
  }
  return value;
}

/* 공통: 페이지네이션 계산 */
function makePagination({ page, size }) {
  const take = size;
  const skip = (page - 1) * size;
  return { page, size, skip, take };
}

/** GET /api/badges */
export function parseListBadgesRequest(req) {
  const { type, page, size } = req.query ?? {};
  const parsedType = parseEnum(type, {
    name: "type",
    allow: ["USER", "RESTAURANT"],
  });
  const parsedPage = parsePositiveInt(page, { name: "page", def: 1, min: 1 });
  const parsedSize = parsePositiveInt(size, {
    name: "size",
    def: 20,
    min: 1,
    max: 100,
  });
  return {
    type: parsedType,
    ...makePagination({ page: parsedPage, size: parsedSize }),
  };
}

/** GET /api/badges/me  (인증 미들웨어가 user.id를 보장) */
export function parseListMyBadgesRequest(req) {
  const { page, size } = req.query ?? {};
  const parsedPage = parsePositiveInt(page, { name: "page", def: 1, min: 1 });
  const parsedSize = parsePositiveInt(size, {
    name: "size",
    def: 20,
    min: 1,
    max: 100,
  });
  const userId = req.user?.id ?? null; // authenticateAccessToken이 세팅
  return { userId, ...makePagination({ page: parsedPage, size: parsedSize }) };
}
