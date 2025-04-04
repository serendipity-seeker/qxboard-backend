import { z } from "zod";

const createAsset = {
  body: z.object({
    name: z.string(),
    issuer: z.string()
  })
};

const getAssets = {
  query: z.object({
    name: z.string().optional(),
    issuer: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
    sortType: z.enum(["asc", "desc"]).optional()
  })
};

const getAsset = {
  params: z.object({
    id: z.string().refine((val) => !isNaN(parseInt(val)), {
      message: "ID must be a number"
    })
  })
};

const getAssetTrades = {
  params: z.object({
    id: z.string().refine((val) => !isNaN(parseInt(val)), {
      message: "ID must be a number"
    })
  }),
  query: z.object({
    limit: z.string().optional(),
    page: z.string().optional(),
    sortBy: z.string().optional(),
    sortType: z.enum(["asc", "desc"]).optional()
  })
};

export default {
  createAsset,
  getAssets,
  getAsset,
  getAssetTrades
};
