module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isEmail: true,
      },
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Password reset fields
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Notification preferences
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    marketingEmails: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    // Privacy settings
    profileVisibility: {
      type: DataTypes.ENUM('public', 'private', 'connections'),
      allowNull: false,
      defaultValue: 'public'
    },
    showEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    showActivity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, { timestamps: true });
  return User;
};