'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadDoorImageAll } from '@/lib/uploadHandler';

interface ImageUploaderProps {
  doorId?: string;
  initialSemester?: number;
  academicYear?: string;
  onUploadSuccess?: (url: string) => void;
}

export default function ImageUploader({ 
  doorId = '', 
  initialSemester = 1, 
  academicYear = '25/26',
  onUploadSuccess 
}: ImageUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  
  // Metadata state
  const [style, setStyle] = useState('normal');
  const [semester, setSemester] = useState(String(initialSemester));

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format semester like 252620
  const formatSemesterCode = (ay: string, sem: string) => {
    // ay: "25/26" -> "2526"
    const years = ay.replace('/', '');
    // sem: "2" -> "20"
    return `${years}${sem}0`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // Upload to all three endpoints (prettify, uglify, sloppify)
      const results = await uploadDoorImageAll(selectedImage, {
        roomId: doorId,
        metadata: {
          style,
          semester: formatSemesterCode(academicYear, semester)
        }
      });

      // Use the first result's original URL as the main upload URL
      const mainResult = results[0];
      
      setUploadStatus('success');
      setUploadedUrl(mainResult.originalUrl);
      console.log('Upload successful to all endpoints:', results);
      
      if (onUploadSuccess) {
        onUploadSuccess(mainResult.originalUrl);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setUploadStatus('idle');
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg border-2 border-black">
      <h2 className="text-2xl font-bold mb-6 text-center font-handwritten">Upload Chalk Art</h2>
      
      <form onSubmit={handleUpload} className="space-y-4">
        {/* Image Input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer block w-full h-full">
            {previewUrl ? (
              <div className="relative aspect-video w-full h-48 mx-auto">
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill 
                  className="object-contain rounded-md" 
                />
              </div>
            ) : (
              <div className="py-8 text-gray-500">
                <span className="text-4xl block mb-2">📷</span>
                <span className="font-medium">Click to select image</span>
              </div>
            )}
          </label>
        </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Style</label>
            <select 
              value={style} 
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2 border-2 border-black rounded-md font-sans"
            >
              <option value="normal">Normal</option>
              <option value="ugly">Ugly</option>
              <option value="pretty">Pretty</option>
              <option value="aislop">AI Slop</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Semester</label>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value)}
              className="w-full p-2 border-2 border-black rounded-md font-sans"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedImage || isUploading}
          className={`w-full py-3 px-4 rounded-md font-bold text-white transition-transform ${
            !selectedImage || isUploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-pastel-blue hover:bg-pastel-green hover:scale-[1.02] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
          }`}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="mt-4 p-3 bg-pastel-green border-2 border-black rounded-md animate-fade-in">
          <p className="font-bold text-center">✅ Upload Successful!</p>
          {uploadedUrl && (
            <div className="mt-2 text-center">
              <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm">
                View Image
              </a>
            </div>
          )}
          <button 
            onClick={resetForm}
            className="mt-3 w-full text-sm underline text-gray-700 hover:text-black"
          >
            Upload Another
          </button>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="mt-4 p-3 bg-pastel-pink border-2 border-black rounded-md animate-fade-in">
          <p className="font-bold text-center">❌ Upload Failed</p>
          <p className="text-sm text-center mt-1">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}