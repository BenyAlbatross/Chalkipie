import ImageUploader from '@/components/ImageUploader';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-light-gray flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Chalkipie Studio</h1>
        <p className="text-dark-gray">Share your door art with the world</p>
      </div>
      
      <ImageUploader />
      
      <div className="mt-12 text-center text-sm text-gray-500">
        <a href="/" className="hover:underline">← Back to Hotel</a>
      </div>
    </div>
  );
}