import { IRole } from "../@types/IRole.js";
import prisma from "../lib/prisma.js";


class MessageService {
    static async saveMessage(message: string, role: IRole, companyId: string, chatId: string) {

        await prisma.message.create({ data: { content: message, role, companyId, chatId } })
    }

    static async sendMessage(message: string, whatsapp: string) {

    }

}

export default MessageService