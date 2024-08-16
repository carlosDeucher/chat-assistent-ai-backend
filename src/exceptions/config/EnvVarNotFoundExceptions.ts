import { createError } from '@fastify/error'

export const EnvVarNotFoundException = createError(
  'ERR_ENV_VAR_NOT_FOUND',
  'Variável de Ambiente não encontrada:',
  500,
)