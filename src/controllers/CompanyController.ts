import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma.js";
import { ONE_YEAR_IN_SECONDS } from '../utils/constants.js'
import bcryptjs from 'bcryptjs'
import { EmailInUseException } from "../exceptions/company/EmailInUseException.js";
import { InvalidCredentialsException } from "../exceptions/auth/InvalidCredentialsException.js";
import TokenService from "../services/TokenService.js";
import { decodeBasicAuth } from "../utils/decodeBasicAuth.js";
import { z } from "zod";
import { CompanyNotFoundException } from "../exceptions/auth/CompanyNotFoundException.js";
import ResponseService from "../services/ResponseService.js";

type CreateBody = {
  companyName: string
  password: string
  iaInstructions: string
  email: string
}

class CompanyController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization

    const isInvalidCredential = !authHeader || !authHeader.startsWith('Basic ')

    if (isInvalidCredential) throw new InvalidCredentialsException()

    const [email, password] = decodeBasicAuth(authHeader)

    const company = await prisma.company.findUnique({
      select: {
        id: true,
        password: true,
      },
      where: {
        email,
      },
    })

    if (!company) {
      throw new Error("Usuário não encontrado")
    }


    // Caso não exista uma empresa com o e-mail informado, retorna o erro
    if (!company) throw new InvalidCredentialsException()

    const passwordMatch = bcryptjs.compareSync(password, company.password)

    if (!passwordMatch) throw new InvalidCredentialsException()

    const accessToken = TokenService.generateAccessToken(company.id)
    const refreshToken = TokenService.generateRefreshToken(company.id)

    return reply
      .setCookie('jwt_token', accessToken, {
        path: '/',
        httpOnly: false,
        sameSite: 'none',
        secure: true,
        maxAge: ONE_YEAR_IN_SECONDS,
      }).setCookie('jwt_refresh_token', refreshToken, {
        path: '/',
        httpOnly: false,
        sameSite: 'none',
        secure: true,
        maxAge: ONE_YEAR_IN_SECONDS,
      })
      .send({ accessToken, refreshToken, id: company.id })

  }

  get createOpts() {
    return {
      schema: {
        body: {
          type: 'object',
          properties: {
            companyName: { type: 'string' },
            password: { type: "string" },
            iaInstructions: { type: "string" },
            email: { type: "string" }
          },
          required: ['companyName', 'password', 'iaInstructions', 'email']
        },

      }
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const { companyName, password, iaInstructions, email } = request.body as CreateBody

    /**
    * 1 - Procura se a empresa já existe com base no e-mail
    */
    const company = await prisma.company.findUnique({
      where: {
        email,
      },
    })

    // Caso o email esteja em uso retorna erro
    if (company) {
      throw new EmailInUseException()
    }

    const saltRounds = 10
    const passwordHash = bcryptjs.hashSync(password, saltRounds)

    await prisma.company.create({ data: { companyName, password: passwordHash, iaInstructions, email } })

    return reply.status(200).send({ message: "Success" })
  }

  async getPublicCompany(request: FastifyRequest, reply: FastifyReply) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const company = await prisma.company.findUnique({ where: { id }, select: { id: true, companyName: true } })

    if (!company) {
      throw new CompanyNotFoundException()
    }

    const { companyName } = company

    return ResponseService.send({
      reply,
      data: {
        id: company.id,
        companyName,
      },
    })
  }
}

export default new CompanyController()