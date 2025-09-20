import { StatusCodes } from "http-status-codes";
import * as svc from "../service/restaurants.service.js";
import {
  parseNearbyQuery,
  parseRestaurantIdParam,
  parseListReviewsQuery,
} from "../dto/request/restaurants.request.dto.js";
import {
  NearbyRestaurantsSuccess,
  RestaurantDetailSuccess,
  RestaurantReviewsSuccess,
} from "../dto/response/restaurants.response.dto.js";

/** DB 기준 식당 목록 조회 */
export const searchRestaurantsCtrl = async (req, res, next) => {
  try {
    const q = parseNearbyQuery(req.query);
    const data = await svc.searchRestaurants(q);
    return res.status(StatusCodes.OK).json(NearbyRestaurantsSuccess.ok(data));
  } catch (e) {
    if (e.name === "BadRequestError") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(NearbyRestaurantsSuccess.fail(e.message));
    }
    next(e);
  }
};

/** 식당 상세 조회 */
export const getRestaurantDetailCtrl = async (req, res, next) => {
  try {
    const { restaurantId } = parseRestaurantIdParam(req.params);
    const userId = req.user?.id ?? null;
    const detail = await svc.getRestaurantDetail({ restaurantId, userId });
    if (!detail) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(RestaurantDetailSuccess.fail("RESTAURANT_NOT_FOUND"));
    }
    return res.status(StatusCodes.OK).json(RestaurantDetailSuccess.ok(detail));
  } catch (e) {
    if (e.name === "BadRequestError") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(RestaurantDetailSuccess.fail(e.message));
    }
    next(e);
  }
};

/** 식당 리뷰 목록 조회 */
export const handleGetRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = parseRestaurantIdParam(req.params);
    const q = parseListReviewsQuery(req.query);
    const userId = req.user?.id ?? null;

    const data = await svc.getRestaurantReviews({
      restaurantId,
      userId,
      page: q.page,
      size: q.size,
      orderBy: q.orderBy,
    });

    return res.status(StatusCodes.OK).json(RestaurantReviewsSuccess.ok(data));
  } catch (e) {
    if (e.name === "BadRequestError") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(RestaurantReviewsSuccess.fail(e.message));
    }
    next(e);
  }
};
