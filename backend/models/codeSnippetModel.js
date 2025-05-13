module.exports = (sequelize, DataTypes) => {
  const CodeSnippet = sequelize.define(
    "codeSnippet",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      code: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: "code_snippet_user_id_index",
          using: "BTREE",
          fields: ["userId"],
        },
        {
          name: "code_snippet_created_at_index",
          using: "BTREE",
          fields: ["createdAt"],
        },
        {
          name: "code_snippet_language_index",
          using: "BTREE",
          fields: ["language"],
        },
      ],
    }
  );

  return CodeSnippet;
}; 