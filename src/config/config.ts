import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"]),
  PORT: z.coerce.number().default(3000),
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