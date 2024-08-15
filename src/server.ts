import Fastify from 'fastify'



function bootstrap() {
  const app = Fastify({
    logger: false
  })

  app.register(import('./app.js'))

  app.listen({ port: 3000 }, function (err: any, address: any) {
    console.log("Servidor ouvindo na porta 3000")

    if (err) {
      console.error(err)
      app.log.error(err)
      process.exit(1)
    }
    // Server is now listening on ${address}
  })
}

bootstrap()