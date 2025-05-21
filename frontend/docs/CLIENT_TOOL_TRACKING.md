# Client-Side Tool Performance Tracking

This document explains how to implement performance tracking for client-side tools in the DevTools application.

## Overview

The DevTools application now has the ability to track and measure performance for both backend API tools and client-side tools. This provides comprehensive monitoring of all tool response times, allowing us to identify performance bottlenecks and measure improvements.

## Types of Tools

1. **Backend Tools**: Tools that make requests to the `/api/tools/` endpoints
2. **Client-Side Tools**: Tools that perform operations directly in the browser (e.g., Base64, Steganography, Vigenère Cipher)

## Implementation Options

There are two ways to implement client-side tool tracking:

### 1. Using the ClientToolTracker Component (Recommended)

The simplest approach is to wrap your client-side tool component with the `ClientToolTracker` component.

```tsx
import { ClientToolTracker } from '@/components/client-tool-tracker';

export default function YourTool() {
  return (
    <ClientToolTracker name="Your Tool Name" icon="IconName">
      <YourToolImplementation />
    </ClientToolTracker>
  );
}

function YourToolImplementation() {
  // Your tool implementation here
  // ...
}
```

This approach automatically tracks:
- Page visit activity
- Initial load time

### 2. Using the useClientToolPerformance Hook

For more granular tracking of specific operations in your tool, use the `useClientToolPerformance` hook:

```tsx
import { useClientToolPerformance } from '@/utils/performanceTracker';

function YourTool() {
  const { trackOperation } = useClientToolPerformance('your-tool-name');
  
  const handleOperation = () => {
    // Start tracking
    const tracker = trackOperation('operation-name');
    
    // Perform your operation
    const result = performSomeOperation();
    
    // Complete tracking
    tracker.complete();
    
    return result;
  };
  
  // Rest of your component...
}
```

## Example Implementation

See the `base64` tool for a complete example of client-side tool tracking:
- `frontend/app/(pages)/tools/base64/page.tsx`

## How It Works

The performance tracking system:

1. Measures the time between the start and completion of an operation
2. Sends the measurement to the `/api/performance` endpoint
3. Stores the data in the database
4. Displays the aggregated data in the dashboard charts

The dashboard will show the average response times for all tools, including client-side ones, providing a complete picture of tool performance.

## Best Practices

1. Use descriptive operation names for tracking
2. Track all significant operations in client-side tools
3. Keep the operation tracking code close to the actual operation
4. Ensure the `complete()` method is always called to prevent skewed metrics

## Troubleshooting

If you're not seeing data for your client-side tool in the dashboard:

1. Check browser console for any errors
2. Verify that the tool name is consistent between tracking calls
3. Ensure the `complete()` method is being called after operations
4. Check that the ClientToolTracker component is properly implemented 