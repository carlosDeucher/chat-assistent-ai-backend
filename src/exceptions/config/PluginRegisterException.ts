import { createError } from '@fastify/error'

export const PluginRegisterException = createError(
  'ERR_PLUGIN_REGISTER',
  'Erro ao registrar plugin:',
  500,
)