// // src/biz/restaurants/router/restaurants.router.js
// import { Router } from "express";
// import {
//   createRestaurantByBizCtrl,
//   updateRestaurantByBizCtrl,
//   deleteRestaurantByBizCtrl,
//   listMyBizRestaurantsCtrl,
//   getBizRestaurantDetailCtrl,
//   searchRestaurantCandidatesCtrl,
// } from "../controller/restaurants.controller.js";
// import {
//   authenticateAccessToken,
//   verifyUserIsActive,
// } from "../../../auth/middleware/auth.middleware.js";
// import { requireRoleBiz } from "../../security/biz.guard.js";

// const r = Router();
// r.use(authenticateAccessToken, verifyUserIsActive);

// /* 사업체 식당 검색 (등록할때) 라우터
//  * 매서드: GET
//  * 엔드포인트: /api/restaurants/search
//  */
// r.get("/restaurants/search", searchRestaurantCandidatesCtrl);

// /* 사업체 식당 등록 라우터
//  * 매서드: POST
//  * 엔드포인트: /api/restaurants
//  */
// r.post("/restaurants", createRestaurantByBizCtrl);

// /* 사업체 식당 수정 라우터
//  * 매서드: PUT
//  * 엔드포인트: /api
//  */
// r.put("/restaurants", updateRestaurantByBizCtrl);

// /* 사업체 식당 삭제 라우터
//  * 매서드: DELETE
//  * 엔드포인트: /api/restaurants
//  */
// r.delete("/restaurants", deleteRestaurantByBizCtrl);

// /* 사업체 식당 목록 조회 라우터
//  * 매서드: GET
//  * 엔드포인트: /api/restaurants
//  */
// r.get("/restaurants", listMyBizRestaurantsCtrl);

// /* 사업체 식당 상세 조회 라우터
//  * 매서드: GET
//  * 엔드포인트: /api/restaurants/:restaurantId
//  */
// r.get("/restaurants/:restaurantId", getBizRestaurantDetailCtrl);

// export default r;
