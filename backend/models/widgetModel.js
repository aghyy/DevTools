module.exports = (sequelize, DataTypes) => {
  const Widget = sequelize.define("widget", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    widgetType: {
      type: DataTypes.ENUM(
        'browser', 
        'memory', 
        'device', 
        'battery', 
        'location', 
        'network', 
        'screen',
        'connection'
      ),
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, { 
    timestamps: true,
    indexes: [
      {
        name: 'widget_user_id_index',
        using: 'BTREE',
        fields: ['userId']
      },
      {
        name: 'widget_position_index',
        using: 'BTREE',
        fields: ['position']
      },
      {
        name: 'widget_type_index',
        using: 'BTREE',
        fields: ['widgetType']
      }
    ]
  });
  
  return Widget;
}; 