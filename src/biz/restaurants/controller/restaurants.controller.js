// 위치: src / biz / restaurants / controller / restaurants.controller.js
import { StatusCodes } from "http-status-codes";
import * as bizSvc from "../service/restaurants.service.js";

/* 사업체 식당 등록 컨트롤러 */
export const createRestaurantByBizCtrl = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payload = req.body;
    const result = await bizSvc.ensureRestaurantByBiz(userId, payload);
    return res.status(StatusCodes.CREATED).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
};

/* 사업체 식당 수정 컨트롤러 */
export const updateRestaurantByBizCtrl = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await bizSvc.updateMyRestaurant(userId, req.body);
    return res.status(StatusCodes.OK).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
};

/* 사업체 식당 삭제 컨틀롤러 */
export const deleteRestaurantByBizCtrl = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { restaurantId } = req.body;
    const result = await bizSvc.deleteMyRestaurant(userId, +restaurantId);
    return res.status(StatusCodes.OK).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
};

/* 사업체 식당 상세조회 컨트롤러 */
export const getBizRestaurantDetailCtrl = async (req, res, next) => {
  try {
    const id = +req.params.restaurantId;
    // ✅ 일반 상세 DTO 그대로 재사용
    const dto = await restSvc.getRestaurantDetail(id);
    return res.status(StatusCodes.OK).json({ ok: true, data: dto });
  } catch (e) {
    next(e);
  }
};

/* 사업체 식당 전체 조회 컨트롤러 */
export const listMyBizRestaurantsCtrl = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const size = Math.max(1, parseInt(req.query.size ?? "20", 10));
    const result = await bizSvc.listMyRestaurantsForProfile(userId, {
      page,
      size,
    });
    return res.status(200).json({ ok: true, data: result });
  } catch (e) {
    next(e);
  }
};
