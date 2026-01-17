import { Door } from "@/types/door";

/**
 * Mock door data for UI development
 * 
 * FUTURE: Replace this with actual Supabase queries
 * Example: const { data: doors } = await supabase.from('doors').select('*')
 */

export const mockDoors: Door[] = [
  {
    id: "door-1",
    doorNumber: 101,
    imageUrl: "https://images.unsplash.com/photo-1508666709879-08d4fe5a76e0?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 1",
    createdAt: "2024-08-15T10:30:00Z",
    nameOfOwner: "Alex Chen",
  },
  {
    id: "door-2",
    doorNumber: 102,
    imageUrl: "https://images.unsplash.com/photo-1506792006437-256b665541e2?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 1",
    createdAt: "2024-08-16T14:20:00Z",
    nameOfOwner: "Anonymous",
  },
  {
    id: "door-3",
    doorNumber: 103,
    imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 1",
    createdAt: "2024-08-17T09:15:00Z",
    nameOfOwner: "Sarah Lim",
  },
  {
    id: "door-4",
    doorNumber: 104,
    imageUrl: "https://images.unsplash.com/photo-1534430803-f6ee6bbf6a63?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 2",
    createdAt: "2025-01-10T11:45:00Z",
    nameOfOwner: "Michael Tan",
  },
  {
    id: "door-5",
    doorNumber: 105,
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 2",
    createdAt: "2025-01-11T16:30:00Z",
    nameOfOwner: "Anonymous",
  },
  {
    id: "door-6",
    doorNumber: 106,
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 2",
    createdAt: "2025-01-12T13:20:00Z",
    nameOfOwner: "Emily Wong",
  },
  {
    id: "door-7",
    doorNumber: 201,
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 1",
    createdAt: "2024-08-18T10:00:00Z",
    nameOfOwner: "David Ng",
  },
  {
    id: "door-8",
    doorNumber: 202,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 1",
    createdAt: "2024-08-19T15:45:00Z",
    nameOfOwner: "Rachel Koh",
  },
  {
    id: "door-9",
    doorNumber: 203,
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 2",
    createdAt: "2025-01-13T12:10:00Z",
    nameOfOwner: "Anonymous",
  },
  {
    id: "door-10",
    doorNumber: 204,
    imageUrl: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 2",
    createdAt: "2025-01-14T09:30:00Z",
    nameOfOwner: "Joshua Lee",
  },
  {
    id: "door-11",
    doorNumber: 205,
    imageUrl: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 1",
    createdAt: "2024-08-20T14:00:00Z",
    nameOfOwner: "Amanda Teo",
  },
  {
    id: "door-12",
    doorNumber: 206,
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
    semester: "AY24/25 Sem 2",
    createdAt: "2025-01-15T11:20:00Z",
    nameOfOwner: "Anonymous",
  },
];

/**
 * Helper function to get a single door by ID
 * 
 * FUTURE: Replace with Supabase query
 * Example: const { data: door } = await supabase.from('doors').select('*').eq('id', doorId).single()
 */
export const getDoorById = (doorId: string): Door | undefined => {
  return mockDoors.find((door) => door.id === doorId);
};
