import { createError } from '@fastify/error'

export class EnvVarNotFoundException extends createError(
  'ERR_ENV_VAR_NOT_FOUND',
  'Variável de Ambiente não encontrada:',
  500,
) {
  constructor(name: string) {
    super(name)
  }
}
