# Chalkipie - UI Implementation

A hand-drawn, chalk-inspired door gallery built with Next.js 15 (App Router) and React.

## 📁 Project Structure

```
doorapp/
├── app/
│   ├── globals.css          # Custom chalk/sketch aesthetic styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page with lift shaft + door grid
├── components/
│   ├── DoorGrid.tsx         # Responsive grid of door tiles
│   ├── DoorModal.tsx        # Full-screen door detail modal
│   ├── DoorTile.tsx         # Individual door tile with hover effects
│   └── LiftShaft.tsx        # Fixed elevator shaft (left side)
├── lib/
│   └── mockData.ts          # Mock door data (12 sample doors)
└── types/
    └── door.ts              # Door TypeScript interface
```

## 🎨 Design Features

### Layout
- **Fixed Lift Shaft**: Vertical elevator shaft on the left edge (decorative, non-functional)
- **Door Grid**: Responsive grid layout (2-6 columns based on viewport)
- **Full-height viewport**: Uses `min-h-screen` for full page coverage

### Aesthetic
- Hand-drawn / chalk-inspired design
- Rough, imperfect borders and elements
- Soft shadows and subtle animations
- Neutral color palette (slate grays, paper white)
- Custom CSS classes for chalk effects:
  - `.chalk-text` - rough text rendering
  - `.chalk-title` - emphasized headings
  - `.chalk-element` - buttons/shapes with rough edges
  - `.sketch-border` - hand-drawn border effect
  - `.chalk-glow` - hover glow effect

### Interactions
- **Hover State**: Doors glow and scale up slightly
- **Click Action**: Opens a full-screen modal
- **Modal Features**:
  - Larger door image
  - Metadata display (door #, semester, owner, date)
  - Three action buttons (View, Listen, Download) with placeholder handlers
  - Close button and ESC key support
  - Click outside to close

## 📊 Data Model

```typescript
interface Door {
  id: string;              // Unique identifier
  doorNumber: number;      // Display number (e.g., 101, 102)
  imageUrl: string;        // Door image URL
  semester: string;        // Academic semester
  createdAt: string;       // ISO date string
  nameOfOwner: string;     // Owner name (default: "Anonymous")
}
```

## 🔮 Future Supabase Integration Points

The code is structured for easy Supabase integration:

### 1. Data Fetching
**Current**: `mockDoors` array in `lib/mockData.ts`
```typescript
// FUTURE: Replace with Supabase query
const { data: doors } = await supabase
  .from('doors')
  .select('*')
  .order('created_at', { ascending: false });
```

### 2. Single Door Query
**Current**: `getDoorById()` in `lib/mockData.ts`
```typescript
// FUTURE: Supabase single query
const { data: door } = await supabase
  .from('doors')
  .select('*')
  .eq('id', doorId)
  .single();
```

### 3. Real-time Updates
```typescript
// FUTURE: Subscribe to door changes
supabase
  .channel('doors-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'doors' },
    (payload) => {
      // Update local state
    }
  )
  .subscribe();
```

### 4. Modal Actions
- **View**: Navigate to `/door/[id]` page
- **Listen**: Fetch and play audio from Supabase Storage
- **Download**: Download image with proper permissions

### 5. Database Schema
Suggested Supabase table structure:
```sql
CREATE TABLE doors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  door_number INTEGER UNIQUE NOT NULL,
  image_url TEXT NOT NULL,
  semester TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name_of_owner TEXT DEFAULT 'Anonymous',
  user_id UUID REFERENCES auth.users(id), -- for authentication
  audio_url TEXT, -- for "Listen" feature
  description TEXT -- for expanded door page
);
```

## 🚀 Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📝 Key Implementation Notes

1. **No Backend**: This is a UI-only implementation with mock data
2. **No Authentication**: Ready for future auth integration
3. **No Navigation**: Door clicks open modals (can be changed to navigation)
4. **Responsive**: Mobile-first design with breakpoints
5. **Accessible**: Keyboard support (ESC to close modal), ARIA labels
6. **TypeScript**: Fully typed components and data
7. **Comments**: Extensive comments marking future integration points

## 🎯 MVP Constraints Met

✅ UI-only (no backend calls)  
✅ Hand-drawn/chalk aesthetic  
✅ Fixed lift shaft on left  
✅ Responsive door grid  
✅ Door hover and click states  
✅ Modal with action buttons  
✅ Mock data source  
✅ TypeScript types  
✅ Clean, commented code  
✅ Future Supabase integration points documented  

## 🔧 Technologies Used

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **CSS Custom Properties**
- **next/image** for optimized images

## 📦 Component Props

### DoorGrid
```typescript
{
  doors: Door[];
  onDoorClick: (door: Door) => void;
}
```

### DoorTile
```typescript
{
  door: Door;
  onClick: (door: Door) => void;
}
```

### DoorModal
```typescript
{
  door: Door | null;
  isOpen: boolean;
  onClose: () => void;
}
```

## 🎨 Customization

To adjust the aesthetic:
- Modify CSS variables in `globals.css` (`:root`)
- Update chalk effect classes
- Adjust color palette in Tailwind config
- Change border styles in `.sketch-border`

---

**Ready for Supabase integration!** 🚀
