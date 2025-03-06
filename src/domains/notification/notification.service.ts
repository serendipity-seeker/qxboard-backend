import httpStatus from "http-status";

import { Notification, Prisma } from "@prisma/client";

import ApiError from "../../utils/ApiError";
import prisma from "../../client";

/**
 * Create a notification
 * @param {Object} notificationBody
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationBody: {
  userID: string;
  title?: string;
  message: string;
  read?: boolean;
}): Promise<Notification> => {
  try {
    return await prisma.notification.create({
      data: notificationBody,
      include: {
        User: true
      }
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error creating notification",
      error as string
    );
  }
};

/**
 * Query for notifications
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Notification[]>}
 */
const queryNotifications = async (
  filter: Prisma.NotificationWhereInput,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
) => {
  const page = parseInt(options.page ?? "1", 10);
  const limit = parseInt(options.limit ?? "10", 10);
  const sortBy = options.sortBy ?? "createdAt";
  const sortType = options.sortType ?? "desc";

  try {
    return await prisma.notification.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortType },
      include: {
        User: true
      }
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error querying notifications",
      error as string
    );
  }
};

/**
 * Get notification by id
 * @param {number} id
 * @param {string} userID
 * @returns {Promise<Notification | null>}
 */
const getNotificationById = async (id: number, userID: string): Promise<Notification | null> => {
  try {
    return await prisma.notification.findFirst({
      where: {
        id,
        userID
      },
      include: {
        User: true
      }
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching notification",
      error as string
    );
  }
};

/**
 * Mark notification as read
 * @param {number} id
 * @param {string} userID
 * @returns {Promise<Notification>}
 */
const markAsRead = async (id: number, userID: string): Promise<Notification> => {
  try {
    const notification = await getNotificationById(id, userID);
    if (!notification) {
      throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
    }

    return await prisma.notification.update({
      where: { id },
      data: { read: true },
      include: {
        User: true
      }
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error marking notification as read",
      error as string
    );
  }
};

/**
 * Mark all notifications as read
 * @param {string} userID
 * @returns {Promise<void>}
 */
const markAllAsRead = async (userID: string): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userID, read: false },
      data: { read: true }
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error marking all notifications as read",
      error as string
    );
  }
};

export default {
  createNotification,
  queryNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead
};
