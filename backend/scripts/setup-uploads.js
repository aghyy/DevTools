const fs = require('fs');
const path = require('path');

// Create uploads directory structure
const createUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '../public/uploads');
  const avatarsDir = path.join(uploadsDir, 'avatars');

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
  }

  // Create avatars directory if it doesn't exist
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
    console.log('Created avatars directory');
  }
};

// Run the setup
createUploadsDirectory(); 