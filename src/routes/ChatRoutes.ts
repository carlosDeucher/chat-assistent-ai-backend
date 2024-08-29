import { FastifyInstance } from "fastify";
import ChatController from "../controllers/ChatController.js";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware.js";



/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
  fastify.post('/answer', ChatController.answer)
  fastify.post('/message', { onRequest: AuthenticationMiddleware }, ChatController.saveMessage)
  fastify.post('/chat/:chatId', { onRequest: AuthenticationMiddleware }, ChatController.chat)
  fastify.get('/messages/:companyId', { onRequest: AuthenticationMiddleware }, () => null)

  return fastify
}

export default routes;
