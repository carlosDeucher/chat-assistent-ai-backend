import type { IVerifyTokenParams } from '../@types/IVerifyTokenParams.js'
import jwt from 'jsonwebtoken'
import { InvalidCredentialsException } from '../exceptions/auth/InvalidCredentialsException.js'
import { EnvVarNotFoundException } from '../exceptions/config/EnvVarNotFoundExceptions.js'
import { IGetCompanyIdFromTokenParams } from '../@types/IGetCompanyIdFromTokenParams.js'

class TokenService {
    /**
     * Gera um token de autenticação com durabilidade curta
     * Utilizado para autenticar a empresa em cada requisição
     */
    static generateAccessToken(companyId: string) {
        const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET
        const accessTokenExpiresIn = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN

        if (!accessTokenSecret)
            throw new EnvVarNotFoundException('JWT_ACCESS_TOKEN_SECRET')
        if (!accessTokenExpiresIn)
            throw new EnvVarNotFoundException('JWT_ACCESS_TOKEN_EXPIRES_IN')

        const accessToken = jwt.sign(
            {
                id: companyId,
            },
            accessTokenSecret,
            {
                subject: companyId,
                expiresIn: accessTokenExpiresIn,
            },
        )

        return accessToken
    }

    /**
     * Gera um token de autenticação com durabilidade longa
     * Utilizado para trocar por um novo access token quando o atual expirar
     */
    static generateRefreshToken(companyId: string) {
        const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET
        const refreshTokenExpiresIn = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN

        if (!refreshTokenSecret)
            throw new EnvVarNotFoundException('JWT_REFRESH_TOKEN_SECRET')
        if (!refreshTokenExpiresIn)
            throw new EnvVarNotFoundException('JWT_REFRESH_TOKEN_EXPIRES_IN')

        const refreshToken = jwt.sign(
            {
                id: companyId,
            },
            refreshTokenSecret,
            {
                subject: companyId,
                expiresIn: refreshTokenExpiresIn,
            },
        )

        return refreshToken
    }

    /**
     * Verifica se o token é válido e retorna a payload dele
     */
    static verify({ token, type = 'access', customSecret }: IVerifyTokenParams) {
        let tokenSecret: string | undefined = ''

        if (customSecret) {
            tokenSecret = customSecret
        } else if (type === 'access') {
            tokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET
        } else if (type === 'refresh') {
            tokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET
        }

        if (!tokenSecret)
            throw new EnvVarNotFoundException(
                'JWT_ACCESS_TOKEN_SECRET | JWT_REFRESH_TOKEN_SECRET',
            )

        try {
            const payload = jwt.verify(token, tokenSecret)
            return payload
        } catch (error) {
            throw new InvalidCredentialsException()
        }
    }

    /**
     * Verifica se é válido e pega o id do usuário a partir do token de autenticação
     */
    static getcompanyIdFromToken({
        request,
        isRefreshToken = false,
    }: IGetCompanyIdFromTokenParams) {
        const authHeader = request.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer '))
            throw new InvalidCredentialsException()

        const token = authHeader.split(' ')[1]

        if (!token) throw new InvalidCredentialsException()

        try {
            const jwtPayload = TokenService.verify({
                token,
                type: isRefreshToken ? 'refresh' : 'access',
            })

            return jwtPayload.sub as string
        } catch (error) {
            throw new InvalidCredentialsException()
        }
    }
}

export default TokenService
