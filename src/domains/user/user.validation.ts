import { z } from "zod";

const createUser = {
  body: z.object({
    id: z.string(),
    username: z.string().optional()
  })
};

const getUsers = {
  query: z.object({
    username: z.string().optional(),
    sortBy: z.string().optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
    sortType: z.enum(["asc", "desc"]).optional(),
    details: z.enum(["true", "false"]).optional()
  })
};

const getUser = {
  params: z.object({
    id: z.string()
  })
};

const updateUser = {
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    username: z.string().optional()
  })
};

const deleteUser = {
  params: z.object({
    id: z.string()
  })
};

export default {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
}; 