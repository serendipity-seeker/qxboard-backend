import httpStatus from "http-status";

import { bigintConvert } from "../../utils/bigintConvert";
import ApiError from "../../utils/ApiError";
import catchAsync from "../../utils/catchAsync";
import pick from "../../utils/pick";
import userService from "./user.service";

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).json(bigintConvert(user));
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["username"]);
  const options = pick(req.query, ["sortBy", "limit", "page", "sortType"]);
  const result = await userService.queryUsers(filter, options);
  res.send(bigintConvert(result));
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.send(bigintConvert(user || {}));
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.id, req.body);
  res.send(bigintConvert(user));
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};
