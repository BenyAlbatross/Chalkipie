# Unified /extract Rendering Flow Implementation

## Overview

This implementation uses a **unified `/extract` endpoint** that returns all door representations in a single call. The frontend **only toggles** between these pre-fetched views without making additional backend requests.

---

## Backend Contract

### Endpoint
```
POST https://chalk-pyserver.onrender.com/extract
```

### Request Payload
```typescript
FormData {
  image: File,        // The door image file
  roomId: string      // Room number/door ID (e.g., "01-114")
}
```

### Response Payload
```typescript
{
  "chalkImage": "https://chalk-pyserver.onrender.com/media/chalk/01-114.png",
  "prettifyImage": "https://chalk-pyserver.onrender.com/media/prettify/01-114.png",
  "uglifyImage": "https://chalk-pyserver.onrender.com/media/uglify/01-114.png",
  "sloppifyText": "This door looks chaotic and unkempt"
}
```

**Important:**
- `chalkImage` is the **default displayed image**
- All other outputs are **alternative views**, not replacements
- `/extract` is called **exactly once per door**

---

## Upload & Extract Flow

### 1. User Uploads Door Image

```typescript
// In ImageUploader component
const { extractDoor } = useDoorState();

await extractDoor(roomId, imageFile);
```

**What happens:**
1. POST request sent to `/extract` endpoint
2. Loading indicator shown on door tile
3. Backend processes image and returns all variations
4. Frontend stores all fields in `DoorStateContext`
5. Default view set to `'chalk'`

### 2. State Structure (Per Door)

```typescript
interface DoorState {
  roomId: string;
  chalkImage: string;           // From /extract (default)
  prettifyImage?: string;       // From /extract
  uglifyImage?: string;         // From /extract
  sloppifyText?: string;        // From /extract
  currentView: 'chalk' | 'prettify' | 'uglify' | 'sloppify';
  loading: boolean;
  error?: string;
  extracted: boolean;           // Prevents duplicate calls
}
```

---

## Door Display Behavior

### Opening a Door

When user clicks a door tile:

1. **Door centers** on screen
2. **Scales to 1.2×** (enlarged)
3. **Background blurred** (`backdrop-blur-md`) and dimmed (`bg-black/50`)
4. **Initially displays:** `chalkImage` from `/extract`

### View Toggle (No Backend Calls!)

Action buttons **only toggle frontend state**:

- **Beautify** → switches to `prettifyImage`
- **Uglify** → switches to `uglifyImage`
- **Sloppify** → switches to `sloppifyText` (displayed as overlay)

```typescript
// handleViewChange does NOT call backend
const handleViewChange = (view: DoorView) => {
  if (view === currentView || !doorState) return;
  setCurrentView(roomNumber, view);  // Pure state toggle
};
```

---

## Animations

### Wipe Transition Effect

Preferred animation for view switching:

```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={currentImageUrl}
    initial={{ x: '100%' }}      // Start off-screen right
    animate={{ x: 0 }}            // Wipe in from right
    exit={{ x: '-100%' }}         // Wipe out to left
    transition={{ 
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }}
  >
    <Image src={currentImageUrl} ... />
  </motion.div>
</AnimatePresence>
```

### Door Zoom Animation

```typescript
animate={{ scale: 1.2, opacity: 1 }}
transition={{ type: 'spring', stiffness: 180, damping: 22 }}
```

### Sloppify Text Overlay

```typescript
{showSloppifyText && (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="absolute inset-0 bg-black/80"
  >
    <div className="bg-white border-4 border-black rounded-lg p-8">
      <p>{doorState?.sloppifyText}</p>
    </div>
  </motion.div>
)}
```

---

## Component Architecture

### DoorStateContext
**Location:** `contexts/DoorStateContext.tsx`

**Responsibilities:**
- Manages cached door states globally
- Calls `/extract` endpoint once per door
- Prevents redundant backend calls
- Provides state getters/setters

**Key Methods:**
```typescript
extractDoor(roomId, imageFile)  // POST to /extract
setCurrentView(roomId, view)     // Toggle view (no backend)
initializeDoor(roomId, chalkUrl) // Initialize state
getDoorState(roomId)             // Get door state
```

### DoorZoomOverlay
**Location:** `components/DoorZoomOverlay.tsx`

**Features:**
- Displays door at 1.2× scale, centered
- Blurred background
- Wipe transition between views
- Sloppify text overlay
- Action buttons below door
- Arrow key navigation

### DoorActionButtons
**Location:** `components/DoorActionButtons.tsx`

**Features:**
- 4 buttons: Original (🖼️), Beautify (✨), Uglify (👹), Sloppify (🌀)
- Active state indicator (black dot)
- Hover/focus animations
- Loading spinner during extract

### ImageUploader
**Location:** `components/ImageUploader.tsx`

**Updated to:**
- Call `extractDoor()` from context
- Single upload triggers `/extract`
- Shows loading state during processing

---

## Validation Checklist

