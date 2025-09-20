import express from "express";
import restaurantsRouter from "../restaurants/router/restaurants.router.js";
import reviewsRouter from "../reviews/router/reviews.router.js";
import stampsRouter from "../stamps/router/stamps.router.js";

const router = express.Router({ mergeParams: true });

router.use("/restaurants", restaurantsRouter);
router.use("/reviews", reviewsRouter);
router.use("/stamps", stampsRouter);

export default router;
