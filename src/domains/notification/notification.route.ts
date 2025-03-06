import express from "express";

import auth from "../../middlewares/auth";
import notificationController from "./notification.controller";
import notificationValidation from "./notification.validation";
import validate from "../../middlewares/validate";

const router = express.Router();

router
  .route("/")
  .get(
    auth,
    validate(notificationValidation.getNotifications),
    notificationController.getNotifications
  );

router.route("/read-all").post(auth, notificationController.markAllAsRead);

router
  .route("/:id")
  .get(
    validate(notificationValidation.getNotification),
    notificationController.getNotificationById
  );

router
  .route("/:id/read")
  .post(auth, validate(notificationValidation.getNotification), notificationController.markAsRead);

export default router;
