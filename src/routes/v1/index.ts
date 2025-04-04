import express from "express";

import healthCheckRoute from "../healthcheck";
import tradeRoute from "../../domains/trade/trade.route";
import notificationRoute from "../../domains/notification/notification.route";
import userRoute from "../../domains/user/user.route";
import socketRoute from "../../domains/socket/socket.route";
import assetRoute from "../../domains/assets/assets.route";

const router = express.Router();

const defaultRoutes = [
  {
    path: "/trades",
    route: tradeRoute
  },
  {
    path: "/users",
    route: userRoute
  },
  {
    path: "/health-check",
    route: healthCheckRoute
  },
  {
    path: "/notifications",
    route: notificationRoute
  },
  {
    path: "/socket",
    route: socketRoute
  },
  {
    path: "/assets",
    route: assetRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
