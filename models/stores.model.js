import { DataTypes, literal } from "sequelize";
import { sequelize } from "../database/db.js";
import { User } from "./users.model.js";

export const Store = sequelize.define(
  "stores",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: literal("gen_random_uuid()"),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

// Define the relationship after User model is imported
// This will be executed after all models are defined
export const defineStoreRelationships = () => {
  Store.hasMany(User, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
    foreignKey: "store_id",
    sourceKey: "id",
  });
};
