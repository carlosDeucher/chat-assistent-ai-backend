import { IUser } from "../@types/IUser.js"
import AIService from "./AIService.js"

interface ChatService {
    chatId: undefined | string
    user: undefined | IUser
    context: undefined | object
}

interface AnswerReturn {
    answer?: string
}

class ChatService {
    constructor(chatId: ChatService["chatId"], user: ChatService["user"]) {
        this.chatId = chatId
        this.user = user
        this.context = undefined
    }

    async answer(question: string): Promise<AnswerReturn | undefined> {
        if (!this.chatId) await this.searchForChat()

        const context = this.getChatContext()

        const shouldAnswer = this.checkIfIsQuestion()

        if (shouldAnswer) {
            const answer = await AIService.answerChat(question, context)

            return { answer }
        } else {
            return {}
        }
    }


    private async searchForChat() {
        // Encontrar nas 
    }

    private async getChatContext() {
        
    }

    private checkIfIsQuestion(): boolean {
        // Executar um algoritmo ou IA pra definir se deve ser respondida a pergunta
        return true
    }
}

export default ChatService