import {
  createStamp,
  findRestaurantById,
  findStampsGroupByRestaurant,
  getAcquiredStampHistories,
  getUsedStampHistories,
} from "../repository/stamps.repository.js";
import { eventEmitter } from "../../index.js";
import { createStampUsingSession } from "../repository/stamps.repository.js";
import { v4 as uuidv4 } from "uuid";
import {
  getAllStampsResponseDto,
  getStampsHistoriesResponseDto,
  useStampResponseDto,
} from "../dto/response/stamps.response.dto.js";
export const addNewStamp = async (data) => {
  const stampId = await createStamp(data);
  eventEmitter.emit("SEND_NOTIFICATION", {
    eventType: "STAMP_ACQUIRED",
    userId: data.userId,
    stampId,
  });
};

export const useStamps = async (data) => {
  data.code = uuidv4();
  const result = await createStampUsingSession(data);
  if (result === -1) throw new Error("스탬프 갯수가 충분하지 않습니다.");
  if (result === -2) throw new Error("스탬프 교환 프리셋이 존재하지 않습니다.");
  return useStampResponseDto(data.code);
};

export const getAllStamps = async (data) => {
  const counts = await findStampsGroupByRestaurant(data);
  const results = [];
  for (let count of counts) {
    results.push({
      restaurantId: count.restaurantId,
      restaurant: await findRestaurantById(count.restaurantId),
      count: count._count._all,
    });
  }
  return getAllStampsResponseDto(results);
};

export const getStampsHistories = async (data) => {
  const incomes = await getAcquiredStampHistories(data);
  const outcomes = await getUsedStampHistories(data);
  const histories = [];
  while (incomes.length != 0 || outcomes.length != 0) {
    if (incomes.at(-1)?.acquiredAt < outcomes.at(-1)?.expiredAt) {
      histories.push({
        restaurant: incomes.at(-1).restaurant.name,
        type: "ACQUIRED",
        condition: 1,
        at: incomes.at(-1).acquiredAt,
      });
      incomes.pop();
    } else {
      histories.push({
        restaurant: outcomes.at(-1).restaurant.name,
        type: "USED",
        condition: outcomes.at(-1).stampReward.condition,
        at: outcomes.at(-1).expiredAt,
      });
      outcomes.pop();
    }
  }
  return getStampsHistoriesResponseDto(histories);
};
