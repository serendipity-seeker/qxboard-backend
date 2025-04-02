import httpStatus from "http-status";

import { User, Prisma } from "@prisma/client";

import ApiError from "../../utils/ApiError";
import prisma from "../../client";

/**
 * Create a user
 * @param {Object} createBody
 * @returns {Promise<User>}
 */
const createUser = async (createBody: { id: string; username?: string }): Promise<User> => {
  try {
    return await prisma.user.create({
      data: createBody
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error creating user", error as string);
  }
};

/**
 * Query for users
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @returns {Promise<User[]>}
 */
const queryUsers = async (
  filter: Prisma.UserWhereInput,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
): Promise<User[]> => {
  const page = parseInt(options.page ?? "1", 10);
  const limit = parseInt(options.limit ?? "10", 10);
  const sortBy = options.sortBy ?? "createdAt";
  const sortType = options.sortType ?? "desc";

  try {
    return await prisma.user.findMany({
      where: filter,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortType }
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error querying users", error as string);
  }
};

/**
 * Get user by id
 * @param {string} id
 * @returns {Promise<User | null>}
 */
const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        notifications: true,
        makerTrades: true,
        takerTrades: true
      }
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error fetching user", error as string);
  }
};

/**
 * Update user by id
 * @param {string} userId
 * @param {Prisma.UserUpdateInput} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (
  userId: string,
  updateBody: Prisma.UserUpdateInput
): Promise<User> => {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: updateBody
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error updating user", error as string);
  }
};

/**
 * Delete user by id
 * @param {string} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId: string): Promise<User> => {
  try {
    return await prisma.user.delete({
      where: { id: userId }
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Error deleting user", error as string);
  }
};

export default {
  createUser,
  queryUsers,
  getUserById,
  updateUserById,
  deleteUserById
};
