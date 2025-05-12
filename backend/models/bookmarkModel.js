module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define(
    "bookmark",
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
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: [],
      },
      favicon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      screenshotUrl: {
        type: DataTypes.STRING,
        allowNull: true,
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
          name: "bookmark_user_id_index",
          using: "BTREE",
          fields: ["userId"],
        },
        {
          name: "bookmark_created_at_index",
          using: "BTREE",
          fields: ["createdAt"],
        },
        {
          name: "bookmark_category_index",
          using: "BTREE",
          fields: ["category"],
        },
      ],
    }
  );

  return Bookmark;
};
