import { Content } from "@google/generative-ai";
import AIService from "./AIService.js";
import prisma from "../lib/prisma.js";
import { ChatNotFoundException } from "../exceptions/chat/ChatNotFoundException.js";
import dayjs from "dayjs";
import IFieldUserIdentifier from "../@types/IFieldUserIdentifier.js";

type Company = {
  companyName: string;
  id: string;
  iaInstructions: string;
};

interface ChatService {
  chatId: string;
  company: Company;
  context?: object;
  userFieldIdentifier: IFieldUserIdentifier;
  userIdentifier: string;
}

type AnswerReturn = {
  answer: string;
};

class ChatService {
  constructor(
    chatId: ChatService["chatId"],
    company: ChatService["company"],
    userFieldIdentifier: IFieldUserIdentifier,
    userIdentifier: string
  ) {
    this.chatId = chatId;
    this.company = company;
    this.userFieldIdentifier = userFieldIdentifier;
    this.userIdentifier = userIdentifier;
    this.context = undefined;
  }

  async answer(): Promise<AnswerReturn> {
    const { messages: chatMessages, whatsapp } =
      await this.getChatMessages();

    if (chatMessages.length === 0) {
      throw new ChatNotFoundException();
    }

    const context =
      await this.getOldChatsMessages();

    const aiService = new AIService(
      this.company.iaInstructions
    );

    const answer = await aiService.answerChat(
      chatMessages,
      context
    );
    await this.closeChat();

    return { answer };
  }

  private async getChatMessages() {
    const chatMessages =
      await prisma.chat.findFirst({
        where: { id: this.chatId },
        include: {
          messages: {
            where: { chatId: this.chatId },
            select: {
              id: true,
              content: true,
              createdAt: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

    if (!chatMessages?.messages)
      throw new Error("Chat not found");

    return {
      messages: chatMessages.messages,
      whatsapp: chatMessages.whatsapp,
    };
  }

  private async getOldChatsMessages(): Promise<
    Content[]
  > {
    const oneDayAgo = dayjs()
      .subtract(1, "day")
      .toDate();

    const oldChats = await prisma.chat.findMany({
      where: {
        createdAt: { gt: oneDayAgo },
        companyId: this.company.id,
        [this.userFieldIdentifier]: this.userIdentifier,
        id: { not: this.chatId },
      },
      include: {
        messages: {
          select: {
            id: true,
            content: true,
            role: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const formattedContext: Content[] = [];

    for (const chat of oldChats) {
      const chatMessages = chat.messages;

      for (const {
        role,
        content,
      } of chatMessages) {
        const lastIndex =
          formattedContext.length - 1;

        const lastItem =
          formattedContext[lastIndex];

        if (lastItem?.role == role) {
          lastItem.parts = [
            ...lastItem.parts,
            { text: content },
          ];
        } else {
          formattedContext.push({
            role,
            parts: [{ text: content }],
          });
        }
      }
    }
    return formattedContext;
  }

  private async closeChat(): Promise<void> {
    await prisma.chat.update({
      where: { id: this.chatId },
      data: {
        isOpen: false,
      },
    });
  }
}

export default ChatService;
