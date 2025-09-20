export const registerRestaurantResponseDto = (data) => {
  return {
    restaurantId: data,
  };
};

export const deleteRestaurantResponseDto = (ok) => {
  return { deleted: !!ok };
};

export const listMyRestaurantsResponseDto = (data) => {
  // data = { page, size, total, items:[{...}] }
  return data;
};

export const getMyRestaurantDetailResponseDto = (row) => {
  return row;
};
