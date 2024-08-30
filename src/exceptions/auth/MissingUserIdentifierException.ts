import { createError } from '@fastify/error'

export const MissingUserIdentifierException = createError(
    'MISSING_USER_IDENTIFIER',
    'Identificador do usuário não encontrado',
    401,
)
