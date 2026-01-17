# Door Upload & Render System Implementation

## Overview

This implementation provides a complete door upload and rendering system with separate endpoints for processing door images through three different transformations: Beautify (Prettify), Uglify, and Sloppify.

## Architecture

### 1. API Endpoints

#### Upload Endpoints
- **POST** `/api/upload/prettify` - Upload and beautify a door image
- **POST** `/api/upload/uglify` - Upload and uglify a door image
- **POST** `/api/upload/sloppify` - Upload and create text description

**Payload:**
```typescript
{
  image: File,           // The door image file
  roomId?: string,       // Optional room identifier
  metadata?: string      // Optional JSON metadata
}
```

**Response:**
```typescript
{
  success: boolean,
  action: string,
  originalUrl: string,
  processedUrl: string,
  roomId: string
}
```

#### Render Endpoints
- **GET** `/api/render/prettify?room=<room>` - Fetch beautified version
- **GET** `/api/render/uglify?room=<room>` - Fetch uglified version
- **GET** `/api/render/sloppify?room=<room>` - Fetch sloppified text

**Response:**
```typescript
{
  success: boolean,
  room: string,
  action: string,
  imageUrl?: string,      // For prettify/uglify
  text?: string,          // For sloppify
  originalUrl: string
}
```

### 2. State Management

**DoorStateContext** manages cached door results and current view per door.

```typescript
interface DoorState {
  roomId: string;
  doorchalk: string;          // Original image URL
  prettifyImage?: string;     // Cached prettified image
  uglifyImage?: string;       // Cached uglified image
  sloppifyText?: string;      // Cached text description
  currentView: DoorView;      // Current display mode
  loading: boolean;           // Loading state
  error?: string;             // Error message
}
```

**Key Functions:**
- `initializeDoor(roomId, doorchalkUrl)` - Initialize door state
- `fetchDoorVersion(roomId, action)` - Fetch and cache a version
- `setCurrentView(roomId, view)` - Switch active view
- `getDoorState(roomId)` - Get door state

### 3. Components

#### DoorActionButtons
Renders the four action buttons with active state indication:
- Original (🖼️) - Shows original doorchalk
- Beautify (✨) - Shows prettified version
- Uglify (👹) - Shows uglified version
- Sloppify (🌀) - Shows sloppified text

**Features:**
- Active button highlighting
- Loading indicator
- Smooth scale animations
- Keyboard accessible

#### DoorZoomOverlay (Updated)
Displays zoomed door with:
- **1.15× scale** (centered on screen)
- **Blurred background** with 50% opacity
- **Smooth crossfade** transitions between views
- **Action buttons** below the door
- **Error handling** with subtle notifications
- **Arrow key navigation** between doors

#### ImageUploader (Updated)
Uploads images to all three endpoints simultaneously:
- Calls `uploadDoorImageAll()` utility
- Uploads to prettify, uglify, and sloppify endpoints
- Returns success with all processed URLs

### 4. Upload Handler Utility

**lib/uploadHandler.ts** provides:

```typescript
// Upload to single endpoint
uploadDoorImage(
  imageFile: File,
  action: 'prettify' | 'uglify' | 'sloppify',
  options?: { roomId?, metadata? }
): Promise<UploadResult>

// Upload to all endpoints
uploadDoorImageAll(
  imageFile: File,
  options?: { roomId?, metadata? }
): Promise<UploadResult[]>
```

## User Flow

### Upload Flow
1. User selects an image in ImageUploader
2. On submit, image is uploaded to all three endpoints via `uploadDoorImageAll()`
3. Backend stores:
   - Original image in Supabase storage
   - Processes image with Gemini API (placeholder)
   - Stores results in `door_versions` table
4. User receives success confirmation with original URL

