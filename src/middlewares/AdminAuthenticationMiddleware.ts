import type { FastifyRequest } from 'fastify'
import TokenService from '../services/TokenService.js'
import { InvalidCredentialsException } from '../exceptions/auth/InvalidCredentialsException.js'
import prisma from '../lib/prisma.js'
import { EnvVarNotFoundException } from '../exceptions/config/EnvVarNotFoundExceptions.js'

/**
 * Middleware que verifica se o usuário está autenticado através do token JWT enviado no Bearer Authorization
 */
async function AdminAuthenticationMiddleware(request: FastifyRequest) {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer '))
        throw new InvalidCredentialsException()

    const token = authHeader.split(' ')[1]

    const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET

    if (!accessTokenSecret)
        throw new EnvVarNotFoundException('JWT_ACCESS_TOKEN_SECRET')

    try {
        const payload = TokenService.verify({
            token,
            type: "access",
        })

        if (!payload.sub) throw new InvalidCredentialsException()

        const company = await prisma.company.findUnique({
            where: {
                id: payload.sub as string,
            },
        })

        if (!company) throw new InvalidCredentialsException()

        request.headers.companyId = company.id

        return company
    } catch (err) {
        throw new InvalidCredentialsException()
    }
}

export default AdminAuthenticationMiddleware
