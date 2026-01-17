/**
 * Door data model for the Chalkipie application
 * 
 * FUTURE: This will be synced with Supabase database schema
 * Ensure this matches the 'doors' table structure when implementing backend
 */

export interface Door {
  id: string;
  doorNumber: number;
  imageUrl: string;
  academicYear: string;  // e.g., "AY24/25"
  semester: number;      // 1 or 2
  floor: number;         // Floor level where door is located
  createdAt: string;
  nameOfOwner: string; // Defaults to "Anonymous"
  status?: string;     // e.g., "processing", "completed", "extracted"
  style?: string;      // e.g., "normal", "ugly", "pretty", "aislop"
}

/**
 * Response from /extract endpoint
 * Contains all door representations in a single call
 */
export interface ExtractResponse {
  chalkImage: string;      // Original chalk image (default view)
  prettifyImage?: string;  // Beautified version
  uglifyImage?: string;    // Uglified version
  sloppifyText?: string;   // Text description
}

/**
 * Academic term combines year and semester for filtering
 */
export interface AcademicTerm {
  academicYear: string;
  semester: number;
  displayName: string; // e.g., "AY24/25 Sem 1"
}
