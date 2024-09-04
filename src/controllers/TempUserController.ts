import { randomUUID } from "node:crypto";
import TokenService from "../services/TokenService.js";
import {
  FastifyReply,
  FastifyRequest,
} from "fastify";
import ResponseService from "../services/ResponseService.js";

class TempUserController {
  /* 
  Creates a temporary user and returns his accessToken
  */
  static authenticateSession(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const tempUserId = randomUUID();
    const accessToken =
      TokenService.generateAccessToken(
        tempUserId
      );

    return ResponseService.send({
      reply,
      data: { accessToken },
    });
  }
}

export default TempUserController;
