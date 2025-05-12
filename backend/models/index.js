const { Sequelize, DataTypes } = require("sequelize");

// Set up Sequelize connection
const sequelize = new Sequelize("postgres://postgres:postgres@localhost:5432/devtools", {
  dialect: "postgres",
  logging: false, // Enable query logging for debugging
});

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

// Define relationships
db.users.hasMany(db.activities, { foreignKey: "userId" });
db.activities.belongsTo(db.users, { foreignKey: "userId" });

db.users.hasMany(db.bookmarks, { foreignKey: "userId" });
db.bookmarks.belongsTo(db.users, { foreignKey: "userId" });

// Synchronize models with the database
db.sequelize.sync({ alter: true }) // Use `alter: true` to avoid data loss during development
  .then(() => console.log("Tables synchronized with the database"))
  .catch((err) => console.error("Error synchronizing tables:", err));

module.exports = db;