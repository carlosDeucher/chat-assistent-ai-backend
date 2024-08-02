import { DataTypes } from "sequelize";
import { sequelize } from "../config.js";

const Empresa = sequelize.define('Empresa', {
    bloqueado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    aiInstructions: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

export default Empresa