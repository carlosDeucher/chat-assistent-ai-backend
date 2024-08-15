import { FastifyInstance } from "fastify";
import chatRoutes from './routes/DialogueRoutes.js'
import formbody from '@fastify/formbody'
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

    /**
 * x-www-form-urlencoded
 */
    try {
        await fastify.register(formbody)
    } catch (error: any) {
        console.error(error.message)
        throw new PluginRegisterException('@fastify/formbody')
    }


    fastify.register(chatRoutes)
    fastify.register(companyRoutes)
}

export default routes