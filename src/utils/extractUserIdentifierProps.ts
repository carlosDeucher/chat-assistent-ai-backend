import IFieldUserIdentifier from "../@types/IFieldUserIdentifier.js";
import { MissingUserIdentifierException } from "../exceptions/auth/MissingUserIdentifierException.js";

interface UserIdentifierProps {
    userFieldIdentifier: IFieldUserIdentifier
    userIdentifier: string
}

export default function extractUserIdentifierProps(
  whatsapp?: string,
  tempUserId?: string
): UserIdentifierProps {
  if (whatsapp) {
    return {
      userFieldIdentifier: "whatsapp",
      userIdentifier: whatsapp,
    };
  } else if (tempUserId) {
    return {
      userFieldIdentifier: "tempUserId",
      userIdentifier: tempUserId,
    };
  }

  throw new MissingUserIdentifierException()
}
