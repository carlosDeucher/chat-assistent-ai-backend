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
        // const { prompt } = request.body as AnswerBody

        // const aiService = new Ai

        // const answer = await AIService.answer(prompt)
        // return reply.status(200).send({ data: { answer }, message: "Success" })
    }

    async chat(request: FastifyRequest, reply: FastifyReply) {
        const { prompt, whatsapp } = request.body as ChatBody

        const companyId = request.headers.companyId as string

        console.log('companyId', companyId)

        const company = await prisma.company.findUnique({ select: { id: true, companyName: true, iaInstructions: true, blocked: true }, where: { id: companyId } })

        if (!company) {
            // Empresa não encontrada
            return
        } else if (company.blocked) {
            // Empresa bloqueada
            return
        }

        const chat = new ChatService(undefined, company)
        const response = await chat.answer(prompt)

        const answer = response?.answer

        if (answer) {
            MessageService.sendMessage(answer, whatsapp)
        }

        return answer

    }
}

export default new DialogueController()