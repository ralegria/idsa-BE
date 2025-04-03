import { DataTypes, literal } from "sequelize";
import { sequelize } from "../database/db.js";
import { User } from "./users.model.js";

export const Donation = sequelize.define("donations", {
  id: {
    type: DataTypes.UUID,
    defaultValue: literal("gen_random_uuid()"),
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  donor_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  donor_email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amount_donated: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  payment_ID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isPaymentCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

User.hasMany(Donation, {
  onDelete: "NO ACTION",
  onUpdate: "NO ACTION",
  foreignKey: "user_id",
  sourceKey: "id",
});
