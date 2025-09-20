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
