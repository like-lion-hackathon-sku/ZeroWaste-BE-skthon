import { uploadToS3 } from "../../../utils/s3.js";
import { registerRestaurantResponseDto } from "../dto/response/restaurants.response.dto.js";
import { addRestaurant } from "../repository/restaurants.repository.js";
import {
  findRestaurantsByOwner,
  findRestaurantDetailByOwner,
  deleteRestaurantByOwner,
} from "../repository/restaurants.repository.js";
export const registerRestaurant = async (data) => {
  const restaurantImages = [];
  const menuImages = [];
  for (let image of data.images) {
    restaurantImages.push(await uploadToS3(image, 2));
  }
  for (let image of data.menuImages) {
    menuImages.push(await uploadToS3(image, 3));
  }
  data.restaurantImageNames = restaurantImages;
  data.menuImageNames = menuImages;
  const restaurantId = await addRestaurant(data);
  console.log(restaurantId);
  return registerRestaurantResponseDto(restaurantId);
};

export async function listMyBizRestaurants({ ownerId, page, size }) {
  return findRestaurantsByOwner({ ownerId, page, size });
}

/** 사업체 - 내 식당 상세 */
export async function getMyBizRestaurantDetail({ ownerId, restaurantId }) {
  const row = await findRestaurantDetailByOwner({ ownerId, restaurantId });
  if (!row) {
    const e = new Error("RESTAURANT_NOT_FOUND_OR_FORBIDDEN");
    e.status = 404;
    throw e;
  }
  return row;
}

/** 사업체 - 내 식당 삭제 */
export async function removeMyBizRestaurant({ ownerId, restaurantId }) {
  await deleteRestaurantByOwner({ ownerId, restaurantId });
  return { deleted: true };
}
