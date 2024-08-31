import IFieldUserIdentifier from "../@types/IFieldUserIdentifier.js";
import { IRole } from "../@types/IRole.js";
import prisma from "../lib/prisma.js";

interface saveMessageParam {
  message: string;
  role: IRole;
  companyId: string;
  chatId: string;
  userFieldIdentifier: IFieldUserIdentifier;
  userIdentifier: string;
}

class MessageService {
  /* 
  Save the message in the database
  */
  static async saveMessage({
    message,
    role,
    companyId,
    chatId,
    userFieldIdentifier,
    userIdentifier,
  }: saveMessageParam) {
    await prisma.message.create({
      data: {
        content: message,
        role,
        companyId,
        chatId,
        [userFieldIdentifier]: userIdentifier,
      },
    });
  }

  static async sendMessage(
    message: string,
    whatsapp: string
  ) {}
}

export default MessageService;
