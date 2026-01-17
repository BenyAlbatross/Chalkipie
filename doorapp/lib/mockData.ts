import { Door, AcademicTerm } from "@/types/door";

/**
 * Mock door data for UI development
 * 
 * Default placeholder image for doors without uploaded content
 * FUTURE: Replace this with actual Supabase queries
 * Example: const { data: doors } = await supabase.from('doors').select('*')
 */

const DEFAULT_DOOR_IMAGE = "https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=400&h=600&fit=crop";

/**
 * Generate doors per floor with a mix of real and placeholder data
 * Each floor can have varying numbers of doors
 */
const generateDoorsForFloor = (
  academicYear: string,
  semester: number,
  floor: number,
  count: number,
  realDoors: Partial<Door>[]
): Door[] => {
  const doors: Door[] = [];
  const baseNumber = floor * 100;

  for (let i = 1; i <= count; i++) {
    const doorNumber = baseNumber + i;
    const realDoor = realDoors.find(d => d.doorNumber === doorNumber);

    doors.push({
      id: `door-${academicYear}-s${semester}-f${floor}-${i}`,
      doorNumber,
      imageUrl: realDoor?.imageUrl || DEFAULT_DOOR_IMAGE,
      academicYear,
      semester,
      floor,
      createdAt: realDoor?.createdAt || new Date().toISOString(),
      nameOfOwner: realDoor?.nameOfOwner || "Anonymous",
    });
  }

  return doors;
};

