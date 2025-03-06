import { z } from "zod";

const getNotifications = {
  query: z.object({
    read: z.enum(["true", "false"]).optional(),
    sortBy: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
    sortType: z.enum(["asc", "desc"]).optional(),
    details: z.enum(["true", "false"]).optional()
  })
};

const getNotification = {
  params: z.object({
    id: z.string().refine((val) => !isNaN(Number(val)), {
      message: "ID must be a valid number"
    })
  })
};

const createNotification = {
  body: z.object({
    userID: z.string(),
    title: z.string().optional(),
    message: z.string(),
    read: z.boolean().default(false)
  })
};

export default {
  getNotifications,
  getNotification,
  createNotification
};
