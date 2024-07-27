import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import DialogueController from "../controllers/DialogueController.js";



/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
    fastify.post('/answer', DialogueController.answerOpts, DialogueController.answer)

    return fastify
}

//ESM
export default routes;
