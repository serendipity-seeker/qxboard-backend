import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../config/logger";

export class SocketService {
  private io: SocketServer;
  private static instance: SocketService;

  private constructor(server: HttpServer) {
    this.io = new SocketServer(server);

    this.setupEventHandlers();
    logger.info("Socket.IO server initialized");
  }

  public static getInstance(server?: HttpServer): SocketService {
    if (!SocketService.instance && server) {
      SocketService.instance = new SocketService(server);
    }
    return SocketService.instance;
  }

  private setupEventHandlers(): void {
    this.io.on("connection", (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Add more event handlers as needed
    });
  }

  // Method to emit events to all connected clients
  public emitToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // Method to emit events to a specific client
  public emitToClient(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  // Method to emit events to a specific room
  public emitToRoom(room: string, event: string, data: any): void {
    this.io.to(room).emit(event, data);
  }

  // Method to add a client to a room
  public addToRoom(socketId: string, room: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(room);
    }
  }

  // Get the socket.io instance
  public getIO(): SocketServer {
    return this.io;
  }
}
