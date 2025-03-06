import express from "express";
import validate from "../../middlewares/validate";
import tradeValidation from "./trade.validation";
import tradeController from "./trade.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(auth, validate(tradeValidation.createTrade), tradeController.createTrade)
  .get(validate(tradeValidation.getTrades), tradeController.getTrades);

router
  .route("/:txHash")
  .get(validate(tradeValidation.getTrade), tradeController.getTradeByTxHash);

router
  .route("/user/:userId")
  .get(validate(tradeValidation.getTrade), tradeController.getUserTrades);

export default router;
