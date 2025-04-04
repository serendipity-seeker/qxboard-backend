import httpStatus from "http-status";
import pick from "../../utils/pick";
import ApiError from "../../utils/ApiError";
import catchAsync from "../../utils/catchAsync";
import assetsService from "./assets.service";
import { bigintConvert } from "../../utils/bigintConvert";

const createAsset = catchAsync(async (req, res) => {
  const asset = await assetsService.createAsset(req.body);
  res.status(httpStatus.CREATED).json(bigintConvert(asset));
});

const getAssets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "issuer"]);
  const options = pick(req.query, ["sortBy", "limit", "page", "sortType"]);
  
  const result = await assetsService.queryAssets(filter, options);
  res.send(bigintConvert(result));
});

const getAssetById = catchAsync(async (req, res) => {
  const asset = await assetsService.getAssetById(parseInt(req.params.id));
  if (!asset) {
    throw new ApiError(httpStatus.NOT_FOUND, `Asset with id ${req.params.id} not found`);
  }
  res.send(bigintConvert(asset));
});

const getAssetTrades = catchAsync(async (req, res) => {
  const options = pick(req.query, ["limit", "page", "sortBy", "sortType"]);
  const trades = await assetsService.getAssetTrades(parseInt(req.params.id), options);
  res.send(bigintConvert(trades));
});

export default {
  createAsset,
  getAssets,
  getAssetById,
  getAssetTrades
};
