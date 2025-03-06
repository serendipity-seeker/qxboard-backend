import express from "express";
import validate from "../../middlewares/validate";
import userValidation from "./user.validation";
import userController from "./user.controller";

const router = express.Router();
router
  .route("/")
  .post(validate(userValidation.createUser), userController.createUser)
  .get(validate(userValidation.getUsers), userController.getUsers);
router
  .route("/:id")
  .get(validate(userValidation.getUser), userController.getUserById)
  .put(validate(userValidation.updateUser), userController.updateUser)
  .delete(validate(userValidation.deleteUser), userController.deleteUser);

export default router;
