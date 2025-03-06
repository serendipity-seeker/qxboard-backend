import express from "express";

import healthCheckRoute from "../healthcheck";
import tradeRoute from "../../domains/trade/trade.route";
import notificationRoute from "../../domains/notification/notification.route";
import userRoute from "../../domains/user/user.route";

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
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
