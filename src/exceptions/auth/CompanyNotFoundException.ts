import { createError } from '@fastify/error'

export const CompanyNotFoundException = createError(
    'ERR_COMPANY_NOT_FOUND',
    'Não foi encontrada nenhuma empresa com este id',
    404,
)
