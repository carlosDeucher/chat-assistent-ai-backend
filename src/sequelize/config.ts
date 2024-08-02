import { Sequelize } from "sequelize"

export const sequelize = new Sequelize('postgresql://postgres:postgres@localhost:5432/chat-ia', { logging: false }) // Example for postgres