### Viewing Flow
1. User clicks a door tile
2. DoorZoomOverlay opens with door centered and scaled (1.15×)
3. Background is blurred/dimmed
4. Door initializes with 'doorchalk' (original) view
5. User clicks an action button:
   - If version not cached: Fetches from `/api/render/{action}?room={roomId}`
   - If cached: Switches immediately
   - Smooth crossfade transition to new view
6. For sloppify: Text overlay appears instead of image

### Button Behavior
- **Default:** Original doorchalk image
- **Switching:** Smooth crossfade animation (300ms)
- **Caching:** Previously fetched versions load instantly
- **Loading:** Spinner appears during fetch
- **Error:** Subtle notification, previous view remains visible

## Animation Details

### Door Zoom Animation
```typescript
initial: { scale: 0.8, opacity: 0 }
animate: { scale: 1.15, opacity: 1 }
exit: { scale: 0.8, opacity: 0 }
transition: { type: 'spring', stiffness: 180, damping: 22 }
```

### View Crossfade
```typescript
initial: { opacity: 0 }
animate: { opacity: 1 }
exit: { opacity: 0 }
transition: { duration: 0.3 }
```

### Button Active Indicator
```typescript
initial: { scale: 0 }
animate: { scale: 1 }
exit: { scale: 0 }
transition: { type: 'spring', stiffness: 300, damping: 20 }
```

## Database Schema

### door_versions Table (Suggested)
```sql
CREATE TABLE door_versions (
  room_id TEXT PRIMARY KEY,
  original_url TEXT NOT NULL,
  prettify_url TEXT,
  uglify_url TEXT,
  sloppify_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Styling

- **Font:** Geist Sans for UI elements
- **Colors:** 
  - Original: White background
  - Beautify: Pastel pink (`bg-pastel-pink`)
  - Uglify: Pastel green (`bg-pastel-green`)
  - Sloppify: Gray (`bg-gray-400`)
- **Borders:** 3px black borders throughout
- **Shadows:** md and lg shadows for depth

## Accessibility

- All buttons are keyboard focusable
- Focus ring (pastel-yellow) on focus
- Arrow keys navigate between doors (← →)
- Escape key closes overlay
- ARIA labels on navigation buttons
- Loading states announced via visual spinner

## Future Enhancements

1. **Gemini API Integration:** Replace placeholder with actual image processing
2. **Optimistic Updates:** Show processing animation while waiting
3. **Lazy Loading:** Only fetch versions when buttons are clicked
4. **Animation Preferences:** Respect `prefers-reduced-motion`
5. **Undo/Redo:** Allow users to revert to previous views
6. **Share Feature:** Share specific door views
7. **Download:** Export processed images

## Testing Checklist

- ✅ Upload triggers POST to all three `/upload/*` endpoints
- ✅ Opening door triggers GET to `/render/*` endpoints
- ✅ Buttons toggle between images/text correctly
- ✅ Door remains centered and scaled at 1.15×
- ✅ Background is blurred during zoom
- ✅ Cached versions prevent redundant network calls
- ✅ Smooth animations for zoom, fade, and button switching
- ✅ Loading states display during fetch
- ✅ Errors are handled gracefully
- ✅ Keyboard navigation works (arrows, escape)
- ✅ Focus management is correct

## Files Modified/Created

### Created
- `app/api/upload/[action]/route.ts` - Upload endpoints
- `app/api/render/[action]/route.ts` - Render endpoints
- `contexts/DoorStateContext.tsx` - State management
- `components/DoorActionButtons.tsx` - Action buttons component
- `lib/uploadHandler.ts` - Upload utility functions

### Modified
- `components/DoorZoomOverlay.tsx` - Integrated new system
- `components/ImageUploader.tsx` - Uses uploadHandler
- `app/layout.tsx` - Added DoorStateProvider
- `types/door.ts` - Added DoorVersion interface

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Notes

- Gemini API integration is currently a placeholder (returns mock data)
- All three upload endpoints are called simultaneously for each upload
- Caching prevents redundant API calls per door per session
- State is client-side only (resets on page reload)
