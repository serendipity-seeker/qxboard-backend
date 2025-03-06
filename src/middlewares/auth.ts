import { NextFunction, Request, Response } from "express";

import prisma from "../client";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const sender = req.headers.user as string;
  if (!sender) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let user = await prisma.user.findUnique({
    where: {
      id: sender
    }
  });

  if (!user) {
    // create user if not exists
    const newUser = await prisma.user.create({
      data: {
        id: sender
      }
    });
    user = newUser;
  }

  // Extend Request type to include user property
  (req as any).user = user;

  next();
};

export default auth;
