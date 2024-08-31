import {
  FastifyReply,
  FastifyRequest,
} from "fastify";
import ChatService from "../services/ChatService.js";
import MessageService from "../services/MessageService.js";
import prisma from "../lib/prisma.js";
import { CompanyNotFoundException } from "../exceptions/auth/CompanyNotFoundException.js";
import { CompanyBlockedException } from "../exceptions/auth/CompanyBlockedException.js";
import { z } from "zod";
import AIService from "../services/AIService.js";
import TokenService from "../services/TokenService.js";
import ResponseService from "../services/ResponseService.js";
import IFieldUserIdentifier from "../@types/IFieldUserIdentifier.js";
import dayjs from "dayjs";

class ChatController {
  /* 
  Deprecated (Used for respond a single question, that is not a chat)
  */
  async answer(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const { message } = request.body as {
      message: string;
    };

    const answer = await new AIService(
      "Responda educadamente"
    ).answer(message);
    return reply.status(200).send({
      data: { answer },
      message: "Success",
    });
  }

  /*
  Save the message sent by the user from WEB or WhatsApp webhooks (not implemented yet)
  */
  async saveMessage(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const paramsSchema = z.object({
      companyId: z.string().uuid(),
    });
    const bodySchema = z.object({
      message: z.string(),
    });

    const { message } = bodySchema.parse(
      request.body
    );

    const { companyId } = paramsSchema.parse(
      request.params
    );

    const userFieldIdentifier = request.headers
      .userFieldIdentifier as IFieldUserIdentifier;
    const userIdentifier = request.headers
      .userIdentifier as string;

    /* 
    Checks for an open company chat with the current user
    */
    let chat = await prisma.chat.findFirst({
      where: {
        companyId,
        isOpen: true,
        [userFieldIdentifier]: userIdentifier,
      },
      select: { id: true },
    });

    /* 
    IF any chats are open, creates a new one
    */
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          companyId,
          [userFieldIdentifier]: userIdentifier,
        },
      });
    }

    await MessageService.saveMessage({
      message,
      role: "user",
      companyId,
      chatId: chat.id,
      userFieldIdentifier,
      userIdentifier,
    });

    return ResponseService.send({
      reply,
      message: "Mensagem salva com sucesso",
    });
  }

  /* 
  Answer the chat specified based on the chat
  messages and other messages sent until 24 hours ago
  */
  async chat(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const paramsSchema = z.object({
      chatId: z.string().uuid(),
      companyId: z.string().uuid(),
    });

    const { chatId, companyId } =
      paramsSchema.parse(request.params);

    const userFieldIdentifier = request.headers
      .userFieldIdentifier as IFieldUserIdentifier;
    const userIdentifier = request.headers
      .userIdentifier as string;

    const company =
      await prisma.company.findUnique({
        select: {
          id: true,
          companyName: true,
          iaInstructions: true,
          blocked: true,
        },
        where: { id: companyId },
      });

    if (!company) {
      throw new CompanyNotFoundException();
    } else if (company.blocked) {
      throw new CompanyBlockedException();
    }

    const chat = new ChatService(
      chatId,
      company,
      userFieldIdentifier,
      userIdentifier
    );
    const response = await chat.answer();

    const { answer } = response;

    await MessageService.saveMessage({
      message: answer,
      role: "model",
      companyId,
      chatId,
      userFieldIdentifier,
      userIdentifier,
    });

    return ResponseService.send({
      reply,
      data: { answer },
    });
  }

  /* 
   Get messages with the creation date greater than the startDate specified
   Request only used by the web client
  */
  async getLastMessages(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const tempUserId =
      TokenService.getIdFromToken({ request });

    const searchParamsSchema = z.object({
      startDate: z.string().optional(),
    });

    const paramsSchema = z.object({
      companyId: z.string().uuid(),
    });

    const { startDate: startDateEncoded } =
      searchParamsSchema.parse(request.query);

    // Unix Epoch January 1st, 1970 at UTC
    let startDate = dayjs(0).toDate();

    if (startDateEncoded) {
      const decodedISOString = decodeURIComponent(
        startDateEncoded
      );
      startDate = dayjs(
        decodedISOString
      ).toDate();
    }

    const { companyId } = paramsSchema.parse(
      request.params
    );

    const messages =
      await prisma.message.findMany({
        where: {
          companyId,
          tempUserId,
          createdAt: {
            gt: startDate,
          },
        },
        select: {
          id: true,
          content: true,
          role: true,
          createdAt: true,
          chatId: true,
        },
      });

    ResponseService.send({
      reply,
      data: { messages },
    });
  }
}

export default new ChatController();
