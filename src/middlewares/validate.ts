import { NextFunction, Request, Response } from "express";
import { z, ZodRawShape } from "zod";
import httpStatus from "http-status";

import ApiError from "../utils/ApiError";
import pick from "../utils/pick";

const validate =
  (schema: { body?: z.ZodTypeAny; query?: z.ZodTypeAny; params?: z.ZodTypeAny }) =>
  (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema, ["params", "query", "body"]);
    const obj = pick(req, Object.keys(validSchema));
    try {
      const value = z.object(validSchema as ZodRawShape).parse(obj);
      Object.assign(req, value);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map((err) => err.message).join(", ");
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage, error as unknown as string));
      }
      return next(error);
    }
  };

export default validate;
