import { EnvVarNotFoundException } from "../exceptions/config/EnvVarNotFoundExceptions.js"
import { Content, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from 'dotenv'

dotenv.config();

const generationConfig = {
  stopSequences: ["red"],
  maxOutputTokens: 8192,
  temperature: 0.65,
  topP: 0.95,
  topK: 64,
};

interface AIService {
}

class AIService {
  constructor(systemInstruction: string) {
    const apiKey = process.env.API_KEY_GEMINI
    if (!apiKey) throw new EnvVarNotFoundException("API_KEY_GEMINI")

    const genAI = new GoogleGenerativeAI(apiKey);

    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", systemInstruction, generationConfig });

  }

  private model: GenerativeModel


  async answer(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt)
    return result.response.text()
  }

  async answerChat(question: string, context: Content[]): Promise<string> {
    const chat = this.model.startChat({
      history: context,
    });

    let result = await chat.sendMessage(question);
    const answer = result.response.text()
    return answer
  }
}

export default AIService