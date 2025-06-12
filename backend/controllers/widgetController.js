const db = require("../models");
const Widget = db.widgets;
const { Op } = require("sequelize");

// Get user widgets
const getUserWidgets = async (req, res) => {
  try {
    const userId = req.user.id;

    const widgets = await Widget.findAll({
      where: { userId },
      order: [['position', 'ASC']],
    });

    return res.status(200).json(widgets);
  } catch (error) {
    console.error("Error fetching user widgets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update user widgets (bulk update for drag and drop)
const updateUserWidgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { widgets } = req.body;

    if (!Array.isArray(widgets)) {
      return res.status(400).json({ error: "Widgets must be an array" });
    }

    // Validate widget types
    const validTypes = ['memory', 'device', 'battery', 'location', 'network', 'screen'];
    const invalidWidgets = widgets.filter(w => !validTypes.includes(w.widgetType));
    
    if (invalidWidgets.length > 0) {
      return res.status(400).json({ 
        error: "Invalid widget types", 
        invalidTypes: invalidWidgets.map(w => w.widgetType) 
      });
    }

    // Delete existing widgets for this user
    await Widget.destroy({ where: { userId } });

    // Create new widgets
    const widgetsToCreate = widgets.map((widget, index) => ({
      userId,
      widgetType: widget.widgetType,
      position: index,
      isActive: widget.isActive !== undefined ? widget.isActive : true,
      settings: widget.settings || {}
    }));

    const createdWidgets = await Widget.bulkCreate(widgetsToCreate);

    return res.status(200).json({
      message: "Widgets updated successfully",
      widgets: createdWidgets
    });
  } catch (error) {
    console.error("Error updating user widgets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Add a single widget
const addWidget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { widgetType, settings } = req.body;

    if (!widgetType) {
      return res.status(400).json({ error: "Widget type is required" });
    }

    // Check if user already has 5 widgets
    const existingCount = await Widget.count({ where: { userId } });
    if (existingCount >= 5) {
      return res.status(400).json({ error: "Maximum of 5 widgets allowed" });
    }

    // Get the next position
    const maxPosition = await Widget.max('position', { where: { userId } }) || -1;

    const widget = await Widget.create({
      userId,
      widgetType,
      position: maxPosition + 1,
      settings: settings || {}
    });

    return res.status(201).json({
      message: "Widget added successfully",
      widget
    });
  } catch (error) {
    console.error("Error adding widget:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Remove a widget
const removeWidget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { widgetId } = req.params;

    console.log('Remove widget request:', { userId, widgetId });

    const widget = await Widget.findOne({
      where: { id: widgetId, userId }
    });

    console.log('Found widget:', widget);

    if (!widget) {
      console.log('Widget not found');
      return res.status(404).json({ error: "Widget not found" });
    }

    await widget.destroy();
    console.log('Widget destroyed successfully');

    // Reorder remaining widgets
    const remainingWidgets = await Widget.findAll({
      where: { userId },
      order: [['position', 'ASC']]
    });

    console.log('Remaining widgets:', remainingWidgets.length);

    // Update positions
    for (let i = 0; i < remainingWidgets.length; i++) {
      await remainingWidgets[i].update({ position: i });
    }

    console.log('Widget removal completed successfully');
    return res.status(200).json({ message: "Widget removed successfully" });
  } catch (error) {
    console.error("Error removing widget:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get available widget types
const getAvailableWidgets = async (req, res) => {
  try {
    const availableWidgets = [
      {
        type: 'memory',
        name: 'Memory Usage',
        description: 'Displays JavaScript heap memory usage',
        icon: 'HardDrive'
      },
      {
        type: 'device',
        name: 'Device Info',
        description: 'Shows device type and platform',
        icon: 'Smartphone'
      },
      {
        type: 'battery',
        name: 'Battery Status',
        description: 'Shows battery level and charging status',
        icon: 'Battery'
      },
      {
        type: 'location',
        name: 'Location',
        description: 'Shows current location coordinates',
        icon: 'MapPin'
      },
      {
        type: 'network',
        name: 'Network Info',
        description: 'Shows connection type and speed',
        icon: 'Wifi'
      },
      {
        type: 'screen',
        name: 'Screen Info',
        description: 'Shows screen resolution and color depth',
        icon: 'Monitor'
      }
    ];

    return res.status(200).json(availableWidgets);
  } catch (error) {
    console.error("Error fetching available widgets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserWidgets,
  updateUserWidgets,
  addWidget,
  removeWidget,
  getAvailableWidgets
}; 