import httpStatus from "http-status";
import { Asset, Prisma, Trade } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import prisma from "../../client";

/**
 * Create an asset
 * @param {Object} createBody
 * @returns {Promise<Asset>}
 */
const createAsset = async (createBody: {
  name: string;
  issuer: string;
}): Promise<Asset> => {
  try {
    // Check if asset already exists
    const existingAsset = await prisma.asset.findFirst({
      where: {
        name: createBody.name,
        issuer: createBody.issuer
      }
    });

    if (existingAsset) {
      return existingAsset;
    }

    // Create the asset
    const asset = await prisma.asset.create({
      data: {
        name: createBody.name,
        issuer: createBody.issuer
      }
    });

    if (!asset) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error creating asset");

    return asset;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error creating asset`, error as string);
  }
};

/**
 * Query for assets
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<Asset[]>}
 */
const queryAssets = async (
  filter: Prisma.AssetWhereInput,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
): Promise<Asset[]> => {
  const page = parseInt(options.page ?? "1", 10);
  const limit = parseInt(options.limit ?? "10", 10);
  const sortBy = options.sortBy ?? "createdAt";
  const sortType = options.sortType ?? "desc";

  try {
    return await prisma.asset.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortType },
      where: filter
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error querying assets", error as string);
  }
};

/**
 * Get asset by id
 * @param {number} id
 * @returns {Promise<Asset | null>}
 */
const getAssetById = async (id: number): Promise<Asset | null> => {
  try {
    return await prisma.asset.findUnique({
      where: { id }
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching asset", error as string);
  }
};

/**
 * Get asset trades
 * @param {number} assetId
 * @param {Object} options - Query options
 * @returns {Promise<Trade[]>}
 */
const getAssetTrades = async (
  assetId: number,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
): Promise<Trade[]> => {
  const page = parseInt(options.page ?? "1", 10);
  const limit = parseInt(options.limit ?? "10", 10);
  const sortBy = options.sortBy ?? "createdAt";
  const sortType = options.sortType ?? "desc";

  try {
    return await prisma.trade.findMany({
      where: { assetID: assetId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortType },
      include: {
        Asset: true,
        Maker: true,
        Taker: true
      }
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error fetching asset trades",
      error as string
    );
  }
};

const getAssetByNameAndIssuer = async (name: string, issuer: string): Promise<Asset | null> => {
  return await prisma.asset.findUnique({
    where: { name_issuer: { name, issuer } }
  });
};

export default {
  createAsset,
  queryAssets,
  getAssetById,
  getAssetTrades,
  getAssetByNameAndIssuer
};
