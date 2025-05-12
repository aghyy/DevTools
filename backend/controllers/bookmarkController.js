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

// Get all bookmarks for the current user
const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const category = req.query.category;
    const tag = req.query.tag;
    const search = req.query.search;

    let whereClause = { userId };

    // Add optional filters
    if (category) {
      whereClause.category = category;
    }

    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }

    if (search) {
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { url: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const bookmarks = await Bookmark.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(bookmarks);
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
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

    // Find the bookmark first
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

// Get all bookmark categories for the current user
const getUserCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    // Use distinct to get unique categories
    const categories = await Bookmark.findAll({
      attributes: [
        [db.Sequelize.fn("DISTINCT", db.Sequelize.col("category")), "category"],
      ],
      where: {
        userId,
        category: { [Op.not]: null },
      },
    });

    // Extract category values from the result
    const categoryList = categories
      .map((item) => item.category)
      .filter(Boolean);

    return res.status(200).json(categoryList);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all tags used in bookmarks by the current user
const getUserTags = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all bookmarks with tags for this user
    const bookmarks = await Bookmark.findAll({
      attributes: ["tags"],
      where: {
        userId,
        // Use array length check instead of comparing with empty array
        tags: { [Op.not]: null },
      },
    });

    // Extract all tags and count their frequency
    const tagCounts = {};

    bookmarks.forEach((bookmark) => {
      if (bookmark.tags && bookmark.tags.length > 0) {
        bookmark.tags.forEach((tag) => {
          if (tag) {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          }
        });
      }
    });

    // Format the results
    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({
        tag,
        count,
      }))
      .sort((a, b) => b.count - a.count);

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

module.exports = {
  createBookmark,
  getUserBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  getUserCategories,
  getUserTags,
  getPublicBookmarks,
};
