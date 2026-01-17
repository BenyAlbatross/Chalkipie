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
  semester: string;
  createdAt: string;
  nameOfOwner: string; // Defaults to "Anonymous"
}
