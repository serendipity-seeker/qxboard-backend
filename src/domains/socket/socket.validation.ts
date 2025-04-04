import { z } from "zod";

const sendTestNotification = {
  body: z.object({
    userId: z.string(),
    message: z.string(),
    title: z.string().optional()
  })
};

const broadcastMessage = {
  body: z.object({
    message: z.string(),
    title: z.string().optional()
  })
};

export default {
  sendTestNotification,
  broadcastMessage
}; 