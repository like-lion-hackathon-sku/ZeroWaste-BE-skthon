export const registerRestaurantRequestDto = (body, files, payload) => {
  return {
    name: body.name,
    category: body.category,
    address: body.address,
    telephone: body.telephone,
    mapx: parseInt(body.mapx),
    mapy: parseInt(body.mapy),
    images: files.images,
    menuMetadatas: JSON.parse(`[${body.menuMetadatas}]`),
    menuImages: files.menuImages,
    benefits: JSON.parse(body.benefits.replaceAll("\\n", "")).map((item) =>
      typeof item == "string" ? JSON.parse(item) : item,
    ),
    ownerId: payload.id,
  };
};

 // 민
export const deleteRestaurantRequestDto = (query, payload) => {
  const restaurantId = Number(query.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    const err = new Error("RESTAURANT_ID_REQUIRED");
    err.status = 400;
    throw err;
  }
  return { ownerId: payload.id, restaurantId };
};

export const listMyRestaurantsRequestDto = (query, payload) => {
  const page = Math.max(1, parseInt(query.page ?? "1", 10) || 1);
  const rawSize = Math.max(1, parseInt(query.size ?? "20", 10) || 20);
  const size = Math.min(rawSize, 50);
  return { ownerId: payload.id, page, size };
};

export const getMyRestaurantDetailRequestDto = (params, payload) => {
  const restaurantId = Number(params.restaurantId);
  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    const err = new Error("INVALID_RESTAURANT_ID");
    err.status = 400;
    throw err;
  }
  return { ownerId: payload.id, restaurantId };
};
