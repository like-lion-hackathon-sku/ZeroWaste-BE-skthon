import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.send("biz/restaurants");
});

export default router;
