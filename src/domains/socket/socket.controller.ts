import { Request, Response } from "express";
import { SocketService } from "../../services/socket.service";
import { NotificationManager } from "../../services/notification.service";
import catchAsync from "../../utils/catchAsync";

const getSocketStatus = catchAsync(async (req: Request, res: Response) => {
  const socketService = SocketService.getInstance();

  res.json({
    status: "online",
    connections: socketService.getConnectionCount(),
    activeUsers: socketService.getActiveUserCount()
  });
});

const sendTestNotification = catchAsync(async (req: Request, res: Response) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "userId and message are required" });
  }

  const notificationManager = NotificationManager.getInstance();
  const notification = await notificationManager.sendNotification(
    userId,
    message,
    "Test Notification"
  );

  res.json({ success: true, notification });
});

const broadcastMessage = catchAsync(async (req: Request, res: Response) => {
  const { message, title } = req.body;

  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }

  const notificationManager = NotificationManager.getInstance();
  await notificationManager.sendSystemNotification(message, title);

  res.json({ success: true });
});

export default {
  getSocketStatus,
  sendTestNotification,
  broadcastMessage
};
