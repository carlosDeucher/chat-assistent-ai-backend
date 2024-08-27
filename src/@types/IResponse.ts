export interface IResponse {
  statusCode: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: Record<string, any>
  count?: number
  message?: string
}
