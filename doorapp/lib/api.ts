import { supabase } from './supabaseClient';
import { Door, AcademicTerm } from '@/types/door';

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

export async function fetchAvailableTerms(): Promise<AcademicTerm[]> {
  try {
    const termsMap = new Map<string, AcademicTerm>();

    const { data: doorsData } = await supabase
      .from('doors')
      .select('academic_year, semester');

    if (doorsData && doorsData.length > 0) {
      doorsData.forEach((item: any) => {
        const ay = item.academic_year || item.academicYear;
        const sem = item.semester;
        if (ay && sem) {
          const key = `${ay}-${sem}`;
          if (!termsMap.has(key)) {
            termsMap.set(key, {
              academicYear: ay,
              semester: sem,
              displayName: `${ay} Sem ${sem}`,
            });
          }
        }
      });
    }

    const { data: chalksData } = await supabase
      .from('door_chalks')
      .select('semester');

    if (chalksData && chalksData.length > 0) {
      chalksData.forEach((item: any) => {
        if (item.semester) {
          const { academicYear, semester } = parseSemesterCode(item.semester);
          const key = `${academicYear}-${semester}`;
          if (!termsMap.has(key)) {
            termsMap.set(key, {
              academicYear: academicYear,
              semester: semester,
              displayName: `${academicYear} Sem ${semester}`,
            });
          }
        }
      });
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

    // 1. Fetch chalk art - FETCH ALL to ensure we don't miss anything
    const { data: chalksData } = await supabase
        .from('door_chalks')
        .select('*');

    const chalksMap = new Map();
    if (chalksData) {
        chalksData.forEach(c => {
            chalksMap.set(String(c.id), c);
        });
    }

    // 2. Fetch base doors
    const { data: doorsData } = await supabase
        .from('doors')
        .select('*')
        .eq('academic_year', term.academicYear)
        .eq('semester', term.semester);

    const dbDoorsMap = new Map();
    if (doorsData) {
        doorsData.forEach(d => {
            const unit = (d.door_number % 1000 || d.doorNumber % 1000 || 0);
            const doorIdStr = `${d.floor}${100 + unit}`;
            dbDoorsMap.set(doorIdStr, d);
        });
    }

    // 3. Generate FULL GRID (20 floors x 20 rooms)
    const allDoors: Door[] = [];
    for (let floor = 1; floor <= 20; floor++) {
      for (let unit = 1; unit <= 20; unit++) {
        const unitPart = 100 + unit; 
        const doorIdStr = `${floor}${unitPart}`;
        const doorNumber = floor * 1000 + unitPart;
        
        const dbDoor = dbDoorsMap.get(doorIdStr);
        const chalk = chalksMap.get(doorIdStr);
        
        // Priority: processed_url > original_url > image_url (legacy) > db door > fallback
        const imageUrl = chalk?.processed_url || 
                         chalk?.original_url || 
                         chalk?.image_url || 
                         dbDoor?.image_url || 
                         dbDoor?.imageUrl || "";
        
        allDoors.push({
          id: doorIdStr,
          doorNumber: doorNumber,
          imageUrl: imageUrl,
          academicYear: term.academicYear,
          semester: term.semester,
          floor: floor,
          createdAt: chalk?.created_at || dbDoor?.created_at || new Date().toISOString(),
          nameOfOwner: chalk?.owner_name || dbDoor?.name_of_owner || dbDoor?.nameOfOwner || "Anonymous",
          status: chalk?.status || 'idle',
          style: chalk?.style || 'normal'
        });
      }
    }

    return allDoors;
  } catch (err) {
      return [];
  }
}