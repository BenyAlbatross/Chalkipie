/**
 * COMPONENT ARCHITECTURE
 * ======================
 * 
 * Page Hierarchy:
 * 
 * app/page.tsx (Main Entry Point)
 * │
 * ├── <LiftShaft />                  [Fixed, left edge, decorative]
 * │   └── Floor markers (1-6 + G)
 * │
 * ├── <main> (Door Grid Container)   [Offset by lift shaft width]
 * │   └── <DoorGrid />               [Responsive grid layout]
 * │       ├── Header (Title + subtitle)
 * │       └── Grid of <DoorTile />   [2-6 columns, responsive]
 * │           ├── Image (with chalk overlay)
 * │           ├── Metadata overlay (door #, semester, owner)
 * │           ├── Hover effects (glow, scale)
 * │           └── Click handler (opens modal)
 * │
 * └── <DoorModal />                  [Full-screen overlay, conditional]
 *     ├── Backdrop (click to close)
 *     ├── Modal container
 *     │   ├── Close button
 *     │   ├── Image section (left/top)
 *     │   └── Content section (right/bottom)
 *     │       ├── Door metadata (expanded)
 *     │       ├── View button (placeholder)
 *     │       ├── Listen button (placeholder)
 *     │       └── Download button (placeholder)
 *     └── ESC key handler
 * 
 * 
 * DATA FLOW:
 * ==========
 * 
 * lib/mockData.ts → app/page.tsx (state) → DoorGrid → DoorTile
 *                                     ↓
 *                                 DoorModal
 * 
 * State Management (in page.tsx):
 * - selectedDoor: Door | null
 * - isModalOpen: boolean
 * 
 * Event Flow:
 * DoorTile onClick → handleDoorClick → setSelectedDoor + setIsModalOpen
 * DoorModal onClose → handleCloseModal → setIsModalOpen(false)
 * 
 * 
 * STYLING ARCHITECTURE:
 * ====================
 * 
 * globals.css:
 * ├── CSS Variables (color theme)
 * ├── Base styles
 * ├── Chalk aesthetic classes:
 * │   ├── .chalk-text
 * │   ├── .chalk-title
 * │   ├── .chalk-element
 * │   ├── .chalk-button
 * │   ├── .chalk-glow
 * │   └── .sketch-border
 * ├── Component-specific:
 * │   ├── .lift-shaft
 * │   ├── .door-tile
 * │   └── .chalk-line
 * ├── Animations:
 * │   ├── @keyframes subtle-pulse
 * │   ├── @keyframes fade-in
 * │   └── @keyframes slide-up
 * └── Custom scrollbar
 * 
 * Tailwind CSS:
 * - Layout (grid, flexbox)
 * - Spacing (padding, margin)
 * - Colors (slate palette)
 * - Responsive breakpoints
 * - Utility classes
 * 
 * 
 * FUTURE INTEGRATION POINTS:
 * ==========================
 * 
 * 1. page.tsx:
 *    - Add useEffect to fetch doors from Supabase
 *    - Add real-time subscription
 *    - Add loading/error states
 * 
 * 2. DoorGrid.tsx:
 *    - Add filtering (by semester, owner)
 *    - Add search functionality
 *    - Add pagination/infinite scroll
 * 
 * 3. DoorModal.tsx:
 *    - View: router.push(`/door/${door.id}`)
 *    - Listen: Fetch audio URL from Supabase Storage
 *    - Download: Download with proper permissions
 * 
 * 4. New files to add:
 *    - lib/supabase.ts (Supabase client)
 *    - app/door/[id]/page.tsx (Individual door page)
 *    - hooks/useDoors.ts (Custom hook for door data)
 *    - middleware.ts (Authentication)
 * 
 * 
 * RESPONSIVE BREAKPOINTS:
 * ======================
 * 
 * Mobile (< 768px):
 * - 2 column grid
 * - Lift shaft 60px wide
 * - Smaller text sizes
 * - Stacked modal layout
 * 
 * Tablet (768px - 1024px):
 * - 3 column grid
 * - Lift shaft 80px wide
 * 
 * Desktop (1024px - 1280px):
 * - 4 column grid
 * 
 * Large Desktop (1280px - 1536px):
 * - 5 column grid
 * 
 * XL Desktop (> 1536px):
 * - 6 column grid
 */
