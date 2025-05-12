module.exports = (sequelize, DataTypes) => {
  const ShortenedUrl = sequelize.define("shortenedUrl", {
    originalUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        // Set expiration date to 30 days from now
        const now = new Date();
        return new Date(now.setDate(now.getDate() + 30));
      },
    },
  }, { timestamps: true });

  return ShortenedUrl;
}; 