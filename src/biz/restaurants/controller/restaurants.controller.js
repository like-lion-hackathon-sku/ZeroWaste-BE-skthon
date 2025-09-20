// 위치: src / biz / restaurants / controller / restaurants.controller.js
import { StatusCodes } from "http-status-codes";
import * as bizSvc from "../service/restaurants.service.js";
import { parseSearchCandidatesQuery } from "../dto/request/restaurants.request.dto.js";
import { ok, fail } from "../dto/response/restaurants.response.dto.js";

/* 사업체 식당 등록 */
export const createRestaurantByBizCtrl = async (req, res, next) => {
  try {
    const userId = req.user?.id; // 현재는 소유자 매핑 없음(스키마 미지원)
    const result = await bizSvc.ensureRestaurantByBiz(userId, req.body);
    return res.status(StatusCodes.CREATED).json(ok(result));
  } catch (e) {
    return next(e);
  }
};

/* 사업체 식당 수정 */
export const updateRestaurantByBizCtrl = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const result = await bizSvc.updateMyRestaurant(userId, req.body);
    return res.status(StatusCodes.OK).json(ok(result));
  } catch (e) {
    return next(e);
  }
};

/* 사업체 식당 삭제 */
export const deleteRestaurantByBizCtrl = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { restaurantId } = req.body;
    const result = await bizSvc.deleteMyRestaurant(
      userId,
      Number(restaurantId),
    );
    return res.status(StatusCodes.OK).json(ok(result));
  } catch (e) {
    return next(e);
  }
};

/* 사업체 식당 상세조회 */
export const getBizRestaurantDetailCtrl = async (req, res, next) => {
  try {
    const id = Number(req.params.restaurantId);
    const dto = await bizSvc.getMyRestaurantDetail(id);
    return res.status(StatusCodes.OK).json(ok(dto));
  } catch (e) {
    return next(e);
  }
};

/* 내 식당 목록 */
export const listMyBizRestaurantsCtrl = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const size = Math.max(1, parseInt(req.query.size ?? "20", 10));
    const result = await bizSvc.listMyRestaurants(userId, { page, size });
    return res.status(StatusCodes.OK).json(ok(result));
  } catch (e) {
    return next(e);
  }
};

/* 네이버 후보 검색 */
export async function searchRestaurantCandidatesCtrl(req, res, next) {
  try {
    const { q, limit } = parseSearchCandidatesQuery(req);
    const items = await bizSvc.searchRestaurantCandidates({ q, limit });
    return res.json(ok({ items }));
  } catch (e) {
    if (e.status) return res.status(e.status).json(fail(e.message));
    return next(e);
  }
}
