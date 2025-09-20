import { prisma } from "../../db.config.js";
export const createStamp = async (data) => {
  //여유 있을때 식당ID, 유저 ID 검증 로직 추가하기
  const stamp = await prisma.stamp.create({
    data: {
      restaurantId: data.restaurantId,
      userId: data.userId,
    },
  });
  return stamp.id;
};

export const createStampUsingSession = async (data) => {
  return await prisma.$transaction(async (tx) => {
    await tx.stampCode.deleteMany({
      where: {
        userId: data.userId,
        restaurantId: data.restaurantId,
        expiredAt: null,
      },
    });
    const currentStamps = await tx.stamp.count({
      where: {
        restaurantId: data.restaurantId,
        userId: data.userId,
      },
    });
    if (currentStamps < data.condition) return -1;
    const benefit = await tx.stampReward.findFirst({
      select: {
        id: true,
      },
      where: {
        condition: data.condition,
      },
    });
    if (benefit === null) return -2;
    const session = await tx.stampCode.create({
      data: {
        user: {
          connect: {
            id: data.userId,
          },
        },
        restaurant: {
          connect: {
            id: data.restaurantId,
          },
        },
        stampReward: {
          connect: {
            id: benefit.id,
          },
        },
        code: data.code,
      },
    });
    return session;
  });
};

export const findStampsGroupByRestaurant = async (data) => {
  return await prisma.stamp.groupBy({
    by: ["restaurantId"],
    _count: {
      _all: true,
    },
    where: {
      userId: data.userId,
    },
  });
};
//임시
export const findRestaurantById = async (id) => {
  return (
    await prisma.restaurant.findFirst({
      select: {
        name: true,
      },
      where: {
        id: id,
      },
    })
  ).name;
};

export const getAcquiredStampHistories = async (data) => {
  return await prisma.stamp.findMany({
    select: {
      restaurant: {
        select: {
          name: true,
        },
      },
      acquiredAt: true,
    },
    where: {
      userId: data.userId,
    },
    orderBy: {
      acquiredAt: "desc",
    },
  });
};

export const getUsedStampHistories = async (data) => {
  return await prisma.stampCode.findMany({
    select: {
      restaurant: {
        select: {
          name: true,
        },
      },
      stampReward: {
        select: {
          condition: true,
        },
      },
      expiredAt: true,
    },
    where: {
      userId: data.userId,
      expiredAt: {
        not: null,
      },
    },
    orderBy: {
      expiredAt: "desc",
    },
  });
};
