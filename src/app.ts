import { FastifyInstance } from "fastify";
import chatRoutes from './routes/DialogueRoutes.js'
import companyRoutes from './routes/CompanyRoutes.js'
import cookie from '@fastify/cookie'
import { PluginRegisterException } from './exceptions/config/PluginRegisterException.js'

async function routes(fastify: FastifyInstance) {
    /**
       * Cookie
       */
    try {
        await fastify.register(cookie, {
            hook: 'onRequest',
        })
    } catch (error: any) {
        console.error(error.message)
        throw new PluginRegisterException('@fastify/cookie')
    }


    fastify.register(chatRoutes)
    fastify.register(companyRoutes)
}

export default routes