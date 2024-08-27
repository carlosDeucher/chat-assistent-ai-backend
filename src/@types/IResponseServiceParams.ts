import type { FastifyReply } from 'fastify'

export interface IResponseServiceParams {
  reply: FastifyReply
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>
  message?: string
  statusCode?: number
}
