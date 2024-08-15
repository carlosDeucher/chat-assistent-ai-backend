import { Buffer } from 'buffer'

export function decodeBasicAuth(authHeader: string) {
  const encodedCredentials = authHeader.replace('Basic ', '')

  const decodedCredentials = Buffer.from(
    encodedCredentials,
    'base64',
  ).toString()

  const [username, password] = decodedCredentials.split(':')

  return [username, password]
}
