module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define("activity", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM("tool", "bookmark", "knowledge", "library"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Activity'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, { 
    timestamps: true,
    indexes: [
      {
        name: 'activity_user_id_index',
        using: 'BTREE',
        fields: ['userId']
      },
      {
        name: 'activity_created_at_index',
        using: 'BTREE',
        fields: ['createdAt']
      }
    ]
  });
  
  return Activity;
}; 