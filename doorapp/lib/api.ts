import { Door, AcademicTerm } from '@/types/door';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5001';

/**
 * Formats academic year and semester into a code like "252620"
 */
function formatSemesterCode(academicYear: string, semester: number): string {
  const years = academicYear.replace('/', '');
  return `${years}${semester}0`;
}

/**
 * Parses a semester code like "252620" into academic year and semester
 */
function parseSemesterCode(code: string): { academicYear: string, semester: number } {
  if (!code || code.length < 5) {
    return { academicYear: "25/26", semester: 1 };
  }
  const ay = `${code.substring(0, 2)}/${code.substring(2, 4)}`;
  const sem = parseInt(code.substring(4, 5));
  return { academicYear: ay, semester: sem || 1 };
}

/**
 * Fetch all scans from backend for a specific semester
 */
async function fetchScansForSemester(semesterCode: string): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/scans/${semesterCode}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      console.warn(`Failed to fetch scans for semester ${semesterCode}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching scans from backend:', error);
    return [];
  }
}

/**
 * Fetch a single scan by room_id from backend
 */
export async function fetchScanByRoomId(roomId: string): Promise<any | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/scan/${roomId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.warn(`Failed to fetch scan for room ${roomId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scan from backend:', error);
    return null;
  }
}

export async function fetchAvailableTerms(): Promise<AcademicTerm[]> {
  try {
    // For now, we'll fetch all known semester codes from backend
    // This is a simplified approach - fetch scans from multiple common semesters
    const potentialSemesters = ['252610', '252620', '242510', '242520'];
    const termsMap = new Map<string, AcademicTerm>();

    for (const semCode of potentialSemesters) {
      const scans = await fetchScansForSemester(semCode);
      if (scans.length > 0) {
        const { academicYear, semester } = parseSemesterCode(semCode);
        const key = `${academicYear}-${semester}`;
        if (!termsMap.has(key)) {
          termsMap.set(key, {
            academicYear,
            semester,
            displayName: `${academicYear} Sem ${semester}`,
          });
        }
      }
    }

    if (termsMap.size === 0) {
      return [{
        academicYear: "25/26",
        semester: 1,
        displayName: "25/26 Sem 1"
      }];
    }

    return Array.from(termsMap.values()).sort((a, b) => {
      if (a.academicYear !== b.academicYear) {
        return b.academicYear.localeCompare(a.academicYear);
      }
      return b.semester - a.semester;
    });
  } catch (err) {
    console.error('Error fetching available terms:', err);
    return [{
      academicYear: "25/26",
      semester: 1,
      displayName: "25/26 Sem 1"
    }];
  }
}

export async function fetchDoorsForTerm(term: AcademicTerm): Promise<Door[]> {
  try {
    const semCode = formatSemesterCode(term.academicYear, term.semester);

    // Fetch chalk scans from backend - Source of Truth for images
    const scans = await fetchScansForSemester(semCode);

    const scansMap = new Map();
    if (scans) {
      scans.forEach((s: any) => {
        // Map by roomId (e.g., "17124")
        if (s.roomId) {
          console.log('Scan roomId:', s.roomId, 'chalkImage:', s.chalkImage, 'status:', s.status);
          scansMap.set(String(s.roomId), s);
        }
      });
    }
    
    console.log('Total scans loaded:', scansMap.size);

    // Generate FULL GRID (20 floors x 20 rooms)
    const allDoors: Door[] = [];
    for (let floor = 1; floor <= 20; floor++) {
      for (let unit = 1; unit <= 20; unit++) {
        const unitPart = 100 + unit; 
        const doorIdStr = `${floor}${unitPart}`;
        const doorNumber = floor * 1000 + unitPart;
        
        const scan = scansMap.get(doorIdStr);
        
        // Use chalkImage (processed_url) or fallback to original_url while processing
        let imageUrl = scan?.chalkImage || scan?.original_url || "";
        
        // Debug logging for doors with scans
        if (scan) {
          console.log(`Door ${doorIdStr}: imageUrl=${imageUrl}, status=${scan.status}`);
        }
        
        allDoors.push({
          id: doorIdStr,
          doorNumber: doorNumber,
          imageUrl: imageUrl,
          academicYear: term.academicYear,
          semester: term.semester,
          floor: floor,
          createdAt: scan?.created_at || new Date().toISOString(),
          nameOfOwner: "Anonymous",
          status: scan?.status || 'idle',
          style: scan?.style || 'normal'
        });
      }
    }

    return allDoors;
  } catch (err) {
    console.error('Error fetching doors for term:', err);
    return [];
  }
}