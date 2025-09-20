import express from "express";
import { handleGetPhotoUrl } from "../controller/images.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/:fileType/:fileName", handleGetPhotoUrl);

export default router;
