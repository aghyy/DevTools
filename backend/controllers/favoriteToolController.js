const db = require("../models");
const FavoriteTool = db.favoriteTools;
const { Op } = require("sequelize");

// Add a new favorite tool
const addFavoriteTool = async (req, res) => {
  try {
    const userId = req.user.id;
    const { toolUrl, toolName, icon } = req.body;

    if (!toolUrl || !toolName) {
      return res.status(400).json({ message: "Tool URL and name are required" });
    }

    // Check if the tool is already a favorite
    const existingTool = await FavoriteTool.findOne({
      where: {
        userId,
        toolUrl,
      },
    });

    if (existingTool) {
      return res.status(400).json({ message: "Tool is already in favorites" });
    }

    // Get the highest position
    const lastTool = await FavoriteTool.findOne({
      where: { userId },
      order: [["position", "DESC"]],
    });

    const position = lastTool ? lastTool.position + 1 : 0;

    // Create the favorite tool record
    const favoriteTool = await FavoriteTool.create({
      userId,
      toolUrl,
      toolName,
      icon: icon || null,
      position,
    });

    return res.status(201).json({
      message: "Tool added to favorites successfully",
      favoriteTool,
    });
  } catch (error) {
    console.error("Error adding favorite tool:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get favorite tools for current user
const getUserFavoriteTools = async (req, res) => {
  try {
    const userId = req.user.id;

    const favoriteTools = await FavoriteTool.findAll({
      where: { userId },
      order: [["position", "ASC"]],
    });

    return res.status(200).json(favoriteTools);
  } catch (error) {
    console.error("Error fetching favorite tools:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Remove a favorite tool
const removeFavoriteTool = async (req, res) => {
  try {
    const toolId = req.params.id;
    const userId = req.user.id;

    // Find the tool first
    const favoriteTool = await FavoriteTool.findOne({
      where: {
        id: toolId,
        userId, // Only the owner can remove
      },
    });

    if (!favoriteTool) {
      return res
        .status(404)
        .json({ message: "Favorite tool not found or you don't have permission" });
    }

    // Delete the tool
    await favoriteTool.destroy();

    // Reorder remaining tools
    const remainingTools = await FavoriteTool.findAll({
      where: { userId },
      order: [["position", "ASC"]],
    });

    // Update positions
    for (let i = 0; i < remainingTools.length; i++) {
      await remainingTools[i].update({ position: i });
    }

    return res.status(200).json({
      message: "Tool removed from favorites successfully",
    });
  } catch (error) {
    console.error("Error removing favorite tool:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update favorite positions
const updateFavoritePositions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { positions } = req.body;

    if (!Array.isArray(positions)) {
      return res.status(400).json({ message: "Positions must be an array" });
    }

    // Update positions for each tool
    for (const { id, position } of positions) {
      await FavoriteTool.update(
        { position },
        {
          where: {
            id,
            userId, // Ensure user owns the tool
          },
        }
      );
    }

    return res.status(200).json({
      message: "Favorite positions updated successfully",
    });
  } catch (error) {
    console.error("Error updating favorite positions:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addFavoriteTool,
  getUserFavoriteTools,
  removeFavoriteTool,
  updateFavoritePositions,
}; 