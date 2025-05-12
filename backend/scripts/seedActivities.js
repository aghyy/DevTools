/**
 * Seed script to generate test activity data
 * Run with: node scripts/seedActivities.js [userId]
 */

const db = require('../models');
const Activity = db.activities;

// Define sample activities
const sampleActivities = [
  { name: 'Hash Generator', path: '/tools/hash', type: 'tool', icon: 'Hash' },
  { name: 'Base64 Converter', path: '/tools/base64', type: 'tool', icon: 'Binary' },
  { name: 'Regex Tester', path: '/tools/regex', type: 'tool', icon: 'Regex' },
  { name: 'Documentation', path: '/docs', type: 'doc', icon: 'Book' },
  { name: 'Libraries', path: '/libraries', type: 'library', icon: 'Library' },
  { name: 'Knowledge Base', path: '/knowledge-base', type: 'knowledge', icon: 'GraduationCap' }
];

// Function to create random activities
async function seedActivities() {
  try {
    // Get user ID from command line or use default
    const userId = parseInt(process.argv[2]) || 1;
    
    console.log(`Seeding activities for user ID: ${userId}`);
    
    // Generate random number of activities for each type (between 1-10)
    const activities = [];
    
    sampleActivities.forEach(activity => {
      // Random number of occurrences between 1-10
      const occurrences = Math.floor(Math.random() * 10) + 1;
      
      for (let i = 0; i < occurrences; i++) {
        // Create activity with random timestamp within last 7 days
        const daysAgo = Math.floor(Math.random() * 7);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(timestamp.getHours() - hoursAgo);
        
        activities.push({
          userId,
          name: activity.name,
          path: activity.path,
          type: activity.type,
          icon: activity.icon,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });
    
    // Bulk insert activities
    await Activity.bulkCreate(activities);
    
    console.log(`Successfully created ${activities.length} activity records`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding activities:', error);
    process.exit(1);
  }
}

// Run the seed function
seedActivities(); 