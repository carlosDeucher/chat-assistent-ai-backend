import { createError } from '@fastify/error'

export const ChatNotFoundException = createError(
    'ERR_PENDING_CHAT_NOT_FOUND',
    'Não foi encontrado nenhum chat aberto',
    404,
)
