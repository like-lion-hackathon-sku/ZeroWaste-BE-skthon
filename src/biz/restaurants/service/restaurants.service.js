import { uploadToS3 } from "../../../utils/s3.js";
import { registerRestaurantResponseDto } from "../dto/response/restaurants.response.dto.js";
import { addRestaurant } from "../repository/restaurants.repository.js";
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
