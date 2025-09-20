import { prisma } from "../../../db.config.js";
export const addRestaurant = async (data) => {
  return await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: data.name,
        category: data.category,
        address: data.address,
        telephone: data.telephone,
        mapx: data.mapx,
        mapy: data.mapy,
        ownerId: data.ownerId,
      },
    });
    await tx.restaurantPhoto.createMany({
      data: data.restaurantImageNames.map((item) => {
        return {
          restaurantId: restaurant.id,
          photoName: item,
        };
      }),
    });
    const menu = data.menuImageNames.map((item) => {
      return {
        restaurantId: restaurant.id,
        photo: item,
      };
    });

    for (let i = 0; i < data.menuMetadatas.length; i++) {
      console.log(i);
      menu[i] = {
        restaurantId: menu.at(i).restaurantId,
        photo: menu.at(i).photo,
        name: data.menuMetadatas.at(i),
      };
    }
    await tx.menu.createMany({
      data: menu,
    });
    await tx.stampReward.createMany({
      data: data.benefits.map((item) => {
        return {
          restaurantId: restaurant.id,
          condition: item.condition,
          reward: item.reward,
        };
      }),
    });
    return restaurant.id;
  });
};

export async function findRestaurantsByOwner({ ownerId, page = 1, size = 20 }) {
  const take = Math.min(Math.max(Number(size) || 20, 1), 50);
  const skip = (Math.max(1, Number(page) || 1) - 1) * take;
  const where = { ownerId: Number(ownerId) };

  const [total, rows] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take,
      select: {
        id: true,
        name: true,
        category: true,
        address: true,
        telephone: true,
        mapx: true,
        mapy: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return { items: rows, page: Number(page), size: take, total };
}

/** 내 식당 상세 조회 (owner 기준) */
export async function findRestaurantDetailByOwner({ ownerId, restaurantId }) {
  return prisma.restaurant.findFirst({
    where: { id: Number(restaurantId), ownerId: Number(ownerId) },
    include: {
      restaurantPhoto: true,
      menu: true,
      stampReward: true,
    },
  });
}

/** 내 식당 삭제 (owner 검증) */
export async function deleteRestaurantByOwner({ ownerId, restaurantId }) {
  const target = await prisma.restaurant.findFirst({
    where: { id: Number(restaurantId), ownerId: Number(ownerId) },
    select: { id: true },
  });
  if (!target) {
    const e = new Error("RESTAURANT_NOT_FOUND_OR_FORBIDDEN");
    e.status = 404;
    throw e;
  }
  await prisma.restaurant.delete({ where: { id: target.id } });
  return true;
}
