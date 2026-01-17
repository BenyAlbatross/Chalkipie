# Door System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── Upload Flow
                              │
                    ┌─────────▼──────────┐
                    │  ImageUploader     │
                    │  Component         │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  uploadHandler.ts  │
                    │  (utility)         │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    POST /api/upload/  POST /api/upload/  POST /api/upload/
       prettify           uglify           sloppify
              │               │               │
              └───────────────┴───────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Gemini API        │
                    │  (placeholder)     │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Supabase Storage  │
                    │  + Database        │
                    └────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                          VIEWING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

    User Clicks Door
         │
         ▼
    ┌────────────────────┐
    │   DoorTile         │
    │   Component        │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ DoorZoomOverlay    │
    │ - Centered (1.15×) │
    │ - Blurred BG       │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ DoorStateContext   │
    │ initializeDoor()   │
    └────────┬───────────┘
             │
    Default: doorchalk (original)
             │
             │  User clicks action button
             ▼
    ┌────────────────────┐
    │ DoorActionButtons  │
    │ - Original         │
    │ - Beautify         │
    │ - Uglify           │
    │ - Sloppify         │
    └────────┬───────────┘
             │
             ▼
    ┌────────────────────┐
    │ handleViewChange() │
    │ Check cache first  │
    └────────┬───────────┘
             │
             ├─── If Cached ───────► Display Immediately
             │                       (Crossfade 300ms)
             │
             └─── If Not Cached ───┐
                                   │
                                   ▼
                        GET /api/render/{action}
                              ?room={roomId}
                                   │
                                   ▼
                        ┌──────────────────┐
                        │ Supabase DB      │
                        │ door_versions    │
                        └──────┬───────────┘
                               │
                               ▼
                        Return Image URL
                          or Text
                               │
                               ▼
                        ┌──────────────────┐
                        │ Cache in State   │
                        │ + Display        │
                        └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                       STATE MANAGEMENT                           │
└─────────────────────────────────────────────────────────────────┘

    DoorStateContext (Global)
         │
         ├─── Map<roomId, DoorState>
         │
         └─── DoorState {
                  roomId: string
                  doorchalk: string (original)
                  prettifyImage?: string (cached)
                  uglifyImage?: string (cached)
                  sloppifyText?: string (cached)
                  currentView: 'doorchalk' | 'prettify' | 'uglify' | 'sloppify'
                  loading: boolean
                  error?: string
              }

    Methods:
    - initializeDoor(roomId, doorchalkUrl)
    - fetchDoorVersion(roomId, action)
    - setCurrentView(roomId, view)
    - getDoorState(roomId)


┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE SCHEMA                            │
└─────────────────────────────────────────────────────────────────┘

    door_versions
    ┌──────────────┬──────────┬─────────────┐
    │ room_id      │ TEXT     │ PRIMARY KEY │
    │ original_url │ TEXT     │ NOT NULL    │
    │ prettify_url │ TEXT     │             │
    │ uglify_url   │ TEXT     │             │
    │ sloppify_text│ TEXT     │             │
    │ created_at   │ TIMESTAMP│             │
    │ updated_at   │ TIMESTAMP│             │
    └──────────────┴──────────┴─────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                       ANIMATION TIMELINE                         │
└─────────────────────────────────────────────────────────────────┘

    Door Click
         │
         ▼
    [0ms] - Overlay fade in (opacity: 0 → 1)
         │
    [0-400ms] - Door zoom animation
         │      (scale: 0.8 → 1.15)
         │      Spring: stiffness=180, damping=22
         │
         ▼
    [400ms] - Door fully zoomed and centered
         │    Background blurred
         │
    User clicks action button
         │
         ▼
    [0ms] - Loading spinner appears (if fetching)
         │
    [0-300ms] - Crossfade to new view
         │      (opacity: 1 → 0 → 1)
         │
         ▼
    [300ms] - New view displayed
         │    Cached for future clicks
         │
         ▼
    User clicks close
         │
         ▼
    [0-300ms] - Overlay fade out
         │      Door scale down (1.15 → 0.8)
         │
         ▼
    [300ms] - Back to door grid


┌─────────────────────────────────────────────────────────────────┐
│                       API ENDPOINTS                              │
└─────────────────────────────────────────────────────────────────┘

    POST /api/upload/prettify
    POST /api/upload/uglify
    POST /api/upload/sloppify
         │
         ├─ Body: FormData
         │  - image: File
         │  - roomId?: string
         │  - metadata?: string
         │
         ├─ Process:
         │  1. Upload to Supabase Storage
         │  2. Process with Gemini API
         │  3. Store in door_versions table
         │
         └─ Response:
            {
              success: boolean,
              action: string,
              originalUrl: string,
              processedUrl: string,
              roomId: string
            }

    GET /api/render/prettify?room={roomId}
    GET /api/render/uglify?room={roomId}
    GET /api/render/sloppify?room={roomId}
         │
         ├─ Query: room (required)
         │
         ├─ Process:
         │  1. Query door_versions table
         │  2. Return cached result
         │
         └─ Response:
            {
              success: boolean,
              room: string,
              action: string,
              imageUrl?: string,  // for prettify/uglify
              text?: string,      // for sloppify
              originalUrl: string
            }
```
