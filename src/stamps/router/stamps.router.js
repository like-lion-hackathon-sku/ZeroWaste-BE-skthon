import express from "express";
import { eventEmitter } from "../../index.js";

const router = express.Router({ mergeParams: true });

router.get("/", (req, res) => {
  res.send("stamps");
});

export default router;
