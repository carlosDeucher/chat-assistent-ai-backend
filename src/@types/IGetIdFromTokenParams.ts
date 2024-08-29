import type { FastifyRequest } from 'fastify'

export interface IGetIdFromTokenParams {
  request: FastifyRequest
  isRefreshToken?: boolean
}
