import { FastifyRequest } from "fastify";
import TokenService from "../services/TokenService.js";
import extractUserIdentifierProps from "../utils/extractUserIdentifierProps.js";
import { MissingUserIdentifierException } from "../exceptions/auth/MissingUserIdentifierException.js";

async function AuthenticationMiddleware(
  request: FastifyRequest
) {
  const whatsapp = request.headers
    .whatsapp as string;

  const authHeader =
    request.headers.authorization;

  if (!whatsapp && !authHeader)
    throw new MissingUserIdentifierException();

  const tempUserId = whatsapp
    ? undefined
    : TokenService.getIdFromToken({ request });

  const { userIdentifier, userFieldIdentifier } =
    extractUserIdentifierProps(
      whatsapp,
      tempUserId
    );

  request.headers.userIdentifier = userIdentifier;
  request.headers.userFieldIdentifier =
    userFieldIdentifier;

  return;
}

export default AuthenticationMiddleware;
