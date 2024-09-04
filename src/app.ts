import { FastifyInstance } from "fastify";
import chatRoutes from "./routes/ChatRoutes.js";
import formbody from "@fastify/formbody";
import companyRoutes from "./routes/CompanyRoutes.js";
import tempUserRoutes from "./routes/TempUserRoutes.js";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { PluginRegisterException } from "./exceptions/config/PluginRegisterException.js";

async function routes(fastify: FastifyInstance) {
  /**
   * Cookie
   */
  try {
    await fastify.register(cookie, {
      hook: "onRequest",
    });
  } catch (error: any) {
    console.error(error.message);
    throw new PluginRegisterException(
      "@fastify/cookie"
    );
  }

  /**
   * CORS
   */
  try {
    await fastify.register(cors, {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    });
  } catch (error: any) {
    console.error(error.message);
    throw new PluginRegisterException(
      "@fastify/cors"
    );
  }

  /**
   * x-www-form-urlencoded
   */
  try {
    await fastify.register(formbody);
  } catch (error: any) {
    console.error(error.message);
    throw new PluginRegisterException(
      "@fastify/formbody"
    );
  }

  fastify.register(chatRoutes);
  fastify.register(companyRoutes);
  fastify.register(tempUserRoutes);
}

export default routes;
