import { z } from "zod";

const createTrade = {
  body: z.object({
    maker: z.string().optional(),
    taker: z.string().optional(),
    price: z
      .string()
      .or(z.number())
      .transform((val) => BigInt(val)),
    amount: z
      .string()
      .or(z.number())
      .transform((val) => BigInt(val)),
    tick: z.number().int(),
    assetID: z.number().int(),
    txHash: z.string(),
    fee: z
      .string()
      .or(z.number())
      .transform((val) => BigInt(val))
      .optional()
  })
};

const getTrades = {
  query: z.object({
    maker: z.string().optional(),
    taker: z.string().optional(),
    assetID: z.number().int().optional(),
    txHash: z.string().optional(),
    tick: z.number().int().optional(),
    sortBy: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
    startTick: z.number().int().optional(),
    endTick: z.number().int().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    sortType: z.enum(["asc", "desc"]).optional(),
    details: z.enum(["true", "false"]).optional()
  })
};

const getTrade = {
  params: z.object({
    txHash: z.string()
  })
};

const getUserTrade = {
  params: z.object({
    userId: z.string()
  })
};

const updateTrade = {
  params: z.object({
    txHash: z.string()
  }),
  body: z.object({
    amount: z
      .string()
      .or(z.number())
      .transform((val) => BigInt(val))
      .optional()
  })
};

const deleteTrade = {
  params: z.object({
    txHash: z.string()
  })
};

export default {
  createTrade,
  getTrades,
  getTrade,
  getUserTrade,
  updateTrade,
  deleteTrade
};
