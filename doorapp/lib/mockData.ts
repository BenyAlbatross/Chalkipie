import { Door, AcademicTerm } from "@/types/door";

/**
 * Mock door data for UI development
 * 
 * Default placeholder images for doors
 * FUTURE: Replace this with actual Supabase queries
 * Example: const { data: doors } = await supabase.from('doors').select('*')
 */

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
  "https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=400&h=600&fit=crop", // door image
];

const SAMPLE_NAMES = [
  "Alex Chen", "Sarah Lim", "David Ng", "Rachel Koh", "Amanda Teo",
  "Marcus Lee", "Nina Patel", "Emily Wong", "James Tan", "Sophie Chen",
  "Joshua Lee", "Lisa Koh", "Kevin Lim", "Maya Singh", "Daniel Yeo",
  "Sophie Tan", "Ryan Goh", "Jessica Ng", "Michael Tan", "Amanda Lee"
];

/**
 * Generate exactly 20 doors per floor with format XX-001 to XX-020
 */
const generateDoorsForFloor = (
  academicYear: string,
  semester: number,
  floor: number
): Door[] => {
  const doors: Door[] = [];

  for (let i = 1; i <= 20; i++) {
    const doorNumber = floor * 1000 + i;
    const imageIndex = (floor + i) % PLACEHOLDER_IMAGES.length;
    const nameIndex = (floor * 20 + i) % SAMPLE_NAMES.length;

    doors.push({
      id: `door-${academicYear}-s${semester}-f${floor}-${i}`,
      doorNumber,
      imageUrl: PLACEHOLDER_IMAGES[imageIndex],
      academicYear,
      semester,
      floor,
      createdAt: new Date(2024, 7, floor, i).toISOString(),
      nameOfOwner: SAMPLE_NAMES[nameIndex],
    });
  }

  return doors;
};

export const mockDoors: Door[] = [
  // AY24/25 Sem 1 - 20 floors with 20 doors each
  ...generateDoorsForFloor("AY24/25", 1, 20),
  ...generateDoorsForFloor("AY24/25", 1, 19),
  ...generateDoorsForFloor("AY24/25", 1, 18),
  ...generateDoorsForFloor("AY24/25", 1, 17),
  ...generateDoorsForFloor("AY24/25", 1, 16),
  ...generateDoorsForFloor("AY24/25", 1, 15),
  ...generateDoorsForFloor("AY24/25", 1, 14),
  ...generateDoorsForFloor("AY24/25", 1, 13),
  ...generateDoorsForFloor("AY24/25", 1, 12),
  ...generateDoorsForFloor("AY24/25", 1, 11),
  ...generateDoorsForFloor("AY24/25", 1, 10),
  ...generateDoorsForFloor("AY24/25", 1, 9),
  ...generateDoorsForFloor("AY24/25", 1, 8),
  ...generateDoorsForFloor("AY24/25", 1, 7),
  ...generateDoorsForFloor("AY24/25", 1, 6),
  ...generateDoorsForFloor("AY24/25", 1, 5),
  ...generateDoorsForFloor("AY24/25", 1, 4),
  ...generateDoorsForFloor("AY24/25", 1, 3),
  ...generateDoorsForFloor("AY24/25", 1, 2),
  ...generateDoorsForFloor("AY24/25", 1, 1),

  // AY24/25 Sem 2 - 20 floors with 20 doors each
  ...generateDoorsForFloor("AY24/25", 2, 20),
  ...generateDoorsForFloor("AY24/25", 2, 19),
  ...generateDoorsForFloor("AY24/25", 2, 18),
  ...generateDoorsForFloor("AY24/25", 2, 17),
  ...generateDoorsForFloor("AY24/25", 2, 16),
  ...generateDoorsForFloor("AY24/25", 2, 15),
  ...generateDoorsForFloor("AY24/25", 2, 14),
  ...generateDoorsForFloor("AY24/25", 2, 13),
  ...generateDoorsForFloor("AY24/25", 2, 12),
  ...generateDoorsForFloor("AY24/25", 2, 11),
  ...generateDoorsForFloor("AY24/25", 2, 10),
  ...generateDoorsForFloor("AY24/25", 2, 9),
  ...generateDoorsForFloor("AY24/25", 2, 8),
  ...generateDoorsForFloor("AY24/25", 2, 7),
  ...generateDoorsForFloor("AY24/25", 2, 6),
  ...generateDoorsForFloor("AY24/25", 2, 5),
  ...generateDoorsForFloor("AY24/25", 2, 4),
  ...generateDoorsForFloor("AY24/25", 2, 3),
  ...generateDoorsForFloor("AY24/25", 2, 2),
  ...generateDoorsForFloor("AY24/25", 2, 1),
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
