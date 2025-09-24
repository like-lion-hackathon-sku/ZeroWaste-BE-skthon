import { prisma } from "../../../db.config.js";
export const expireStampCode = async (data) => {
  const isExists = await prisma.stampCode.findFirst({
    select: {
      id: true,
      stampReward: {
        select: {
          condition: true,
        },
      },
      userId: true,
    },
    where: {
      code: data.code,
      expiredAt: null,
    },
  });
  if (isExists === null) return -1;
  const expiredDate = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
  await prisma.stampCode.updateMany({
    where: {
      code: data.code,
    },
    data: {
      expiredAt: expiredDate,
    },
  });
  const oldestStamps = await prisma.stamp.findMany({
    select: {
      id: true,
    },
    where: {
      usedAt: null,
    },
    orderBy: {
      acquiredAt: "asc",
    },
    take: isExists.stampReward.condition,
  });
  const stampIds = oldestStamps.map((stamp) => stamp.id);
  await prisma.stamp.updateMany({
    where: {
      id: {
        in: stampIds,
      },
    },
    data: {
      usedAt: expiredDate,
    },
  });
  return isExists;
};
