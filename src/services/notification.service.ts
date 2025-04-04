import { Notification } from "@prisma/client";
import { SocketService } from "./socket.service";
import notificationService from "../domains/notification/notification.service";
import logger from "../config/logger";

export class NotificationManager {
  private static instance: NotificationManager;
  private socketService: SocketService;

  private constructor() {
    this.socketService = SocketService.getInstance();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Send a notification to a user and store it in the database
   */
  public async sendNotification(
    userId: string,
    message: string,
    title?: string,
    data?: any
  ): Promise<Notification> {
    try {
      // Create notification in database
      const notification = await notificationService.createNotification({
        userID: userId,
        title,
        message,
        read: false
      });

      // Send via socket
      this.socketService.sendNotification(userId, notification);
      
      logger.info(`Notification sent to user ${userId}: ${message}`);
      return notification;
    } catch (error) {
      logger.error(`Failed to send notification to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Send a notification to multiple users
   */
  public async broadcastNotification(
    userIds: string[],
    message: string,
    title?: string,
    data?: any
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      try {
        const notification = await this.sendNotification(userId, message, title, data);
        notifications.push(notification);
      } catch (error) {
        logger.error(`Failed to send notification to user ${userId}:`, error);
      }
    }
    
    return notifications;
  }

  /**
   * Send a system-wide notification to all connected users
   */
  public async sendSystemNotification(message: string, title?: string): Promise<void> {
    const systemNotification = {
      id: Date.now().toString(),
      type: "info",
      message,
      title,
      timestamp: Date.now(),
      read: false
    };
    
    this.socketService.emitToAll("notification", systemNotification);
    logger.info(`System notification sent: ${message}`);
  }
} 