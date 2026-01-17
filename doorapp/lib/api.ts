import { supabase } from './supabaseClient';
import { Door, AcademicTerm } from '@/types/door';
import { getAvailableTerms as getMockTerms, mockDoors } from './mockData';

export async function fetchAvailableTerms(): Promise<AcademicTerm[]> {
  try {
    const { data, error } = await supabase
      .from('doors')
      .select('academic_year, semester');

    if (error) {
      console.warn('Error fetching terms from Supabase, falling back to mock data:', error);
      return getMockTerms();
    }

    const termsMap = new Map<string, AcademicTerm>();

    if (data && data.length > 0) {
      data.forEach((item: any) => {
          // Handle potential casing differences (snake_case vs camelCase) from DB return
          const academicYear = item.academic_year || item.academicYear;
          const semester = item.semester;
          
          if (academicYear && semester) {
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
      return Array.from(termsMap.values()).sort((a, b) => {
        if (a.academicYear !== b.academicYear) {
          return b.academicYear.localeCompare(a.academicYear);
        }
        return b.semester - a.semester;
      });
    } else {
       console.warn('No terms found in Supabase, falling back to mock data.');
       return getMockTerms();
    }
  } catch (err) {
      console.warn('Exception in fetchAvailableTerms, falling back to mock data:', err);
      return getMockTerms();
  }
}

export async function fetchDoorsForTerm(term: AcademicTerm): Promise<Door[]> {
  try {
    const { data, error } = await supabase
        .from('doors')
        .select('*')
        .eq('academic_year', term.academicYear)
        .eq('semester', term.semester);

    if (error) {
        console.warn('Error fetching doors from Supabase, falling back to mock data:', error);
        return getMockDoorsForTerm(term);
    }

    if (data && data.length > 0) {
        return data.map((d: any) => ({
            id: d.id,
            doorNumber: d.door_number || d.doorNumber,
            imageUrl: d.image_url || d.imageUrl,
            academicYear: d.academic_year || d.academicYear,
            semester: d.semester,
            floor: d.floor,
            createdAt: d.created_at || d.createdAt,
            nameOfOwner: d.name_of_owner || d.nameOfOwner || "Anonymous",
        }));
    } else {
        console.warn('No doors found in Supabase for this term, falling back to mock data.');
        return getMockDoorsForTerm(term);
    }
  } catch (err) {
      console.warn('Exception in fetchDoorsForTerm, falling back to mock data:', err);
      return getMockDoorsForTerm(term);
  }
}

function getMockDoorsForTerm(term: AcademicTerm): Door[] {
    return mockDoors.filter(
        door => 
          door.academicYear === term.academicYear && 
          door.semester === term.semester
      );
}