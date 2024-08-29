import { FastifyInstance } from "fastify";
import TempUserController from "../controllers/TempUserController.js";



/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
  fastify.post('/authenticate-session', TempUserController.authenticateSession)

  return fastify
}

export default routes;
