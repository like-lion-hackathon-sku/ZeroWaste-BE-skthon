// // src / biz / restaurants / service / restaurants.service.js
// import { PrismaClient } from "../../../generated/prisma/index.js";

// const g = globalThis;
// export const prisma = g.__fwzmPrisma ?? new PrismaClient();
// if (!g.__fwzmPrisma) g.__fwzmPrisma = prisma;

// /* 수정 (현재 소유자 검증 불가: 스키마에 ownerId 없음) */
// export async function updateMyRestaurant(userId, { id, ...patch }) {
//   const target = await prisma.restaurant.findUnique({
//     where: { id: Number(id) },
//   });
//   if (!target) throw new Error("RESTAURANT_NOT_FOUND");

//   const allow = ["name", "address", "telephone", "mapx", "mapy", "category"];
//   const data = Object.fromEntries(
//     Object.entries(patch).filter(
//       ([k, v]) => allow.includes(k) && v !== undefined,
//     ),
//   );

//   return prisma.restaurant.update({ where: { id: Number(id) }, data });
// }

// /* 삭제 */
// export async function deleteMyRestaurant(userId, id) {
//   const t = await prisma.restaurant.findUnique({ where: { id: Number(id) } });
//   if (!t) throw new Error("RESTAURANT_NOT_FOUND");
//   await prisma.restaurant.delete({ where: { id: Number(id) } });
//   return { deleted: true };
// }

// /* 목록 (현재는 모든 식당; 소유자 필터 불가) */
// export async function listMyRestaurants(userId, { page, size }) {
//   const take = Math.min(Math.max(Number(size) || 20, 1), 50);
//   const skip = (Math.max(1, Number(page) || 1) - 1) * take;

//   const [total, rows] = await Promise.all([
//     prisma.restaurant.count(),
//     prisma.restaurant.findMany({
//       orderBy: { id: "desc" },
//       skip,
//       take,
//       select: {
//         id: true,
//         name: true,
//         address: true,
//         category: true,
//         telephone: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     }),
//   ]);

//   return { page: Number(page), size: take, total, items: rows };
// }

// /* 상세 */
// export async function getMyRestaurantDetail(id) {
//   const base = await prisma.restaurant.findUnique({
//     where: { id: Number(id) },
//     include: {
//       menu: true, // name, photo
//       restaurantPhoto: true, // photoName
//     },
//   });
//   if (!base) throw new Error("RESTAURANT_NOT_FOUND");
//   return base;
// }

// /* 등록(멱등) */
// export async function ensureRestaurantByBiz(userId, payload) {
//   const {
//     name,
//     address,
//     telephone = "",
//     mapx = null,
//     mapy = null,
//     category,
//   } = payload;

//   // 간단한 멱등 기준: (name + address) → 없으면 (telephone)로 재시도
//   let found = await prisma.restaurant.findFirst({ where: { name, address } });
//   if (!found && telephone) {
//     found = await prisma.restaurant.findFirst({ where: { telephone } });
//   }
//   if (found) return { restaurantId: found.id, created: false };

//   const created = await prisma.restaurant.create({
//     data: { name, address, telephone, mapx, mapy, category },
//     select: { id: true },
//   });
//   return { restaurantId: created.id, created: true };
// }

// /* 네이버 로컬 검색 */
// export async function searchRestaurantCandidates({ q, limit = 7 }) {
//   if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
//     throw new Error("NAVER API credentials missing");
//   }
//   const url = new URL("https://openapi.naver.com/v1/search/local.json");
//   url.searchParams.set("query", q);
//   url.searchParams.set(
//     "display",
//     String(Math.min(Math.max(Number(limit) || 7, 1), 30)),
//   );

//   const res = await fetch(url.toString(), {
//     headers: {
//       "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
//       "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
//     },
//   });
//   if (!res.ok)
//     throw new Error(`Naver API error: ${res.status} ${await res.text()}`);

//   const data = await res.json();
//   const items = Array.isArray(data.items) ? data.items : [];

//   return items.map((it) => ({
//     name: (it.title || "").replace(/<\/?b>/g, ""),
//     telephone: it.telephone || "",
//     address: it.roadAddress || it.address || "",
//     addressRoad: it.roadAddress || "",
//     addressJibun: it.address || "",
//     mapx: it.mapx ? Number(it.mapx) : null,
//     mapy: it.mapy ? Number(it.mapy) : null,
//   }));
// }
