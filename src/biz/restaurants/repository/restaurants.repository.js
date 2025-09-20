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

// 현준 - 식당 상세 조회
/**
 * 단건 존재 여부 확인용
 */
export const findRestaurantByIdRepo = async (restaurantId) => {
  return prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, ownerId: true, name: true },
  });
};

export const findBizRestaurantDetailRepo = async ({ restaurantId, ownerId }) => {
  return prisma.restaurant.findFirst({
    where: { id: restaurantId, ownerId },
    include: {
      restaurantPhoto: {
        select: { id: true, photoName: true, createdAt: true },
        orderBy: { id: "asc" },
      },
      menu: {
        select: { id: true, name: true, photo: true },
        orderBy: { id: "asc" },
      },
      stampReward: {
        select: { id: true, condition: true, reward: true },
        orderBy: { condition: "asc" },
      },
    },
  });
};

/**
 * 리뷰 통계: 개수와 평균 평점
 */
export const getRestaurantReviewStatsRepo = async (restaurantId) => {
  return prisma.review.aggregate({
    where: { restaurantId },
    _count: { _all: true },
    _avg: { score: true },
  });
};

/**
 * 즐겨찾기(찜) 수
 */
export const getRestaurantFavoriteCountRepo = async (restaurantId) => {
  return prisma.favorite.count({
    where: { restaurantId },
  });
};