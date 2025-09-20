// // 위치: src / biz / restaurants / repository / restaurants.repository.js
// import { PrismaClient } from "../../../generated/prisma/index.js";

// const g = globalThis;
// export const prisma = g.__fwzmPrisma ?? new PrismaClient();
// if (!g.__fwzmPrisma) g.__fwzmPrisma = prisma;

// /**
//  * 생성 트랜잭션:
//  * - restaurant 생성
//  * - businessCert 저장(별도 테이블이 있거나 restaurant 컬럼에 URL 보관)
//  * - 메뉴 다건 생성
//  * - 식당 사진 다건 생성 (TODO: 스키마에 맞춰 테이블/컬럼 조정)
//  */
// export async function createRestaurantWithAssets({
//   ownerUserId,
//   base,
//   businessCert,
//   menus,
//   restaurantPhotos,
// }) {
//   return prisma.$transaction(async (tx) => {
//     // 1) restaurant
//     const restaurant = await tx.restaurants.create({
//       data: {
//         name: base.name,
//         address: base.address,
//         category: base.category,
//         telephone: base.telephone || "",
//         mapx: base.mapx,
//         mapy: base.mapy,
//         // TODO: ownerUserId 저장 위치 결정: restaurants.ownerUserId 컬럼이 있으면 사용
//         // ownerUserId,
//         // TODO: businessCertUrl 컬럼이 있으면 저장
//         // businessCertUrl: businessCert?.path || null,
//         isSponsored: false,
//       },
//       select: { id: true },
//     });

//     // 2) 메뉴
//     if (menus?.length) {
//       await tx.menu.createMany({
//         data: menus.map((m) => ({
//           restaurantId: restaurant.id, // 스키마에 따라 restaurantsId일 수도 있음
//           name: m.name,
//           price: m.price,
//           photoUrl: m.photoUrl || null, // TODO: 컬럼명 확인
//         })),
//       });
//     }

//     // 3) 식당 사진
//     if (restaurantPhotos?.length) {
//       // ⚠️ ERD에 owner용 식당 사진 테이블이 명확치 않음.
//       // restaurantPhoto(가정) 또는 별도 media 테이블을 사용한다면 아래를 맞추세요.
//       // 임시 예시:
//       // await tx.restaurantPhoto.createMany({
//       //   data: restaurantPhotos.map((p) => ({
//       //     restaurantId: restaurant.id,
//       //     imageUrl: p.path,
//       //     createdAt: new Date(),
//       //   })),
//       // });
//     }

//     return { restaurantId: restaurant.id, created: true };
//   });
// }

// export async function updateRestaurantWithAssets({
//   ownerUserId,
//   restaurantId,
//   basePatch,
//   businessCert,
//   menus,
//   restaurantPhotos,
// }) {
//   return prisma.$transaction(async (tx) => {
//     // 소유권 검증이 필요하면 여기에서 검사 (ownerUserId 매칭)
//     // await assertOwned(tx, ownerUserId, restaurantId);

//     // 1) 기본 정보 패치
//     if (Object.values(basePatch).some((v) => v != null)) {
//       await tx.restaurants.update({
//         where: { id: restaurantId },
//         data: {
//           ...(basePatch.name != null ? { name: basePatch.name } : {}),
//           ...(basePatch.address != null ? { address: basePatch.address } : {}),
//           ...(basePatch.category != null
//             ? { category: basePatch.category }
//             : {}),
//           ...(basePatch.telephone != null
//             ? { telephone: basePatch.telephone }
//             : {}),
//           ...(basePatch.mapx != null ? { mapx: basePatch.mapx } : {}),
//           ...(basePatch.mapy != null ? { mapy: basePatch.mapy } : {}),
//           // ...(businessCert ? { businessCertUrl: businessCert.path } : {}),
//         },
//       });
//     }

//     // 2) 메뉴 갱신 정책(간단버전): 기존 전체 삭제 후 재삽입
//     if (menus?.length) {
//       await tx.menu.deleteMany({ where: { restaurantId } });
//       await tx.menu.createMany({
//         data: menus.map((m) => ({
//           restaurantId,
//           name: m.name,
//           price: m.price,
//           photoUrl: m.photoUrl || null,
//         })),
//       });
//     }

//     // 3) 식당 사진 보강 (정책에 맞게: 전체교체/추가만/삭제 등)
//     if (restaurantPhotos?.length) {
//       // TODO: 스키마에 맞춰 교체. 예시(추가만):
//       // await tx.restaurantPhoto.createMany({
//       //   data: restaurantPhotos.map((p) => ({
//       //     restaurantId,
//       //     imageUrl: p.path,
//       //     createdAt: new Date(),
//       //   })),
//       // });
//     }

//     return { restaurantId, updated: true };
//   });
// }

// export async function deleteRestaurantOwned({ ownerUserId, restaurantId }) {
//   // 소유권 검증 후 soft-delete 권장
//   await prisma.restaurants.delete({ where: { id: restaurantId } });
//   return true;
// }

// export async function findOwnedRestaurants({
//   ownerUserId,
//   page = 1,
//   size = 20,
// }) {
//   const take = Math.min(Math.max(Number(size) || 20, 1), 50);
//   const skip = (Math.max(1, Number(page) || 1) - 1) * take;

//   const [total, rows] = await Promise.all([
//     prisma.restaurants.count({
//       // where: { ownerUserId },
//       where: {},
//     }),
//     prisma.restaurants.findMany({
//       // where: { ownerUserId },
//       where: {},
//       orderBy: [{ id: "desc" }],
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

//   return { items: rows, page, size: take, total };
// }

// export async function findOwnedRestaurantDetail({ ownerUserId, restaurantId }) {
//   // where: { id: restaurantId, ownerUserId } 식으로 제한 권장
//   const base = await prisma.restaurant.findUnique({
//     where: { id: restaurantId },
//     select: {
//       id: true,
//       name: true,
//       address: true,
//       category: true,
//       telephone: true,
//       mapx: true,
//       mapy: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });
//   if (!base) return null;

//   const [menus] = await Promise.all([
//     prisma.menu.findMany({
//       where: { restaurantId },
//       select: {
//         id: true,
//         name: true,
//         price: true,
//         photoUrl: true,
//         updatedAt: true,
//       },
//       orderBy: [{ name: "asc" }],
//     }),
//     // prisma.restaurantPhoto.findMany({ where: { restaurantId }, select: { id:true, imageUrl:true, createdAt:true }, orderBy:[{id:"desc"}], take: 50 }),
//   ]);

//   return { ...base, menus /*, photos*/ };
// }
