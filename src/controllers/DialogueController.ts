import { FastifyReply, FastifyRequest } from "fastify";
import AIService from "../services/AIService.js"
import ChatService from "../services/ChatService.js";
import MessageService from "../services/MessageService.js";
import { IUser } from "../@types/IUser.js";

interface AnswerBody {
    prompt: string
}

interface ChatBody {
    prompt: string
    chatId: string
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

    async chat(request: FastifyRequest, reply: FastifyReply) {
        const { prompt, chatId } = request.body as ChatBody

        const empresaId = request.headers.userId as string

        const user = await new Promise((resolve) => setTimeout(resolve, 500)) as IUser

        const chat = new ChatService(chatId, user)
        const response = await chat.answer(prompt)

        const answer = response?.answer

        if (answer) {
            MessageService.sendMessage(answer, user)
        }


    }
}

export default new DialogueController()