import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

const Message = sequelize.define('Message', {
    content: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    whatsapp: {
        type: DataTypes.STRING,
        allowNull: false
    },
    chat_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

export default Message