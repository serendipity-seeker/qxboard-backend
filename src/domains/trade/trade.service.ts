import httpStatus from "http-status";
import { Trade, Prisma, TradeType, TradeStatus } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import prisma from "../../client";

/**
 * Create a trade
 * @param {Object} createBody
 * @returns {Promise<Trade>}
 */
const createTrade = async (createBody: {
  type: TradeType;
  fromID: string;
  toID?: string;
  price: bigint;
  amount: bigint;
  tick: number;
  assetID: number;
  txHash: string;
  fee?: bigint;
  status?: TradeStatus;
}): Promise<Trade> => {
  try {
    // Create the trade
    const trade = await prisma.trade.create({
      data: {
        ...createBody,
        toID: createBody.toID || "",
        status: createBody.status || TradeStatus.COMPLETED
      },
      include: {
        Asset: true,
        From: true,
        To: true
      }
    });

    if (!trade) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error creating trade");

    // Update user statistics
    if (createBody.fromID) {
      await prisma.user.update({
        where: { id: createBody.fromID },
        data: {
          totalTrades: { increment: 1 },
          totalVolume: { increment: trade.price || BigInt(0) }
        }
      });
    }

    if (createBody.toID) {
      await prisma.user.update({
        where: { id: createBody.toID },
        data: {
          totalTrades: { increment: 1 },
          totalVolume: { increment: trade.price || BigInt(0) }
        }
      });
    }

    // Update daily trade summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.tradeSummary.upsert({
      where: { date: today },
      update: {
        totalTrades: { increment: 1 },
        totalVolume: { increment: trade.price || BigInt(0) },
        totalFees: { increment: trade.fee || BigInt(0) },
        ...(trade.type === TradeType.ISSUE && { totalAssetsIssued: { increment: 1 } }),
        ...(trade.type === TradeType.TRANSFER && { totalAssetsTransferred: { increment: 1 } }),
        ...((trade.type === TradeType.BUY || trade.type === TradeType.SELL) && {
          totalAssetsTraded: { increment: 1 }
        })
      },
      create: {
        date: today,
        totalTrades: 1,
        totalVolume: trade.price || BigInt(0),
        totalFees: trade.fee || BigInt(0),
        totalAssetsIssued: trade.type === TradeType.ISSUE ? 1 : 0,
        totalAssetsTransferred: trade.type === TradeType.TRANSFER ? 1 : 0,
        totalAssetsTraded: trade.type === TradeType.BUY || trade.type === TradeType.SELL ? 1 : 0
      }
    });

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
        From: details ? true : false,
        To: details ? true : false
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
        From: true,
        To: true
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
        OR: [{ fromID: userId }, { toID: userId }]
      },
      include: {
        Asset: true,
        From: true,
        To: true
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
