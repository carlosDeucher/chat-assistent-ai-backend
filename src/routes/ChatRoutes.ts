import { FastifyInstance } from "fastify";
import ChatController from "../controllers/ChatController.js";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware.js";

/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
  fastify.post("/answer", ChatController.answer);
  fastify.post(
    "/message/:companyId",
    { onRequest: AuthenticationMiddleware },
    ChatController.saveMessage
  );
  fastify.post(
    "/chat/:companyId/:chatId",
    { onRequest: AuthenticationMiddleware },
    ChatController.chat
  );
  fastify.get(
    "/messages/:companyId",
    ChatController.getLastMessages
  );

  return fastify;
}

export default routes;
