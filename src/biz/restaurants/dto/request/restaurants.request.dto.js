// 현준 식당 상세 조회
import {
  InvalidInputValueError,
  LoginRequiredError,
} from "../../../../error.js";

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

// 현준 식당 상세 조회
export const parseGetBizRestaurantDetailRequest = (req) => {
  const ownerId = req?.user?.id;
  if (!ownerId) {
    throw new LoginRequiredError("로그인이 필요합니다.");
  }

  const { restaurantId } = req.params ?? {};
  if (
    !restaurantId === undefined ||
    restaurantId === null ||
    restaurantId === ""
  ) {
    throw new InvalidInputValueError("restaurantId가 필요합니다.", {
      restaurantId,
    });
  }
  const idNum = Number(restaurantId);
  if (!Number.isFinite(idNum) || !Number.isInteger(idNum) || idNum <= 0) {
    throw new InvalidInputValueError(
      "restaurantId는 1 이상의 정수여야 합니다.",
      { restaurantId },
    );
  }

  return { restaurantId: idNum, ownerId };
};

export const parseDeleteBizRestaurantRequest = (req) => {
  const ownerId = req?.user?.id;
  if (!ownerId) throw new LoginRequiredError("로그인이 필요합니다.");

  const { restaurantId } = req.params ?? {};
  const idNum = Number(restaurantId);
  if (!Number.isInteger(idNum) || idNum <= 0) {
    throw new InvalidInputValueError("유효하지 않은 restaurantId", {
      restaurantId,
    });
  }
  return { ownerId, restaurantId: idNum };
};

export const parseListBizRestaurantsRequest = (req) => {
  const ownerId = req?.user?.id;
  if (!ownerId) throw new LoginRequiredError("로그인이 필요합니다.");

  const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const rawSize = Math.max(1, parseInt(req.query.size ?? "20", 10));
  const size = Math.min(rawSize, 50);

  return { ownerId, page, size };
};
