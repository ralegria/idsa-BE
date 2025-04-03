import { DataTypes } from "sequelize";
import { sequelize } from "../database/db.js";

import { User } from "./users.model.js";

export const Roles = sequelize.define(
  "roles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

Roles.hasMany(User, {
  onDelete: "NO ACTION",
  onUpdate: "NO ACTION",
  foreignKey: "role_id",
  sourceKey: "id",
});
