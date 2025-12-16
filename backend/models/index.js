const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config();

// Set up Sequelize connection using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'devtools',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false, // Enable query logging for debugging
  }
);

// Test the database connection
sequelize.authenticate()
  .then(() => console.log("Database connected to devtools"))
  .catch((err) => console.error("Error connecting to the database:", err));

// Define the `db` object to store models and Sequelize instances
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.users = require("./userModel")(sequelize, DataTypes);
db.activities = require("./activityModel")(sequelize, DataTypes);
db.bookmarks = require("./bookmarkModel")(sequelize, DataTypes);
db.shortenedUrls = require("./shortenedUrl")(sequelize, DataTypes);
db.favoriteTools = require("./favoriteToolModel")(sequelize, DataTypes);
db.codeSnippets = require("./codeSnippetModel")(sequelize, DataTypes);
db.performanceMetrics = require("./performanceMetricsModel")(sequelize, DataTypes);
db.widgets = require("./widgetModel")(sequelize, DataTypes);

// Define relationships
db.users.hasMany(db.activities, { foreignKey: "userId" });
db.activities.belongsTo(db.users, { foreignKey: "userId" });

db.users.hasMany(db.bookmarks, { foreignKey: "userId" });
db.bookmarks.belongsTo(db.users, { foreignKey: "userId" });

db.users.hasMany(db.favoriteTools, { foreignKey: "userId" });
db.favoriteTools.belongsTo(db.users, { foreignKey: "userId" });

db.users.hasMany(db.codeSnippets, { foreignKey: "userId" });

// Performance metrics relationship
db.users.hasMany(db.performanceMetrics, { foreignKey: "userId" });
db.performanceMetrics.belongsTo(db.users, { foreignKey: "userId" });

// Widget relationship
db.users.hasMany(db.widgets, { foreignKey: "userId" });
db.widgets.belongsTo(db.users, { foreignKey: "userId" });

module.exports = db;