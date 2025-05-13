const express = require('express');
const sequelize = require('sequelize');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const db = require('./models');
const userRoutes = require('./routes/userRoutes');
const toolRoutes = require('./routes/toolRoutes');
const activityRoutes = require('./routes/activityRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const favoriteToolRoutes = require('./routes/favoriteToolRoutes');
const codeSnippetRoutes = require('./routes/codeSnippetRoutes');

const PORT = process.env.PORT || 5039;
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been re sync");
});

// URL Shortener redirect handler - handle both /s/:shortCode and /:shortCode paths
app.get('/s/:shortCode', handleRedirect);
app.get('/:shortCode', handleRedirect);

// Redirect handler function
async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;
    
    // Skip API routes and static paths
    if (shortCode.startsWith('api') || shortCode === 'favicon.ico') {
      return res.status(404).send('Not found');
    }
    
    // Check our database for custom codes
    const shortenedUrl = await db.shortenedUrls.findOne({ where: { shortCode } });
    
    if (!shortenedUrl) {
      return res.status(404).send('URL not found. This short code does not exist in our system.');
    }
    
    // Check if URL has expired
    if (shortenedUrl.expiresAt && new Date() > new Date(shortenedUrl.expiresAt)) {
      await shortenedUrl.destroy(); // Remove expired URL
      return res.status(404).send('URL has expired');
    }
    
    // Redirect to the original URL
    return res.redirect(shortenedUrl.originalUrl);
  } catch (error) {
    console.error('Error redirecting to original URL:', error);
    return res.status(500).send('Internal Server Error');
  }
}

app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/favorite-tools', favoriteToolRoutes);
app.use('/api/code-snippets', codeSnippetRoutes);

app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));