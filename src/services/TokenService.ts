import type { IVerifyTokenParams } from "../@types/IVerifyTokenParams.js";
import jwt from "jsonwebtoken";
import { InvalidCredentialsException } from "../exceptions/auth/InvalidCredentialsException.js";
import { EnvVarNotFoundException } from "../exceptions/config/EnvVarNotFoundExceptions.js";
import { IGetIdFromTokenParams } from "../@types/IGetIdFromTokenParams.js";

class TokenService {
  /**
   * Generate an auth token
   * Used to authenticate company
   */
  static generateAccessToken(id: string) {
    const accessTokenSecret =
      process.env.JWT_ACCESS_TOKEN_SECRET;
    const accessTokenExpiresIn =
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;

    if (!accessTokenSecret)
      throw new EnvVarNotFoundException(
        "JWT_ACCESS_TOKEN_SECRET"
      );
    if (!accessTokenExpiresIn)
      throw new EnvVarNotFoundException(
        "JWT_ACCESS_TOKEN_EXPIRES_IN"
      );

    const accessToken = jwt.sign(
      {
        id: id,
      },
      accessTokenSecret,
      {
        subject: id,
        expiresIn: accessTokenExpiresIn,
      }
    );

    return accessToken;
  }

  /**
   * Generate an auth token
   * Used to update access token when it expires
   */
  static generateRefreshToken(id: string) {
    const refreshTokenSecret =
      process.env.JWT_REFRESH_TOKEN_SECRET;
    const refreshTokenExpiresIn =
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;

    if (!refreshTokenSecret)
      throw new EnvVarNotFoundException(
        "JWT_REFRESH_TOKEN_SECRET"
      );
    if (!refreshTokenExpiresIn)
      throw new EnvVarNotFoundException(
        "JWT_REFRESH_TOKEN_EXPIRES_IN"
      );

    const refreshToken = jwt.sign(
      {
        id: id,
      },
      refreshTokenSecret,
      {
        subject: id,
        expiresIn: refreshTokenExpiresIn,
      }
    );

    return refreshToken;
  }

  /**
   * Checks if is a valid token and return its payload
   */
  static verify({
    token,
    type = "access",
    customSecret,
  }: IVerifyTokenParams) {
    let tokenSecret: string | undefined = "";

    if (customSecret) {
      tokenSecret = customSecret;
    } else if (type === "access") {
      tokenSecret =
        process.env.JWT_ACCESS_TOKEN_SECRET;
    } else if (type === "refresh") {
      tokenSecret =
        process.env.JWT_REFRESH_TOKEN_SECRET;
    }

    if (!tokenSecret)
      throw new EnvVarNotFoundException(
        "JWT_ACCESS_TOKEN_SECRET | JWT_REFRESH_TOKEN_SECRET"
      );

    try {
      const payload = jwt.verify(
        token,
        tokenSecret
      );
      return payload;
    } catch (error) {
      throw new InvalidCredentialsException();
    }
  }

  /**
   * Checks if is valid and get the user id by the auth token
   */
  static getIdFromToken({
    request,
    isRefreshToken = false,
  }: IGetIdFromTokenParams) {
    const authHeader =
      request.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    )
      throw new InvalidCredentialsException();

    const token = authHeader.split(" ")[1];

    if (!token)
      throw new InvalidCredentialsException();

    try {
      const jwtPayload = TokenService.verify({
        token,
        type: isRefreshToken
          ? "refresh"
          : "access",
      });

      return jwtPayload.sub as string;
    } catch (error) {
      throw new InvalidCredentialsException();
    }
  }
}

export default TokenService;
