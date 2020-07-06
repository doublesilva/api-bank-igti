import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import HapiSwagger from "hapi-swagger";

import pkg from "dotenv";
import { join, resolve } from "path";
import { ok } from "assert";
const { config } = pkg;
import mapRoutes from "./src/helpers/route.helper.js";
import AccountRoute from "./src/routes/account.route.js";
import AccountServie from "./src/services/account.service.js";

const env = process.env.NODE_ENV || "dev";
ok(env === "prod" || env === "dev", "a env é inválida, ou dev ou prod");

const __dirname = resolve();
const configPath = join(__dirname, "./config", `.env.${env}`);

config({
  path: configPath,
});

const app = new Hapi.Server({ port: process.env.PORT });

async function Main() {
  const service = await new AccountServie(true);
  app.route([...mapRoutes(new AccountRoute(service), AccountRoute.methods())]);

  const swaggerOptions = {
    documentationPath: "/",
    info: {
      title: "API Accounts - #DevFullStakc IGTI",
      version: "v1.0",
      contact: {
        name: "Diego Silva",
        email: "silva.pucrs@gmail.com",
        url: "https://github.com/doublesilva/",
      },
    }
  };

  await app.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  await app.start();
  console.log("server running at", app.info.port);
  return app;
}

export default Main();
