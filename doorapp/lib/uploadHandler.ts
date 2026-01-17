/**
 * Utility functions for handling door image uploads
 */

interface UploadOptions {
  roomId?: string;
  metadata?: Record<string, any>;
}

interface UploadResult {
  success: boolean;
  action: string;
  originalUrl: string;
  processedUrl: string;
  roomId: string;
  error?: string;
}

/**
 * Upload an image to the specified processing endpoint
 * @param imageFile - The image file to upload
 * @param action - The processing action: 'prettify', 'uglify', or 'sloppify'
 * @param options - Optional room ID and metadata
 * @returns Upload result with URLs
 */
export async function uploadDoorImage(
  imageFile: File,
  action: 'prettify' | 'uglify' | 'sloppify',
  options: UploadOptions = {}
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  if (options.roomId) {
    formData.append('roomId', options.roomId);
  }
  
  if (options.metadata) {
    formData.append('metadata', JSON.stringify(options.metadata));
  }

  try {
    const response = await fetch(`/api/upload/${action}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error(`Upload error for ${action}:`, error);
    throw error;
  }
}

/**
 * Upload an image to all three processing endpoints
 * @param imageFile - The image file to upload
 * @param options - Optional room ID and metadata
 * @returns Array of upload results
 */
export async function uploadDoorImageAll(
  imageFile: File,
  options: UploadOptions = {}
): Promise<UploadResult[]> {
  const actions: Array<'prettify' | 'uglify' | 'sloppify'> = [
    'prettify',
    'uglify',
    'sloppify'
  ];

  try {
    const results = await Promise.all(
      actions.map(action => uploadDoorImage(imageFile, action, options))
    );
    return results;
  } catch (error) {
    console.error('Error uploading to all endpoints:', error);
    throw error;
  }
}
