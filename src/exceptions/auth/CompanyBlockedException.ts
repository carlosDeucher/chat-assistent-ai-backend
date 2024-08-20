import { createError } from '@fastify/error'

export const CompanyBlockedException = createError(
    'ERR_COMPANY_BLOCKED',
    'Empresa bloqueada',
    401,
)
