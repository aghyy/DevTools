# Performance Tracking in DevTools

This document outlines the performance tracking system implemented across the DevTools application, focusing on both server-side and client-side tools.

## Performance Tracking Architecture

The DevTools application employs a comprehensive performance tracking system that monitors:

1. **Backend API Tools** - HTTP request timings through API middleware 
2. **Client-Side Tools** - JavaScript operations that run directly in the browser

## Client-Side Performance Tracking

Client-side tools use the `useClientToolPerformance` hook from `@/utils/performanceTracker` to track operation durations:

```tsx
const { trackOperation } = useClientToolPerformance('tool-name');
const operationTracker = trackOperation('operation-name');
// Perform work
operationTracker.complete();
```

### Debounced Performance Tracking

To prevent creating excessive tracking entries for operations that can trigger rapidly (like slider movements), we implemented debounce functionality:

1. Created a utility (`/utils/debounce.ts`) that limits how frequently a function can execute
2. Applied debouncing to tools with high-frequency user inputs:
   - Token Generator - slider/options changes
   - UUID Generator - quantity changes
   - ULID Generator - quantity changes

Example implementation:

```tsx
// Create debounced function
const debouncedFunction = debounce((value) => {
  // Start tracking
  const tracker = trackOperation(`operation-${value}`);
  // Perform work
  // ...
  // Complete tracking
  tracker.complete();
}, 500);

// Use debounced function when inputs change
const handleChange = (value) => {
  setIsPending(true); // Visual feedback
  debouncedFunction(value);
};
```

## Visual Feedback During Debounced Operations

When operations are pending due to debouncing:

1. Form controls and outputs have reduced opacity
2. Refresh buttons show spinning animations
3. Other visual indicators help users understand processing status

## Implementation Best Practices

When implementing performance tracking:

1. Always use refs to store tracker objects
2. Set trackers to null after completion or errors
3. Use descriptive operation names with relevant parameters
4. Disable initial load tracking via `trackInitialLoad={false}` to prevent noise
5. Implement debounce for high-frequency inputs
6. Add visual feedback for pending operations

## Key Files

- `/utils/performanceTracker.ts` - Core tracking hooks
- `/utils/debounce.ts` - Debounce utility 
- `/components/client-tool-tracker.tsx` - Wrapper component for client tools 