import { createError } from '@fastify/error'

export const EmailInUseException = createError(
  'ERR_EMAIL_IN_USE',
  'O email já está em uso por outra empresa',
  400,
)
