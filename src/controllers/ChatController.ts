import { FastifyReply, FastifyRequest } from "fastify";
import ChatService from "../services/ChatService.js";
import MessageService from "../services/MessageService.js";
import prisma from "../lib/prisma.js";
import { CompanyNotFoundException } from "../exceptions/auth/CompanyNotFoundException.js";
import { CompanyBlockedException } from "../exceptions/auth/CompanyBlockedException.js";
import { z } from 'zod'
import AIService from "../services/AIService.js";

class ChatController {
    async answer(request: FastifyRequest, reply: FastifyReply) {
        const { message } = request.body as {message: string}

        const answer = await new AIService("Responda educadamente").answer(message)
        return reply.status(200).send({ data: { answer }, message: "Success" })
    }

    async saveMessage(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            whatsapp: z.string(),
            message: z.string(),
            companyId: z.string().uuid(),
        })

        const { message, whatsapp, companyId } = bodySchema.parse(request.body)

        let chat = await prisma.chat.findFirst({
            where: {
                companyId,
                whatsapp,
                isOpen: true
            },
            select: { id: true }
        })

        if (!chat) {
            chat = await prisma.chat.create({
                data: {
                    companyId,
                    whatsapp
                }
            })
        }

        await MessageService.saveMessage(message, "user", companyId, chat.id)

        return chat.id
    }

    async chat(request: FastifyRequest, reply: FastifyReply) {
        const bodySchema = z.object({
            whatsapp: z.string(),
        })
        const paramsSchema = z.object({
            chatId: z.string().uuid(),
        })

        const { chatId } = paramsSchema.parse(request.params)
        const { whatsapp } = bodySchema.parse(request.body)

        const companyId = request.headers.companyId as string

        const company = await prisma.company.findUnique({ select: { id: true, companyName: true, iaInstructions: true, blocked: true }, where: { id: companyId } })

        if (!company) {
            throw new CompanyNotFoundException()
        } else if (company.blocked) {
            throw new CompanyBlockedException()
        }

        const chat = new ChatService(chatId, company, whatsapp)
        const response = await chat.answer()

        const { answer } = response

        await MessageService.sendMessage(answer, whatsapp)
        await MessageService.saveMessage(answer, "model", companyId, chatId)

        return answer

    }
}

export default new ChatController()