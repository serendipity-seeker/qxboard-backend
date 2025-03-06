import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().describe("JWT secret key"),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30).describe("minutes after which access tokens expire"),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30).describe("days after which refresh tokens expire"),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce.number().default(10).describe("minutes after which reset password token expires"),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.coerce.number().default(10).describe("minutes after which verify email token expires"),
  SMTP_HOST: z.string().optional().describe("server that will send the emails"),
  SMTP_PORT: z.coerce.number().optional().describe("port to connect to the email server"),
  SMTP_USERNAME: z.string().optional().describe("username for email server"),
  SMTP_PASSWORD: z.string().optional().describe("password for email server"),
  EMAIL_FROM: z.string().optional().describe("the from field in the emails sent by the app")
}).passthrough();

const envVars = envVarsSchema.parse(process.env);

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD
      }
    },
    from: envVars.EMAIL_FROM
  }
};

export const tickAddition = 4;