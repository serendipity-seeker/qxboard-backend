import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { version } from "../../package.json";
import config from "./config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Qubic NFT Marketplace API Documentation",
      version,
      description: "API documentation for Qubic NFT Marketplace server"
    },
    servers: [
      {
        url: `http://localhost:5173/api/v1`
      }
    ]
  },
  apis: [
    "./src/routes/v1/*.ts",
    "./src/routes/v1/*.yml",
    "./src/domains/**/*.route.ts",
    "./src/domains/**/*.api.yml",
    "./prisma/schema.swagger.ts"
  ]
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app: any, port: number) => {
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/v1/docs.json", (req: any, res: any) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

export default swaggerDocs;
