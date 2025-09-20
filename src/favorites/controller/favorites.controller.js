// 위치: src / favorites / controller / favorites.controller.js
import { StatusCodes } from "http-status-codes";
import {
  addFavorite,
  removeFavorite,
  listMyFavorites,
} from "../service/favorites.service.js";

const toPosInt = (v, d) => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : d);

/* 즐겨찾기 목록 조회 컨트롤러 */
export const listMyFavoritesCtrl = async (req, res, next) => {
  try {
    const userId = req.payload?.id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAILURE",
        error: "UNAUTHORIZED",
        success: null,
      });
    }
    const page = toPosInt(req.query.page, 1);
    const size = toPosInt(req.query.size, 20);

    const data = await listMyFavorites(userId, { page, size });
    return res
      .status(StatusCodes.OK)
      .json({ resultType: "SUCCESS", error: null, success: data });
  } catch (e) {
    console.error("[FAV][LIST] error:", e);
    next(e);
  }
};

/* 즐겨찾기 추가 컨트롤러 */
export const upsertFavorite = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAILURE",
        error: "UNAUTHORIZED",
        success: null,
      });
    }

    const { restaurantId } = req.body ?? {};
    const rid = toPosInt(restaurantId, null);
    if (rid == null) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        resultType: "FAILURE",
        error: "RESTAURANT_ID_REQUIRED",
        success: null,
      });
    }

    const result = await addFavorite({ userId, restaurantId: rid });
    return res
      .status(StatusCodes.OK)
      .json({ resultType: "SUCCESS", error: null, success: result });
  } catch (e) {
    console.error("[FAV][UPSERT] error:", e);
    next(e);
  }
};

/* 즐겨찾기 삭제 컨트롤러 */
export const removeFavoriteById = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        resultType: "FAILURE",
        error: "UNAUTHORIZED",
        success: null,
      });
    }
    const restaurantId = toPosInt(req.params.restaurantId, null);
    if (restaurantId == null) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        resultType: "FAILURE",
        error: "INVALID_RESTAURANT_ID",
        success: null,
      });
    }

    await removeFavorite(userId, restaurantId);
    return res
      .status(StatusCodes.OK)
      .json({ resultType: "SUCCESS", error: null, success: true });
  } catch (e) {
    console.error("[FAV][DELETE] error:", e);
    next(e);
  }
};