✅ **Upload calls /extract exactly once per door**
- Checked via `extracted` flag in state
- Subsequent calls are skipped

✅ **/extract response fully populates door state**
- All fields stored: `chalkImage`, `prettifyImage`, `uglifyImage`, `sloppifyText`

✅ **Default view is the chalk image**
- `currentView` initializes to `'chalk'`
- `chalkImage` displayed on door open

✅ **Buttons only toggle frontend state**
- No `fetch()` calls in `handleViewChange()`
- Pure state manipulation via `setCurrentView()`

✅ **Wipe animation plays when switching views**
- `x: '100%'` → `x: 0` → `x: '-100%'`
- Spring animation with natural physics

✅ **No redundant backend calls when toggling**
- State cached in `DoorStateContext`
- `extracted` flag prevents re-extraction

✅ **Door remains centered and stable while switching**
- Container size fixed (`aspect-[3/4]`)
- Wipe animation within container bounds
- No layout shift

---

## Key Differences from Previous Implementation

| Aspect | Old (Multi-Endpoint) | New (Unified /extract) |
|--------|---------------------|------------------------|
| **Upload** | 3 separate POST calls | 1 POST to `/extract` |
| **Render** | GET per view switch | No calls (cached) |
| **State** | `doorchalk` + versions | `chalkImage` + versions |
| **Default View** | `'doorchalk'` | `'chalk'` |
| **View Toggle** | Fetch if not cached | Pure state toggle |
| **Animation** | Crossfade | Wipe transition |

---

## Usage Example

### Upload Flow
```typescript
// User uploads image
<ImageUploader 
  doorId="01-114"
  onUploadSuccess={(url) => console.log('Extracted:', url)}
/>

// Internally calls:
await extractDoor("01-114", imageFile);

// Backend returns:
{
  chalkImage: "https://.../chalk/01-114.png",
  prettifyImage: "https://.../prettify/01-114.png",
  uglifyImage: "https://.../uglify/01-114.png",
  sloppifyText: "Chaotic door with random drawings"
}
```

### View Toggle Flow
```typescript
// User clicks door → DoorZoomOverlay opens
// Shows chalkImage by default

// User clicks "Beautify" button
handleViewChange('prettify')
  → setCurrentView("01-114", 'prettify')
  → Image wipes from chalkImage to prettifyImage

// User clicks "Sloppify" button  
handleViewChange('sloppify')
  → setCurrentView("01-114", 'sloppify')
  → Text overlay appears with sloppifyText
```

---

## Error Handling

### Upload Errors
```typescript
try {
  await extractDoor(roomId, imageFile);
} catch (error) {
  // Error stored in doorState.error
  // Displayed as banner in DoorZoomOverlay
}
```

### Missing Data Fallback
```typescript
// If prettifyImage is missing, fall back to chalkImage
const getCurrentImageUrl = () => {
  switch (currentView) {
    case 'prettify':
      return doorState.prettifyImage || doorState.chalkImage;
    case 'uglify':
      return doorState.uglifyImage || doorState.chalkImage;
    default:
      return doorState.chalkImage;
  }
};
```

---

## Performance Optimizations

1. **Single Backend Call:** `/extract` called once per door
2. **Instant View Switching:** No loading states for view changes
3. **Cached State:** Results persist during session
4. **Skip Re-extraction:** `extracted` flag prevents duplicates

---

## Files Modified

### Created
- ✅ `contexts/DoorStateContext.tsx` - State management
- ✅ `components/DoorActionButtons.tsx` - Action buttons

### Modified
- ✅ `components/DoorZoomOverlay.tsx` - Wipe animation, view toggle
- ✅ `components/ImageUploader.tsx` - Calls `/extract`
- ✅ `app/layout.tsx` - Wrapped with `DoorStateProvider`
- ✅ `types/door.ts` - Added `ExtractResponse` interface

---

## Testing Instructions

1. **Upload Test:**
   ```bash
   # Upload an image via ImageUploader
   # Check network tab: Should see 1 POST to /extract
   # Verify response contains all 4 fields
   ```

2. **View Toggle Test:**
   ```bash
   # Click door → Should show chalkImage
   # Click "Beautify" → Should wipe to prettifyImage
   # Click "Uglify" → Should wipe to uglifyImage
   # Click "Sloppify" → Should show text overlay
   # Network tab: Should show NO new requests
   ```

3. **Caching Test:**
   ```bash
   # Close door and reopen
   # Should still show cached views
   # No /extract call should be made
   ```

4. **Animation Test:**
   ```bash
   # Verify wipe effect slides from right to left
   # Verify door stays centered during transition
   # Verify no layout shift
   ```

---

## Conclusion

The unified `/extract` flow simplifies the architecture by:
- **Reducing backend calls** from multiple to one
- **Enabling instant view switching** via cached state
- **Providing smooth wipe transitions** for better UX
- **Maintaining door stability** during view changes

All validation criteria are met! ✅
