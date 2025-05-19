module.exports = (sequelize, DataTypes) => {
  const FavoriteTool = sequelize.define(
    "favoriteTool",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      toolUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      toolName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: "favorite_tool_user_id_index",
          using: "BTREE",
          fields: ["userId"],
        },
        {
          name: "favorite_tool_created_at_index",
          using: "BTREE",
          fields: ["createdAt"],
        },
        {
          name: "favorite_tool_position_index",
          using: "BTREE",
          fields: ["position"],
        },
      ],
    }
  );

  return FavoriteTool;
}; 