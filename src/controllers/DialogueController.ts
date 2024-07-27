import { FastifyReply, FastifyRequest } from "fastify";
import AIService from "../services/AIService.js"

interface AnswerBody {
    prompt: string
}

class DialogueController {
    get answerOpts() {
        return {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        prompt: { type: 'string' },
                    },
                    required: ['prompt']
                },

            }
        }
    }

    async answer(request: FastifyRequest, reply: FastifyReply) {
        const { prompt } = request.body as AnswerBody

        const answer = await AIService.answer(prompt)
        return reply.status(200).send({ data: { answer }, message: "Success" })
    }
}

export default new DialogueController()