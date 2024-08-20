import { FastifyInstance } from "fastify";
import DialogueController from "../controllers/ChatController.js";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware.js";



/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
    fastify.post('/answer', DialogueController.answer)
    fastify.post('/save-message', DialogueController.saveMessage)
    fastify.post('/chat/:chatId', { onRequest: AuthenticationMiddleware }, DialogueController.chat)

    return fastify
}

export default routes;
