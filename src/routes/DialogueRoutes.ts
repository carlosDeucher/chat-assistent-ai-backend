import { FastifyInstance } from "fastify";
import DialogueController from "../controllers/DialogueController.js";
import AuthenticationMiddleware from "../middlewares/AuthenticationMiddleware.js";



/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
    fastify.post('/answer', DialogueController.answerOpts, DialogueController.answer)
    fastify.post('/chat', { onRequest: AuthenticationMiddleware }, DialogueController.chat)

    return fastify
}

export default routes;
