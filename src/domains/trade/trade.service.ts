import httpStatus from "http-status";
import { Trade, Prisma } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import prisma from "../../client";
import { SocketService } from "../../services/socket.service";
import { NotificationManager } from "../../services/notification.service";

/**
 * Create a trade
 * @param {Object} createBody
 * @returns {Promise<Trade>}
 */
const createTrade = async (createBody: {
  maker?: string;
  taker?: string;
  price: bigint;
  amount: bigint;
  tick: number;
  assetID: number;
  txHash: string;
  fee?: bigint;
}): Promise<Trade> => {
  try {
    // Create the trade
    if (createBody.maker) {
      const maker = await prisma.user.findUnique({
        where: { id: createBody.maker }
      });
      if (!maker)
        await prisma.user.create({
          data: {
            id: createBody.maker
          }
        });
    }

    if (createBody.taker) {
      const taker = await prisma.user.findUnique({
        where: { id: createBody.taker }
      });
      if (!taker)
        await prisma.user.create({
          data: {
            id: createBody.taker
          }
        });
    }

    const trade = await prisma.trade.create({
      data: {
        maker: createBody.maker || "",
        taker: createBody.taker || "",
        price: Number(createBody.price),
        amount: Number(createBody.amount),
        tick: createBody.tick,
        assetID: createBody.assetID,
        txHash: createBody.txHash
      },
      include: {
        Asset: true,
        Maker: true,
        Taker: true
      }
    });

    if (!trade) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error creating trade");

    // Emit trade event via socket
    const socketService = SocketService.getInstance();
    socketService.emitToAll("trade:new", trade);

    // Send notifications to maker and taker
    if (trade.Asset && (createBody.maker || createBody.taker)) {
      const notificationManager = NotificationManager.getInstance();
      const assetName = trade.Asset.name;
      const amount = Number(createBody.amount);
      const price = Number(createBody.price);

      if (createBody.maker) {
        await notificationManager.sendNotification(
          createBody.maker,
          `Your sell order for ${amount} ${assetName} at ${price} QU has been executed`,
          "Trade Executed"
        );
      }

      if (createBody.taker) {
        await notificationManager.sendNotification(
          createBody.taker,
          `Your buy order for ${amount} ${assetName} at ${price} QU has been executed`,
          "Trade Executed"
        );
      }
    }

    return trade;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error creating trade`, error as string);
  }
};

/**
 * Query for trades
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Trade[]>}
 */
const queryTrades = async (
  filter: Prisma.TradeWhereInput,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: "asc" | "desc";
    startTick?: number;
    endTick?: number;
    startTime?: string;
    endTime?: string;
    details?: boolean;
  }
): Promise<Trade[]> => {
  const page = parseInt(options.page ?? "1", 10);
  const limit = parseInt(options.limit ?? "10", 10);
  const sortBy = options.sortBy ?? "createdAt";
  const sortType = options.sortType ?? "desc";
  const details = options.details ?? false;

  try {
    return await prisma.trade.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortType },
      where: {
        ...filter,
        createdAt: {
          ...(options.startTime && { gte: new Date(options.startTime) }),
          ...(options.endTime && { lte: new Date(options.endTime) })
        },
        tick: {
          ...(options.startTick && { gte: options.startTick }),
          ...(options.endTick && { lte: options.endTick })
        }
      },
      include: {
        Asset: details ? true : false,
        Maker: details ? true : false,
        Taker: details ? true : false
      }
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error querying trades", error as string);
  }
};

/**
 * Get trade by txHash
 * @param {string} txHash
 * @returns {Promise<Trade | null>}
 */
const getTradeByTxHash = async (txHash: string): Promise<Trade | null> => {
  try {
    return await prisma.trade.findFirst({
      where: { txHash },
      include: {
        Asset: true,
        Maker: true,
        Taker: true
      }
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching trade", error as string);
  }
};

/**
 * Get trade by tick
 * @param {number} tick
 * @returns {Promise<Trade[]>}
 */
const getTradeByTick = async (tick: number): Promise<Trade[]> => {
  try {
    return await prisma.trade.findMany({
      where: { tick }
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching trade", error as string);
  }
};

/**
 * Get user's trades (both sent and received)
 * @param {string} userId
 * @returns {Promise<Trade[]>}
 */
const getUserTrades = async (userId: string): Promise<Trade[]> => {
  try {
    return await prisma.trade.findMany({
      where: {
        OR: [{ maker: userId }, { taker: userId }]
      },
      include: {
        Asset: true,
        Maker: true,
        Taker: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching user trades",
      error as string
    );
  }
};

export default {
  createTrade,
  queryTrades,
  getTradeByTxHash,
  getTradeByTick,
  getUserTrades
};