export const mockDoors: Door[] = [
  // AY24/25 Sem 1 - 20 floors
  ...generateDoorsForFloor("AY24/25", 1, 20, 8, [
    { doorNumber: 2001, imageUrl: "https://images.unsplash.com/photo-1508666709879-08d4fe5a76e0?w=400&h=600&fit=crop", nameOfOwner: "Alex Chen", createdAt: "2024-08-15T10:30:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 1, 19, 10, []),
  ...generateDoorsForFloor("AY24/25", 1, 18, 12, []),
  ...generateDoorsForFloor("AY24/25", 1, 17, 10, []),
  ...generateDoorsForFloor("AY24/25", 1, 16, 8, []),
  ...generateDoorsForFloor("AY24/25", 1, 15, 12, []),
  ...generateDoorsForFloor("AY24/25", 1, 14, 15, []),
  ...generateDoorsForFloor("AY24/25", 1, 13, 10, []),
  ...generateDoorsForFloor("AY24/25", 1, 12, 8, []),
  ...generateDoorsForFloor("AY24/25", 1, 11, 12, []),
  ...generateDoorsForFloor("AY24/25", 1, 10, 15, []),
  ...generateDoorsForFloor("AY24/25", 1, 9, 10, []),
  ...generateDoorsForFloor("AY24/25", 1, 8, 12, []),
  ...generateDoorsForFloor("AY24/25", 1, 7, 14, []),
  ...generateDoorsForFloor("AY24/25", 1, 6, 8, [
    { doorNumber: 602, imageUrl: "https://images.unsplash.com/photo-1506792006437-256b665541e2?w=400&h=600&fit=crop", nameOfOwner: "Sarah Lim", createdAt: "2024-08-16T14:20:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 1, 5, 12, [
    { doorNumber: 501, imageUrl: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&h=600&fit=crop", nameOfOwner: "David Ng", createdAt: "2024-08-17T09:15:00Z" },
    { doorNumber: 502, imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=600&fit=crop", nameOfOwner: "Rachel Koh", createdAt: "2024-08-18T10:00:00Z" },
    { doorNumber: 503, imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", nameOfOwner: "Amanda Teo", createdAt: "2024-08-19T15:45:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 1, 4, 15, [
    { doorNumber: 401, imageUrl: "https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=400&h=600&fit=crop", nameOfOwner: "Marcus Lee", createdAt: "2024-08-20T14:00:00Z" },
    { doorNumber: 402, imageUrl: "https://images.unsplash.com/photo-1534430803-f6ee6bbf6a63?w=400&h=600&fit=crop", nameOfOwner: "Nina Patel", createdAt: "2024-08-21T11:45:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 1, 3, 18, [
    { doorNumber: 301, imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop", nameOfOwner: "Emily Wong", createdAt: "2024-08-22T16:30:00Z" },
    { doorNumber: 302, imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop", nameOfOwner: "James Tan", createdAt: "2024-08-23T13:20:00Z" },
    { doorNumber: 303, imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop", nameOfOwner: "Sophie Chen", createdAt: "2024-08-24T12:10:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 1, 2, 20, [
    { doorNumber: 201, imageUrl: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&h=600&fit=crop", nameOfOwner: "Joshua Lee", createdAt: "2024-08-25T09:30:00Z" },
    { doorNumber: 202, imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop", nameOfOwner: "Lisa Koh", createdAt: "2024-08-26T11:20:00Z" },
    { doorNumber: 203, imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop", nameOfOwner: "Kevin Lim", createdAt: "2024-08-27T10:00:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 1, 1, 22, [
    { doorNumber: 101, imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop", nameOfOwner: "Sophie Tan", createdAt: "2024-08-28T14:30:00Z" },
    { doorNumber: 102, imageUrl: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=600&fit=crop", nameOfOwner: "Daniel Yeo", createdAt: "2024-08-29T15:45:00Z" },
    { doorNumber: 103, imageUrl: "https://images.unsplash.com/photo-1517630800677-932d836ab680?w=400&h=600&fit=crop", nameOfOwner: "Maya Singh", createdAt: "2024-08-30T09:15:00Z" },
  ]),

  // AY24/25 Sem 2 - 20 floors
  ...generateDoorsForFloor("AY24/25", 2, 20, 6, []),
  ...generateDoorsForFloor("AY24/25", 2, 19, 8, []),
  ...generateDoorsForFloor("AY24/25", 2, 18, 10, []),
  ...generateDoorsForFloor("AY24/25", 2, 17, 8, []),
  ...generateDoorsForFloor("AY24/25", 2, 16, 6, []),
  ...generateDoorsForFloor("AY24/25", 2, 15, 10, []),
  ...generateDoorsForFloor("AY24/25", 2, 14, 12, []),
  ...generateDoorsForFloor("AY24/25", 2, 13, 8, []),
  ...generateDoorsForFloor("AY24/25", 2, 12, 10, []),
  ...generateDoorsForFloor("AY24/25", 2, 11, 10, []),
  ...generateDoorsForFloor("AY24/25", 2, 10, 12, []),
  ...generateDoorsForFloor("AY24/25", 2, 9, 8, []),
  ...generateDoorsForFloor("AY24/25", 2, 8, 10, []),
  ...generateDoorsForFloor("AY24/25", 2, 7, 12, []),
  ...generateDoorsForFloor("AY24/25", 2, 6, 6, [
    { doorNumber: 601, imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=600&fit=crop", nameOfOwner: "Michael Tan", createdAt: "2025-01-10T11:45:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 2, 5, 10, [
    { doorNumber: 501, imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop", nameOfOwner: "Grace Liu", createdAt: "2025-01-11T16:30:00Z" },
  ]),
  ...generateDoorsForFloor("AY24/25", 2, 4, 14, []),
  ...generateDoorsForFloor("AY24/25", 2, 3, 16, []),
  ...generateDoorsForFloor("AY24/25", 2, 2, 18, []),
  ...generateDoorsForFloor("AY24/25", 2, 1, 20, []),
];

/**
 * Get all unique academic terms from doors
 * FUTURE: Replace with Supabase query
 */
export const getAvailableTerms = (): AcademicTerm[] => {
  const termsMap = new Map<string, AcademicTerm>();
  
  mockDoors.forEach(door => {
    const key = `${door.academicYear}-${door.semester}`;
    if (!termsMap.has(key)) {
      termsMap.set(key, {
        academicYear: door.academicYear,
        semester: door.semester,
        displayName: `${door.academicYear} Sem ${door.semester}`,
      });
    }
  });
  
  return Array.from(termsMap.values()).sort((a, b) => {
    if (a.academicYear !== b.academicYear) {
      return b.academicYear.localeCompare(a.academicYear);
    }
    return b.semester - a.semester;
  });
};

/**
 * Get available floors for a specific academic term
 * FUTURE: Replace with Supabase query
 */
export const getAvailableFloorsForTerm = (term: AcademicTerm): number[] => {
  const floors = new Set<number>();
  
  mockDoors.forEach(door => {
    if (door.academicYear === term.academicYear && door.semester === term.semester) {
      floors.add(door.floor);
    }
  });
  
  return Array.from(floors).sort((a, b) => a - b);
};

/**
 * Filter doors by academic term and floor
 * FUTURE: Replace with Supabase query with filters
 */
export const getDoorsForTermAndFloor = (term: AcademicTerm, floor: number): Door[] => {
  return mockDoors.filter(
    door => 
      door.academicYear === term.academicYear && 
      door.semester === term.semester &&
      door.floor === floor
  );
};

/**
 * Helper function to get a single door by ID
 * 
 * FUTURE: Replace with Supabase query
 * Example: const { data: door } = await supabase.from('doors').select('*').eq('id', doorId).single()
 */
export const getDoorById = (doorId: string): Door | undefined => {
  return mockDoors.find((door) => door.id === doorId);
};
