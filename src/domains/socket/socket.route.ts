import express from "express";
import socketController from "./socket.controller";
import validate from "../../middlewares/validate";
import socketValidation from "./socket.validation";

const router = express.Router();

router.get("/status", socketController.getSocketStatus);

router.post(
  "/test-notification",
  validate(socketValidation.sendTestNotification),
  socketController.sendTestNotification
);

router.post(
  "/broadcast",
  validate(socketValidation.broadcastMessage),
  socketController.broadcastMessage
);

export default router;
