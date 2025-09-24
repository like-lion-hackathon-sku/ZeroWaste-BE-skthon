export const verifyStampsResponseDto = (data) => {
  return {
    customerId: data.userId,
    restaurantId: data.restaurantId
  };
};
