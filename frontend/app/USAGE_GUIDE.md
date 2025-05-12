# Activity Tracking System - Usage Guide

This document explains how the activity tracking system works to record user interactions with different tools and resources in the application.

## Overview

The activity tracking system automatically records when users visit different pages and tools. This data is displayed on the dashboard, showing recent activities and most used tools.

## How Activity Tracking Works

The system now uses a centralized approach to track user activity:

1. **Automatic Tracking**: All page visits are automatically tracked through the layout component.
2. **Deduplication**: The system prevents duplicate entries by:
   - Using localStorage to prevent recording the same page visit multiple times in a short period
   - Backend deduplication to ensure the dashboard only shows unique recent activities

## Adding New Routes to Activity Tracking

To ensure proper activity tracking for new pages or tools:

1. Update the route map in `frontend/app/(pages)/layout.tsx`:

```tsx
// Add your new route to the routeToActivityMap object
const routeToActivityMap = {
  // Your new route
  "/your/new/path": { 
    name: "Your Tool Name", 
    type: "tool", // One of: 'tool', 'doc', 'knowledge', 'library'
    icon: "IconName" 
  },
  // Existing routes...
};
```

### Available Types

- `tool` - For developer tools
- `doc` - For documentation pages
- `knowledge` - For knowledge base articles
- `library` - For code libraries and resources

### Available Icon Names

The following icon names are supported:

- `Hammer` - For general tools
- `Book` - For documentation
- `Library` - For libraries
- `GraduationCap` - For knowledge resources
- `Code` - For code-related tools
- `Binary` - For binary converters
- `Hash` - For hash tools
- `Link` - For URL tools
- `Regex` - For regular expression tools
- `Activity` - Default fallback icon

## Dashboard Integration

The user's activity is automatically displayed on the dashboard:

1. **Recent Activity** section shows the last visited pages (deduplicated)
2. **Most Used** section displays the tools used most frequently (last 30 days)

## Backend Architecture

The activity data is stored in the PostgreSQL database with the following schema:

- `userId` - The ID of the user who performed the activity
- `type` - The type of resource (tool, doc, etc.)
- `name` - The name of the resource
- `path` - The URL path to the resource
- `icon` - The icon name used to display the resource
- `metadata` - Optional JSON data for additional information
- `createdAt` - Timestamp when the activity was recorded

## API Endpoints

- `POST /api/activities` - Record a new activity
- `GET /api/activities` - Get recent activities (deduplicated)
- `GET /api/activities/stats` - Get activity statistics
- `GET /api/activities/most-used` - Get most frequently used items

## Troubleshooting

If activities are not being recorded:

1. Check that the user is authenticated
2. Ensure the path is correctly mapped in the activity tracking system
3. Verify that the backend server is running
4. Check browser console for any errors related to activity tracking
5. Clear localStorage if testing frequently: `localStorage.clear()` 