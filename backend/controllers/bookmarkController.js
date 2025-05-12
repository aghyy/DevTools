const db = require("../models");
const Bookmark = db.bookmarks;
const User = db.users;
const { Op } = require("sequelize");
const axios = require("axios");

// Create a new bookmark
const createBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, url, description, category, tags, isPublic } = req.body;

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    // Try to fetch meta information for the link (favicon, screenshot)
    let favicon = null;
    let screenshotUrl = null;

    try {
      // Using microlink API for link previews (same as frontend)
      const metaResponse = await axios.get(
        `https://api.microlink.io/?url=${encodeURIComponent(
          url
        )}&screenshot=true&meta=true`
      );

      if (metaResponse.data && metaResponse.data.data) {
        if (metaResponse.data.data.logo) {
          favicon = metaResponse.data.data.logo.url;
        }
        if (metaResponse.data.data.screenshot) {
          screenshotUrl = metaResponse.data.data.screenshot.url;
        }
      }
    } catch (error) {
      console.error("Error fetching link metadata:", error);
      // Continue without metadata if the fetch fails
    }

    // Create the bookmark record
    const bookmark = await Bookmark.create({
      userId,
      title,
      url,
      description: description || null,
      category: category || null,
      tags: tags || [],
      favicon,
      screenshotUrl,
      isPublic: isPublic || false,
    });

    return res.status(201).json({
      message: "Bookmark created successfully",
      bookmark,
    });
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get bookmarks for current user
const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, tag, search } = req.query;

    const whereClause = { userId };

    // Apply category filter
    if (category) {
      whereClause.category = category;
    }

    // Apply tag filter (tags are stored as an array)
    // This uses PostgreSQL array contains operator
    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }

    // Apply search filter
    if (search) {
      const searchTerm = `%${search}%`;
      whereClause[Op.or] = [
        { title: { [Op.iLike]: searchTerm } },
        { description: { [Op.iLike]: searchTerm } },
        { url: { [Op.iLike]: searchTerm } },
        { category: { [Op.iLike]: searchTerm } },
      ];
      // Note: Searching within tags is more complex and might
      // require a different approach depending on your database
    }

    const bookmarks = await Bookmark.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single bookmark by ID
const getBookmarkById = async (req, res) => {
  try {
    const bookmarkId = req.params.id;
    const userId = req.user.id;

    const bookmark = await Bookmark.findOne({
      where: {
        id: bookmarkId,
        [Op.or]: [{ userId }, { isPublic: true }],
      },
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    return res.status(200).json(bookmark);
  } catch (error) {
    console.error("Error fetching bookmark:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update a bookmark
const updateBookmark = async (req, res) => {
  try {
    const bookmarkId = req.params.id;
    const userId = req.user.id;
    const { title, url, description, category, tags, isPublic } = req.body;

    // Find the bookmark first
    const bookmark = await Bookmark.findOne({
      where: {
        id: bookmarkId,
        userId, // Only the owner can update
      },
    });

    if (!bookmark) {
      return res
        .status(404)
        .json({ message: "Bookmark not found or you don't have permission" });
    }

    // Update the bookmark
    const updatedFields = {};

    if (title) updatedFields.title = title;
    if (url) updatedFields.url = url;
    if (description !== undefined) updatedFields.description = description;
    if (category !== undefined) updatedFields.category = category;
    if (tags) updatedFields.tags = tags;
    if (isPublic !== undefined) updatedFields.isPublic = isPublic;

    // If URL changed, try to update the meta info
    if (url && url !== bookmark.url) {
      try {
        const metaResponse = await axios.get(
          `https://api.microlink.io/?url=${encodeURIComponent(
            url
          )}&screenshot=true&meta=true`
        );

        if (metaResponse.data && metaResponse.data.data) {
          if (metaResponse.data.data.logo) {
            updatedFields.favicon = metaResponse.data.data.logo.url;
          }
          if (metaResponse.data.data.screenshot) {
            updatedFields.screenshotUrl = metaResponse.data.data.screenshot.url;
          }
        }
      } catch (error) {
        console.error("Error updating link metadata:", error);
        // Continue without updating metadata
      }
    }

    await bookmark.update(updatedFields);

    return res.status(200).json({
      message: "Bookmark updated successfully",
      bookmark: await Bookmark.findByPk(bookmarkId),
    });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a bookmark
const deleteBookmark = async (req, res) => {
  try {
    const bookmarkId = req.params.id;
    const userId = req.user.id;

    // Find the bookmark first to ensure it exists and belongs to the user
    const bookmark = await Bookmark.findOne({
      where: {
        id: bookmarkId,
        userId, // Only the owner can delete
      },
    });

    if (!bookmark) {
      return res
        .status(404)
        .json({ message: "Bookmark not found or you don't have permission" });
    }

    // Delete the bookmark
    await bookmark.destroy();

    return res.status(200).json({
      message: "Bookmark deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all unique categories for the current user
const getUserCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all bookmarks for the user
    const bookmarks = await Bookmark.findAll({
      where: { userId },
      attributes: ["category"],
    });

    // Extract and filter out null categories
    const categories = bookmarks
      .map((bookmark) => bookmark.category)
      .filter((category) => category !== null);

    // Remove duplicates
    const uniqueCategories = [...new Set(categories)];

    return res.status(200).json(uniqueCategories);
  } catch (error) {
    console.error("Error fetching user categories:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all unique tags with counts for the current user
const getUserTags = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all bookmarks for the user
    const bookmarks = await Bookmark.findAll({
      where: { userId },
      attributes: ["tags"],
    });

    // Count occurrences of each tag
    const tagCounts = {};
    bookmarks.forEach((bookmark) => {
      if (bookmark.tags && bookmark.tags.length) {
        bookmark.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array of objects with tag and count
    const tags = Object.entries(tagCounts).map(([tag, count]) => ({
      tag,
      count,
    }));

    // Sort by count in descending order
    tags.sort((a, b) => b.count - a.count);

    return res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching user tags:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get bookmarks for public view
const getPublicBookmarks = async (req, res) => {
  try {
    const username = req.params.username;

    // Find the user first
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get public bookmarks for this user
    const bookmarks = await Bookmark.findAll({
      where: {
        userId: user.id,
        isPublic: true,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bookmarks,
    });
  } catch (error) {
    console.error("Error fetching public bookmarks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all public bookmarks from all users
const getAllPublicBookmarks = async (req, res) => {
  try {
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'username', 'firstName', 'lastName']
    });

    // For each user, get their public bookmarks
    const result = await Promise.all(
      users.map(async (user) => {
        const bookmarks = await Bookmark.findAll({
          where: {
            userId: user.id,
            isPublic: true,
          },
          order: [["createdAt", "DESC"]],
        });

        return {
          user: `${user.firstName} ${user.lastName}`,
          username: user.username,
          bookmarks,
        };
      })
    );

    // Filter out users with no public bookmarks
    const usersWithPublicBookmarks = result.filter(item => item.bookmarks.length > 0);
    
    return res.status(200).json(usersWithPublicBookmarks);
  } catch (error) {
    console.error("Error fetching all public bookmarks:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBookmark,
  getUserBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  getUserCategories,
  getUserTags,
  getPublicBookmarks,
  getAllPublicBookmarks,
};
