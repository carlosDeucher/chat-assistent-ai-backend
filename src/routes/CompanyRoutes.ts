import { FastifyInstance } from "fastify";
import CompanyController from "../controllers/CompanyController.js";



/**
 * Encapsulates the routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 */
async function routes(fastify: FastifyInstance) {
    fastify.post('/create-company', CompanyController.createOpts, CompanyController.create)
    fastify.post('/login', CompanyController.login)

    fastify.get('/public-company/:id', CompanyController.getPublicCompany)

    return fastify
}

export default routes;
