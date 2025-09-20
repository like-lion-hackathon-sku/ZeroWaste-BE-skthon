export const useStampRequestDto = (payload, body) => {
  return {
    userId: payload.id,
    restaurantId: body.restaurantId,
    condition: body.condition,
  };
};
export const getAllStampsRequestDto = (payload) => {
  return {
    userId: payload.id,
  };
};
export const getStampsHistoriesRequestDto = (payload) => {
  return {
    userId: payload.id,
  };
};
