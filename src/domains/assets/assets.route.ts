import express from "express";
import validate from "../../middlewares/validate";
import assetsValidation from "./assets.validation";
import assetsController from "./assets.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(auth, validate(assetsValidation.createAsset), assetsController.createAsset)
  .get(validate(assetsValidation.getAssets), assetsController.getAssets);

router
  .route("/:id")
  .get(validate(assetsValidation.getAsset), assetsController.getAssetById);

router
  .route("/trades/:id")
  .get(validate(assetsValidation.getAssetTrades), assetsController.getAssetTrades);

export default router;
