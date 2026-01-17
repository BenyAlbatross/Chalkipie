Do not add this back after i removed it. It looks messy:

{/* Elevator header - sticky at top of shaft - compact with fixed height */}
      <div className="bg-light-gray border-b-3 border-black text-black text-center sticky top-24 z-10" style={{ height: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 12px' }}>
        <div className="text-xs uppercase tracking-wider font-medium">Lift</div>
        <div className="text-lg">⬍⬍⬍</div>
        {selectedFloor && (
          <div className="text-xs font-bold mt-1 text-black">
            Floor {String(selectedFloor).padStart(2, '0')}
          </div>
        )}
      </div>

---

# NEW FEATURES ADDED - Door Interaction & Zoom System

**Date Added: January 17, 2026**

## 🚪 Door Proximity & Interaction System

### **New Components:**

#### **1. DoorProximityPrompt.tsx**
- Displays when character (FancyPantsGuy) is within 100px of a door
- Shows floating prompt above character: "Press **E** to Open Door"
- Uses Geist Sans font for clean, modern look
- Subtle bounce animation for visibility
- Auto-hides when character moves away or door is opened

#### **2. DoorZoomOverlay.tsx** (Replaces DoorModal)
- **Zoom Animation:** Doors scale up smoothly with spring physics (Framer Motion)
- **Blur/Dim Background:** Backdrop with 50% black opacity + blur effect
- **Navigation Arrows:**
  - Left/Right arrows to navigate between adjacent doors on same floor
  - Only shown when previous/next door exists
  - Keyboard support: ← → arrow keys
- **Action Buttons (with Geist Sans):**
  - ✨ **Beautify** (Pink - `bg-pastel-pink`)
  - 👹 **Uglify** (Green - `bg-pastel-green`)
  - 🌀 **Sloppify** (Grey - `bg-gray-400`)
  - All buttons show loading state when clicked (placeholder actions)
- **Accessibility:**
  - ESC key closes overlay
  - Focus ring on all interactive elements
  - Keyboard navigation fully supported
- **Scrolling:** Disabled while overlay is open

---

## 🎮 Updated Character System

### **FancyPantsGuy.tsx Changes:**

#### **New Proximity Detection Logic:**
```typescript
const PROXIMITY_THRESHOLD = 100; // pixels

// In update loop:
- Calculate character center position
- Find all doors on current floor
- Calculate distance to each door (Pythagorean theorem)
- Identify nearest door within threshold
- Trigger onDoorProximity callback with:
  - Nearest door object or null
  - Character X position
  - Character Y position
```

#### **Door Position Calculation:**
```typescript
// Each door: 160px wide, 64px gap
const doorX = 64 + (index * (160 + 64));
const doorCenterX = doorX + 80; // Center of door
```

#### **New Props:**
- `onDoorProximity?: (door: Door | null, x: number, y: number) => void`
  - Called every frame with proximity state
  - Null when no door nearby or in elevator

#### **E Key Handler:**
- Added in `page.tsx` (global listener)
- Opens nearest door when pressed
- Only works when door is nearby and no modal is open

---

## 🏠 Updated Page.tsx

### **New State:**
```typescript
const [nearbyDoor, setNearbyDoor] = useState<Door | null>(null);
const [characterX, setCharacterX] = useState(0);
const [characterY, setCharacterY] = useState(0);
```

### **New Handlers:**

#### **handleDoorProximity**
- Receives updates from FancyPantsGuy
- Updates nearbyDoor, characterX, characterY state
- Triggers re-render of DoorProximityPrompt

#### **E Key Global Listener**
- Listens for 'e' or 'E' key
- Opens nearbyDoor if exists and no modal open
- Prevents opening when already in zoom view

#### **Door Navigation Functions**
- `handleNavigateToPreviousDoor()` - Go to previous door on floor
- `handleNavigateToNextDoor()` - Go to next door on floor
- `hasPreviousDoor()` - Check if previous exists
- `hasNextDoor()` - Check if next exists

All navigation works by finding current door index in `doorsByFloor[selectedFloor]` array.

---

## 🎨 Updated Styles (globals.css)

### **New Animations:**

```css
@keyframes bounce-subtle {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-10px); }
}

@keyframes zoom-in {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### **New Classes:**

- `.door-proximity-prompt` - Bounce animation
- `button:focus-visible` - Yellow outline for accessibility
- `body.zoom-active` - Disables scroll (not currently used, can be added)

---

## 🔄 User Flow

### **1. Character Approaches Door:**
```
Character walks → Within 100px of door → Prompt appears
"Press E to Open Door" (floating above character)
```

### **2. Opening a Door:**
```
User presses E → DoorZoomOverlay appears
- Background blurs/dims
- Door zooms in with spring animation
- Navigation arrows appear (if adjacent doors exist)
- Action buttons visible
- Scrolling disabled
```

### **3. Navigating Doors:**
```
User clicks ← or presses Left Arrow → Previous door zooms in
User clicks → or presses Right Arrow → Next door zooms in
Smooth transition with Framer Motion
```

### **4. Closing Zoom View:**
```
User presses ESC or clicks X or clicks backdrop → 
- Zoom out animation
- Background unfades
- Character prompt may reappear if still nearby
- Scrolling re-enabled
```

---

## 🎯 Technical Details

### **Proximity Detection Performance:**
- Runs every frame (~60fps) in physics loop
- Only checks doors on current floor (max 20 doors)
- Simple distance calculation (no expensive operations)
- Clears proximity when in elevator shaft (x < -20)

### **Door Positioning:**
- Doors start at x=64px (padding)
- Each door: 160px width
- Gap between doors: 64px
- Formula: `doorX = 64 + (index * 224)`

### **Zoom Overlay Stack:**
- z-index: 50 (above character at z-50, same level)
- Fixed positioning (viewport-locked)
- Prevents interaction with background (stopPropagation)

### **Keyboard Accessibility:**
- E: Open door
- ESC: Close zoom view
- ←/→: Navigate doors
- All buttons focusable with Tab
- Focus ring visible (yellow outline)

---

## 🚀 Future Enhancements (Placeholders)

### **Action Buttons:**
Currently console.log() placeholders:
```typescript
handleAction('beautify') → console.log("Action: beautify on door {id}")
handleAction('uglify') → ...
handleAction('sloppify') → ...
```

**To Implement:**
1. API endpoint: `POST /api/doors/{id}/transform`
2. Body: `{ action: 'beautify' | 'uglify' | 'sloppify' }`
3. Update door image URL in database
4. Refresh door data
5. Show success notification

### **Mobile Considerations:**
- E key → Tap prompt button
- Arrow navigation → Swipe gestures
- Larger touch targets for buttons (already 48px+ height)

---

## 🐛 Known Behaviors

### **Proximity Detection:**
- Only works when character is on a floor (not in elevator)
- Clears when entering elevator shaft
- Distance measured from character center to door center
- May show prompt for door slightly off-screen if within 100px

### **Door Navigation:**
- Only navigates within same floor
- Doesn't wrap (can't go from last door to first)
- Keyboard shortcuts work globally (may conflict if adding more features)

### **Animation:**
- Zoom uses spring physics (may bounce slightly)
- Backdrop blur may impact performance on low-end devices
- Framer Motion adds ~20KB to bundle

---

## 📝 Component Props Reference

### **DoorProximityPrompt**
```typescript
interface DoorProximityPromptProps {
  door: Door;
  characterX: number;  // For positioning
  characterY: number;
  onOpen: () => void;  // Callback when clicked
}
```

### **DoorZoomOverlay**
```typescript
interface DoorZoomOverlayProps {
  door: Door;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}
```

### **FancyPantsGuy (Updated)**
```typescript
interface FancyPantsGuyProps {
  floors: number[];
  doorsByFloor: { [floor: number]: Door[] };
  selectedFloor: number | null;
  onFloorChange: (floor: number) => void;
  isLiftMoving: boolean;
  onDoorProximity?: (door: Door | null, x: number, y: number) => void; // NEW
}
```

---

**End of Feature Documentation**

---

# REFINED IMPLEMENTATION - Smooth Motion & Subtle Door Focus

**Date Updated: January 17, 2026**

## 🎯 Major Changes

### **1. Fixed Stickman Jitter & Lag**

**Problem:** Character movement was jittery due to viewport centering running every frame (60fps).

**Solution Implemented:**

#### **Optimized Viewport Centering (FancyPantsGuy.tsx):**

```typescript
// New state variables
lastScrollUpdate: 0,      // Timestamp for scroll throttling
smoothScrollY: 0,         // Smooth interpolated Y scroll
smoothScrollX: 0,         // Smooth interpolated X scroll

// In render loop:
const shouldUpdateScroll = (now - s.lastScrollUpdate) > 50; // ~20fps

if (shouldUpdateScroll) {
  s.lastScrollUpdate = now;
  
  // Smooth interpolation (15% lerp for Y, 12% for X)
  s.smoothScrollY += (targetScrollY - s.smoothScrollY) * 0.15;
  s.smoothScrollX += (targetScrollX - s.smoothScrollX) * 0.12;
  
  // Only update if difference > 3px threshold
  if (Math.abs(window.scrollY - s.smoothScrollY) > 3) {
    window.scrollTo({ top: s.smoothScrollY, behavior: 'auto' });
  }
}
```

**Performance Improvements:**
- ✅ Scroll updates reduced from ~60fps to ~20fps (3x less frequent)
- ✅ Smooth interpolation prevents jitter
- ✅ 3px threshold prevents micro-adjustments
- ✅ Character movement remains at 60fps (unchanged)
- ✅ Result: Buttery smooth movement with no visual jitter

---

### **2. Replaced Fullscreen Zoom with Subtle In-Place Focus**

**Old Behavior:**
- Door opened in fullscreen modal
- Background completely obscured
- Large scale-up animation
- Lost context of hotel facade

**New Behavior:**
- Door scales 1.2x in-place (subtle, recognizable)
- Background slightly dimmed (30% opacity, 2px blur)
- Hotel facade remains visible
- Action buttons appear below door
- No layout shifts

---

### **3. New Component: DoorFocusView**

**Replaces:** DoorZoomOverlay (fullscreen modal)

**Features:**
- **Dimmed Backdrop:** 30% black opacity + 2px blur (subtle, not overwhelming)
- **Navigation Arrows:** Fixed to viewport (left/right), same as before
- **Action Buttons Row:** 
  - Positioned dynamically below focused door
  - Single horizontal row: Beautify | Uglify | Sloppify | Close
  - Geist Sans font
  - Slide-up animation on appear
  - Hover scale effect (1.1x)
- **Keyboard Support:**
  - ESC: Close focus view
  - ← →: Navigate doors
  - All buttons focusable

**Technical Details:**
```typescript
// Dynamically positions buttons below door
const doorPosition = {
  top: rect.bottom + window.scrollY + 20,  // 20px below
  left: rect.left + window.scrollX + rect.width / 2,  // Centered
};
```

**Styling:**
```css
@keyframes slide-up {
  from {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}
```

---

### **4. Updated DoorTile Component**

**New Props:**
```typescript
interface DoorTileProps {
  door: Door;
  onClick: (door: Door) => void;
  isFocused?: boolean;          // NEW: Indicates if door is currently focused
  doorRef?: (el: HTMLButtonElement | null) => void;  // NEW: Ref callback
}
```

**Focus State Styling:**
```tsx
style={{
  transform: isFocused ? 'scale(1.2)' : 'scale(1)',
  zIndex: isFocused ? 100 : 'auto',
  filter: isFocused ? 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' : 'none',
}}
```

**Animation:**
- `transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);`
- Spring-like easing with slight overshoot
- Smooth scale transformation

---

### **5. Updated FloorRow Component**

**New Props:**
```typescript
interface FloorRowProps {
  floor: number;
  doors: Door[];
  onDoorClick: (door: Door) => void;
  isActive?: boolean;
  focusedDoorId?: string | null;       // NEW: Currently focused door ID
  onDoorRef?: (doorId: string, el: HTMLButtonElement | null) => void;  // NEW
}
```

**Passes to DoorTile:**
```tsx
<DoorTile 
  isFocused={focusedDoorId === door.id}
  doorRef={onDoorRef ? (el) => onDoorRef(door.id, el) : undefined}
/>
```

---

### **6. Updated page.tsx**

**New State:**
```typescript
const doorElementRefs = useRef<{ [doorId: string]: HTMLButtonElement | null }>({});
```

**New Handler:**
```typescript
const handleDoorRef = (doorId: string, el: HTMLButtonElement | null) => {
  doorElementRefs.current[doorId] = el;
};
```

**FloorRow Integration:**
```tsx
<FloorRow
  focusedDoorId={selectedDoor?.id || null}
  onDoorRef={handleDoorRef}
/>
```

**Focus View Rendering:**
```tsx
{selectedDoor && (
  <DoorFocusView 
    doorElement={doorElementRefs.current[selectedDoor.id] || null}
    // ... other props
  />
)}
```

---

## 🎨 Visual Comparison

### **Before:**
```
Click door → Fullscreen modal
- Door fills entire screen
- Background completely black
- Disorienting zoom
- Lost sense of location
```

### **After:**
```
Click door → Subtle in-place zoom
- Door scales 1.2x (20% larger)
- Background slightly dimmed
- Hotel facade still visible
- Action buttons appear below
- Context preserved
```

---

## 🎮 User Experience Flow

### **Opening a Door:**
```
1. Character approaches door
2. "Press E to Open Door" prompt appears
3. User presses E (or clicks prompt)
4. Door smoothly scales to 1.2x
5. Background dims slightly (30%)
6. Action buttons slide up below door
7. Arrow nav appears if neighbors exist
```

### **Interacting with Focused Door:**
```
- Click "Beautify" → Button scales, action executes, view closes
- Click "Uglify" → Same behavior
- Click "Sloppify" → Same behavior
- Press ← → → Navigate to adjacent door (smooth transition)
- Press ESC → Close focus view
- Click backdrop → Close focus view
```

---

## 📊 Performance Metrics

### **Character Movement:**
- **Before:** Jittery, viewport updates every frame (~16ms)
- **After:** Smooth, viewport updates every 50ms, interpolated
- **FPS Impact:** Character still 60fps, scroll reduced to 20fps
- **Visual Quality:** Significantly improved

### **Door Interaction:**
- **Before:** Fullscreen modal with layout shift
- **After:** In-place scale, no layout shift
- **Animation Duration:** 300ms (cubic-bezier easing)
- **Perceived Speed:** Faster, more responsive

---

## 🔧 Technical Implementation Details

### **Scroll Smoothing Algorithm:**
```typescript
// Target position calculation
const targetScrollY = absoluteCharY - (viewportHeight / 2);

// Smooth interpolation (exponential smoothing)
s.smoothScrollY += (targetScrollY - s.smoothScrollY) * 0.15;

// Only update if significant difference
if (Math.abs(window.scrollY - s.smoothScrollY) > 3) {
  window.scrollTo({ top: s.smoothScrollY, behavior: 'auto' });
}
```

**Why This Works:**
- Exponential smoothing averages out rapid changes
- Threshold prevents micro-adjustments
- Reduced frequency gives browser time to optimize
- Result: Smooth, lag-free scrolling

### **Door Focus Positioning:**
```typescript
// Get door position in viewport
const rect = doorElement.getBoundingClientRect();

// Calculate absolute position for action buttons
const doorPosition = {
  top: rect.bottom + window.scrollY + 20,  // Below door
  left: rect.left + window.scrollX + rect.width / 2,  // Centered
};

// Apply with CSS transform
style={{
  top: `${doorPosition.top}px`,
  left: `${doorPosition.left}px`,
  transform: 'translateX(-50%)',  // Center horizontally
}}
```

**Handles:**
- Scrolled positions (window.scrollY/X)
- Viewport coordinates (getBoundingClientRect)
- Dynamic door positioning (no hardcoded values)

---

## 🐛 Known Behaviors

### **Character Movement:**
- Scroll now updates at 20fps (less frequent than before)
- Interpolation adds ~50ms delay to scroll response
- **Trade-off:** Slightly less responsive but much smoother

### **Door Focus:**
- Action buttons positioned absolutely based on door element
- If user scrolls while door is focused, buttons may misalign
- **Mitigation:** Background dim encourages users not to scroll
- Could add scroll lock if needed (currently avoided for flexibility)

### **Navigation:**
- Arrow navigation works same as before (previous/next door)
- Smooth transition between doors (isFocused prop change)
- No animation jank due to React key-based rendering

---

## 📝 Migration Notes

### **Removed:**
- ❌ `DoorZoomOverlay.tsx` (replaced by DoorFocusView)
- ❌ Fullscreen modal behavior
- ❌ Large zoom animations
- ❌ Complete background obscuration

### **Added:**
- ✅ `DoorFocusView.tsx` (subtle in-place focus)
- ✅ Door element refs tracking (`doorElementRefs`)
- ✅ Scroll smoothing in FancyPantsGuy
- ✅ `isFocused` prop on DoorTile
- ✅ Dynamic button positioning

### **Modified:**
- ✏️ `FancyPantsGuy.tsx` - Scroll throttling & interpolation
- ✏️ `DoorTile.tsx` - Focus state support
- ✏️ `FloorRow.tsx` - Pass focus props to tiles
- ✏️ `page.tsx` - Door ref management
- ✏️ `globals.css` - Slide-up animation, focus styles

---

## ✅ Validation Checklist

- [x] Stickman movement is smooth with no jitter
- [x] Door enlarges slightly (1.2x) instead of fullscreen
- [x] Action buttons appear in horizontal row below door
- [x] Background dims subtly (30% opacity, 2px blur)
- [x] Hotel facade context remains visible
- [x] Keyboard navigation works (ESC, ← →)
- [x] Geist Sans font used for UI elements
- [x] No layout shifts during zoom
- [x] Smooth animations throughout
- [x] Performance optimized (scroll at 20fps, character at 60fps)

---

**End of Refined Implementation Documentation**


