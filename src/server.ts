// ESM
import Fastify from 'fastify'
import firstRoute from './routes/DialogueRoutes.js'

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: false
})

fastify.register(firstRoute)

fastify.listen({ port: 3000 }, function (err: any, address: any) {
  console.log("Servidor ouvindo na porta 3000")

  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})

const app = fastify

export { app }