import { prisma } from "../../../db.config.js";
export const addRestaurant = async (data) => {
  return await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: data.name,
        category: data.category,
        address: data.address,
        telephone: data.telephone,
        mapx: data.mapx,
        mapy: data.mapy,
        ownerId: data.ownerId,
      },
    });
    await tx.restaurantPhoto.createMany({
      data: data.restaurantImageNames.map((item) => {
        return {
          restaurantId: restaurant.id,
          photoName: item,
        };
      }),
    });
    const menu = data.menuImageNames.map((item) => {
      return {
        restaurantId: restaurant.id,
        photo: item,
      };
    });

    for (let i = 0; i < data.menuMetadatas.length; i++) {
      console.log(i);
      menu[i] = {
        restaurantId: menu.at(i).restaurantId,
        photo: menu.at(i).photo,
        name: data.menuMetadatas.at(i),
      };
    }
    await tx.menu.createMany({
      data: menu,
    });
    await tx.stampReward.createMany({
      data: data.benefits.map((item) => {
        return {
          restaurantId: restaurant.id,
          condition: item.condition,
          reward: item.reward,
        };
      }),
    });
    return restaurant.id;
  });
};
