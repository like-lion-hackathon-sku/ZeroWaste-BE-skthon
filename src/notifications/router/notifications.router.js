import express from "express";

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.send("notifications");
});

export default router;
