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

    // Create the favorite tool record
    const favoriteTool = await FavoriteTool.create({
      userId,
      toolUrl,
      toolName,
      icon: icon || null,
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
      order: [["createdAt", "DESC"]],
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

    return res.status(200).json({
      message: "Tool removed from favorites successfully",
    });
  } catch (error) {
    console.error("Error removing favorite tool:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addFavoriteTool,
  getUserFavoriteTools,
  removeFavoriteTool,
}; 