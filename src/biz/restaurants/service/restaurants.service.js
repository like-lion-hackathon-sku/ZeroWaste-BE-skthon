// 위치: src / biz / restaurants / service / restaurants.service.js
import { PrismaClient } from "../../../generated/prisma/index.js";

export async function updateMyRestaurant(userId, { id, ...patch }) {
  const target = await prisma.restaurant.findUnique({ where: { id } });
  if (!target) throw new Error("RESTAURANT_NOT_FOUND");
  if (target.ownerId !== userId) throw new Error("FORBIDDEN_NOT_OWNER");

  // 허용 필드만 필터링
  const allow = [
    "name",
    "address",
    "telephone",
    "mapx",
    "mapy",
    "licenseNumber",
    "licenseImageUrl",
    "licenseNote",
  ];
  const data = Object.fromEntries(
    Object.entries(patch).filter(([k]) => allow.includes(k)),
  );

  // 사업자정보 수정 시 상태를 PENDING으로 되돌림
  if ("licenseNumber" in data || "licenseImageUrl" in data) {
    data.licenseStatus = "PENDING";
    data.licenseVerifiedAt = null;
  }

  return await prisma.restaurant.update({ where: { id }, data });
}

export async function deleteMyRestaurant(userId, id) {
  const t = await prisma.restaurant.findUnique({ where: { id } });
  if (!t) throw new Error("RESTAURANT_NOT_FOUND");
  if (t.ownerId !== userId) throw new Error("FORBIDDEN_NOT_OWNER");
  // 소프트 삭제: 제휴 해제만
  return await prisma.restaurant.update({
    where: { id },
    data: { isPartnered: false },
  });
}

export async function listMyRestaurants(userId, { page, size }) {
  const where = { ownerId: userId };
  const [total, rows] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      where,
      skip: (page - 1) * size,
      take: size,
      orderBy: { id: "desc" },
    }),
  ]);
  return { page, size, total, rows };
}

export async function ensureRestaurantByBiz(userId, payload) {
  const {
    name,
    address,
    telephone,
    mapx,
    mapy,
    category,
    licenseNumber,
    licenseImageUrl,
    photos,
  } = payload;

  // 전화+좌표 기준 멱등 확보 (없으면 생성)
  const { restaurantId, created } = await ensureRestaurantByTelephoneAndCoord({
    name,
    address,
    telephone,
    mapx,
    mapy,
    category,
  });

  // 소유자/제휴 & 사업자 정보 업데이트(이미 있던 레코드여도 upsert 느낌)
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      ownerId: userId,
      isPartnered: true,
      licenseNumber: licenseNumber ?? undefined,
      licenseImageUrl: licenseImageUrl ?? undefined,
      licenseStatus: licenseNumber || licenseImageUrl ? "PENDING" : undefined,
    },
  });

  // 사진 저장(선택)
  if (Array.isArray(photos) && photos.length) {
    await prisma.restaurantPhoto.createMany({
      data: photos.map((url) => ({ restaurantId, url })),
    });
  }

  return { restaurantId, created };
}
