import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "../config/logger";
import { Notification, Trade } from "@prisma/client";

export class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*", // In production, restrict this to your frontend domain
        methods: ["GET", "POST"]
      }
    });

    this.io.on("connection", this.handleConnection.bind(this));
    logger.info("Socket.IO server initialized");
  }

  private handleConnection(socket: Socket): void {
    logger.info(`New socket connection: ${socket.id}`);

    // Handle user authentication and subscription
    socket.on("subscribe", (data: { userId: string }) => {
      if (data.userId) {
        this.subscribeUser(socket.id, data.userId);
        logger.info(`User ${data.userId} subscribed with socket ${socket.id}`);
        
        // // Send welcome notification
        // this.emitToUser(data.userId, "notification", {
        //   id: Date.now().toString(),
        //   type: "info",
        //   message: "Connected to QXBoard notification service",
        //   timestamp: Date.now(),
        //   read: false
        // });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      this.handleDisconnect(socket.id);
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  }

  private subscribeUser(socketId: string, userId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socketId);
  }

  private handleDisconnect(socketId: string): void {
    // Remove socket from all user mappings
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  // Emit event to a specific user (all their connected sockets)
  public emitToUser(userId: string, event: string, data: any): boolean {
    if (!this.io) return false;

    const userSocketIds = this.userSockets.get(userId);
    if (!userSocketIds || userSocketIds.size === 0) return false;

    for (const socketId of userSocketIds) {
      this.io.to(socketId).emit(event, data);
    }
    return true;
  }

  // Emit event to all connected clients
  public emitToAll(event: string, data: any): boolean {
    if (!this.io) return false;
    this.io.emit(event, data);
    return true;
  }

  // Send notification to a specific user
  public sendNotification(userId: string, notification: Notification): boolean {
    return this.emitToUser(userId, "notification", notification);
  }

  // Broadcast trade update to all connected clients
  public broadcastTradeUpdate(trade: Trade): boolean {
    return this.emitToAll("trade_update", trade);
  }

  // Get connected socket count
  public getConnectionCount(): number {
    return this.io ? this.io.engine.clientsCount : 0;
  }

  // Get active user count (users with at least one socket)
  public getActiveUserCount(): number {
    return this.userSockets.size;
  }
}
