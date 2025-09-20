import express from "express";
import authRouter from "../auth/router/auth.route.js";
import badgesRouter from "../badges/router/badges.router.js";
import bizRouter from "../biz/router/biz.router.js";
import favoritesRouter from "../favorites/router/favorites.router.js";
import imagesRouter from "../images/router/images.router.js";
import notificationsRouter from "../notifications/router/notifications.router.js";
import restaurantsRouter from "../restaurants/router/restaurants.router.js";
import reviewsRouter from "../reviews/router/reviews.router.js";
import stampsRouter from "../stamps/router/stamps.router.js";

const router = express.Router({ mergeParams: true });

router.use("/auth", authRouter);
router.use("/badges", badgesRouter);
router.use("/biz", bizRouter);
router.use("/favorites", favoritesRouter);
router.use("/images", imagesRouter);
router.use("/notifications", notificationsRouter);
router.use("/restaurants", restaurantsRouter);
router.use("/reviews", reviewsRouter);
router.use("/stamps", stampsRouter);
export default router;
