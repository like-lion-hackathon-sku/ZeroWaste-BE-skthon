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
      typeof item == "string" ? JSON.parse(item) : item
    ),
    ownerId: payload.id,
  };
};
