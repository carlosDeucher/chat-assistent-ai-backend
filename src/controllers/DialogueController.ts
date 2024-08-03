import { FastifyReply, FastifyRequest } from "fastify";
import AIService from "../services/AIService.js"
import ChatService from "../services/ChatService.js";
import MessageService from "../services/MessageService.js";
import prisma from "../lib/prisma.js";

interface AnswerBody {
    prompt: string
}

interface ChatBody {
    prompt: string
    chatId: string
    whatsapp: string
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
        const { prompt, chatId, whatsapp } = request.body as ChatBody

        const companyId = request.headers.companyId as string

        const company = await prisma.company.findUnique({ select: { id: true, companyName: true, iaInstructions: true }, where: { id: companyId } })
        if (!company) {
            // Empresa não encontrada
            return
        }

        const chat = new ChatService(chatId, company)
        const response = await chat.answer(prompt)

        const answer = response?.answer

        if (answer) {
            MessageService.sendMessage(answer, whatsapp)
        }


    }
}

export default new DialogueController()