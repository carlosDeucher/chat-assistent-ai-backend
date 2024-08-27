import type { IResponse } from '../@types/IResponse.js'
import type { IResponseServiceParams } from '../@types/IResponseServiceParams.js'

class ResponseService {
    static send({ reply, data, message, statusCode }: IResponseServiceParams) {
        const status = statusCode || reply.statusCode || 200

        const response: IResponse = {
            statusCode: status,
        }

        if (data) response.data = data

        if (message) response.message = message

        if (data && Array.isArray(data)) {
            response.count = data.length
        }

        reply.status(status).send(response)
    }
}

export default ResponseService
