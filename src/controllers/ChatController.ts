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
import extractUserIdentifierProps from "../utils/extractUserIdentifierProps.js";
import dayjs from "dayjs";

class ChatController {
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

  async saveMessage(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const bodySchema = z.object({
      message: z.string(),
      companyId: z.string().uuid(),
    });

    const { message, companyId } =
      bodySchema.parse(request.body);

    const userFieldIdentifier = request.headers
      .userFieldIdentifier as IFieldUserIdentifier;
    const userIdentifier = request.headers
      .userIdentifier as string;

    let chat = await prisma.chat.findFirst({
      where: {
        companyId,
        isOpen: true,
        [userFieldIdentifier]: userIdentifier,
      },
      select: { id: true },
    });

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

  // Request only user by the web client
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
        },
      });

    ResponseService.send({
      reply,
      data: { messages },
    });
  }
}

export default new ChatController();
