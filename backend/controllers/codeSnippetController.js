const db = require("../models");
const CodeSnippet = db.codeSnippets;
const User = db.users;
const { Op } = require("sequelize");

// Create a new code snippet
const createCodeSnippet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, code, language, description, tags, isPublic } = req.body;

    if (!title || !code || !language) {
      return res.status(400).json({ message: "Title, code, and language are required" });
    }

    // Create the code snippet record
    const codeSnippet = await CodeSnippet.create({
      userId,
      title,
      code,
      language,
      description: description || null,
      tags: tags || [],
      isPublic: isPublic || false,
    });

    return res.status(201).json({
      message: "Code snippet created successfully",
      codeSnippet,
    });
  } catch (error) {
    console.error("Error creating code snippet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get code snippets for current user
const getUserCodeSnippets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, tag, search } = req.query;

    const whereClause = { userId };

    // Apply language filter
    if (language) {
      whereClause.language = language;
    }

    // Apply tag filter
    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }

    // Apply search filter
    if (search) {
      const searchTerm = `%${search}%`;
      whereClause[Op.or] = [
        { title: { [Op.iLike]: searchTerm } },
        { description: { [Op.iLike]: searchTerm } },
        { code: { [Op.iLike]: searchTerm } },
      ];
    }

    const codeSnippets = await CodeSnippet.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(codeSnippets);
  } catch (error) {
    console.error("Error fetching code snippets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get a specific code snippet by ID
const getCodeSnippetById = async (req, res) => {
  try {
    const userId = req.user.id;
    const snippetId = req.params.id;

    const codeSnippet = await CodeSnippet.findOne({
      where: { id: snippetId, userId },
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    return res.status(200).json(codeSnippet);
  } catch (error) {
    console.error("Error fetching code snippet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update a code snippet
const updateCodeSnippet = async (req, res) => {
  try {
    const userId = req.user.id;
    const snippetId = req.params.id;
    const { title, code, language, description, tags, isPublic } = req.body;

    // Check that required fields are present
    if (!title || !code || !language) {
      return res.status(400).json({ message: "Title, code, and language are required" });
    }

    // Find the snippet to update
    const codeSnippet = await CodeSnippet.findOne({
      where: { id: snippetId, userId },
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Update the snippet
    await codeSnippet.update({
      title,
      code,
      language,
      description: description || null,
      tags: tags || [],
      isPublic: isPublic || false,
    });

    return res.status(200).json({
      message: "Code snippet updated successfully",
      codeSnippet,
    });
  } catch (error) {
    console.error("Error updating code snippet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a code snippet
const deleteCodeSnippet = async (req, res) => {
  try {
    const userId = req.user.id;
    const snippetId = req.params.id;

    // Find the snippet to delete
    const codeSnippet = await CodeSnippet.findOne({
      where: { id: snippetId, userId },
    });

    if (!codeSnippet) {
      return res.status(404).json({ message: "Code snippet not found" });
    }

    // Delete the snippet
    await codeSnippet.destroy();

    return res.status(200).json({ message: "Code snippet deleted successfully" });
  } catch (error) {
    console.error("Error deleting code snippet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all languages used by the current user
const getUserLanguages = async (req, res) => {
  try {
    const userId = req.user.id;

    const languages = await CodeSnippet.findAll({
      attributes: [
        "language",
        [db.Sequelize.fn("COUNT", db.Sequelize.col("language")), "count"],
      ],
      where: { userId },
      group: ["language"],
      order: [[db.Sequelize.literal("count"), "DESC"]],
    });

    return res.status(200).json(languages);
  } catch (error) {
    console.error("Error fetching languages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all tags used by the current user
const getUserTags = async (req, res) => {
  try {
    const userId = req.user.id;

    const snippets = await CodeSnippet.findAll({
      attributes: ["tags"],
      where: { userId },
      raw: true,
    });

    // Extract and count tags
    const tagCounts = {};
    snippets.forEach((snippet) => {
      if (snippet.tags && snippet.tags.length) {
        snippet.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array format
    const tags = Object.entries(tagCounts).map(([tag, count]) => ({
      tag,
      count,
    }));

    // Sort by count descending
    tags.sort((a, b) => b.count - a.count);

    return res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get public snippets by username
const getPublicCodeSnippets = async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user by username
    const user = await User.findOne({
      where: { username },
      attributes: ["id", "username", "firstName", "lastName"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the user's public snippets
    const codeSnippets = await CodeSnippet.findAll({
      where: { userId: user.id, isPublic: true },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      codeSnippets,
    });
  } catch (error) {
    console.error("Error fetching public code snippets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all public code snippets
const getAllPublicCodeSnippets = async (req, res) => {
  try {
    // Get all users with public snippets
    const users = await User.findAll({
      attributes: ["id", "username", "firstName", "lastName"],
      include: [
        {
          model: CodeSnippet,
          where: { isPublic: true },
          required: true,
        },
      ],
    });

    // Format response with user data and their snippets
    const result = await Promise.all(
      users.map(async (user) => {
        const snippets = await CodeSnippet.findAll({
          where: { userId: user.id, isPublic: true },
          order: [["createdAt", "DESC"]],
        });

        return {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          codeSnippets: snippets,
        };
      })
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all public code snippets:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCodeSnippet,
  getUserCodeSnippets,
  getCodeSnippetById,
  updateCodeSnippet,
  deleteCodeSnippet,
  getUserLanguages,
  getUserTags,
  getPublicCodeSnippets,
  getAllPublicCodeSnippets,
}; 