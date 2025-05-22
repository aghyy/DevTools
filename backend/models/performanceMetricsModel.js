module.exports = (sequelize, DataTypes) => {
  const PerformanceMetric = sequelize.define("performanceMetric", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow anonymous metrics
      references: {
        model: 'users',
        key: 'id'
      }
    },
    toolName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    responseTime: {
      type: DataTypes.FLOAT, // Store time in milliseconds
      allowNull: false
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, { 
    timestamps: true,
    indexes: [
      {
        name: 'performance_user_id_index',
        using: 'BTREE',
        fields: ['userId']
      },
      {
        name: 'performance_tool_index',
        using: 'BTREE',
        fields: ['toolName']
      },
      {
        name: 'performance_created_at_index',
        using: 'BTREE',
        fields: ['createdAt']
      }
    ]
  });
  
  return PerformanceMetric;
}; 