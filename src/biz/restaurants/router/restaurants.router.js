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
// // import { requireRoleBiz } from "../../security/biz.guard.js"; // ownerId 없어서 당장은 비권장

// const r = Router();
// r.use(authenticateAccessToken, verifyUserIsActive);

// r.get("/restaurants/search", searchRestaurantCandidatesCtrl);
// r.post("/restaurants", createRestaurantByBizCtrl);
// r.put("/restaurants", updateRestaurantByBizCtrl);
// r.delete("/restaurants", deleteRestaurantByBizCtrl);
// r.get("/restaurants", listMyBizRestaurantsCtrl);
// r.get("/restaurants/:restaurantId", getBizRestaurantDetailCtrl);

// export default r;
