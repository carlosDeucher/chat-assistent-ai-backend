export interface IVerifyTokenParams {
  token: string
  type?: 'access' | 'refresh'
  customSecret?: string
}
