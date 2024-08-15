import type { FastifyRequest } from 'fastify'

export interface IGetCompanyIdFromTokenParams {
  request: FastifyRequest
  isRefreshToken?: boolean
}
