import httpStatus from "http-status";

import { bigintConvert } from "../../utils/bigintConvert";
import ApiError from "../../utils/ApiError";
import catchAsync from "../../utils/catchAsync";
import notificationService from "./notification.service";
import pick from "../../utils/pick";

const getNotifications = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["read"]);
  const options = pick(req.query, ["sortBy", "limit", "page", "sortType"]);
  const result = await notificationService.queryNotifications(
    { ...filter, userID: (req as any).user.id },
    options
  );
  res.send(bigintConvert(result));
});

const getNotificationById = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(
    Number(req.params.id),
    (req as any).user.id
  );
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }
  res.send(bigintConvert(notification));
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(
    Number(req.params.id),
    (req as any).user.id
  );
  res.send(bigintConvert(notification));
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead((req as any).user.id);
  res.status(httpStatus.OK).send();
});

export default {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead
};
