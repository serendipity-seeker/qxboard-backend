import httpStatus from "http-status";
import pick from "../../utils/pick";
import ApiError from "../../utils/ApiError";
import catchAsync from "../../utils/catchAsync";
import tradeService from "./trade.service";
import { bigintConvert } from "../../utils/bigintConvert";
import userService from "../user/user.service";

const createTrade = catchAsync(async (req, res) => {
  // Create user if they don't exist
  const maker = req.body.maker;
  if (maker) {
    const user = await userService.getUserById(maker);
    if (!user) {
      await userService.createUser({
        id: maker
      });
    }
  }

  const taker = req.body.taker;
  if (taker) {
    const user = await userService.getUserById(taker);
    if (!user) {
      await userService.createUser({
        id: taker
      });
    }
  }

  const trade = await tradeService.createTrade({
    ...req.body
  });
  res.status(httpStatus.CREATED).json(bigintConvert(trade));
});

const getTrades = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["maker", "taker", "assetID", "txHash", "tick"]);
  const options = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "sortType",
    "details",
    "startTime",
    "endTime",
    "startTick",
    "endTick"
  ]);

  const result = await tradeService.queryTrades(filter, options);
  res.send(bigintConvert(result));
});

const getTradeByTxHash = catchAsync(async (req, res) => {
  const trade = await tradeService.getTradeByTxHash(req.params.txHash);
  if (!trade) {
    throw new ApiError(httpStatus.NOT_FOUND, `Trade with txHash ${req.params.txHash} not found`);
  }
  res.send(bigintConvert(trade));
});

const getUserTrades = catchAsync(async (req, res) => {
  const trades = await tradeService.getUserTrades(req.params.userId);
  res.send(bigintConvert(trades));
});

export default {
  createTrade,
  getTrades,
  getTradeByTxHash,
  getUserTrades
};
