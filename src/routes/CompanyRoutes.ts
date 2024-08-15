import { FastifyInstance } from "fastify";
import CompanyController from "../controllers/CompanyController.js";



/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
    fastify.post('/create-company', CompanyController.createOpts, CompanyController.create)
    fastify.post('/login', CompanyController.loginOpts, CompanyController.login)

    return fastify
}

export default routes;
