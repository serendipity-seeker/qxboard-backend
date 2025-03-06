import express from "express";
import httpStatus from "http-status";

import ApiError from "../utils/ApiError";
import auth from "../middlewares/auth";

const router = express.Router();

router.get("/", auth, (req, res) => {
  res.status(200).json({ message: "OK", user: (req as any).user });
});

export default router;
