/**
 * VideoPlayer Component
 * 
 * Displays a video with download option.
 * Handles loading states and errors.
 */

'use client';

import React, { useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  jobId: string;
  title?: string;
}

export default function VideoPlayer({
  videoUrl,
  jobId,
  title = 'Generated Video',
}: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle video download
  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liveavatar-${jobId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download video');
      console.error('Download error:', err);
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
      )}

      <div className="relative bg-black rounded-lg overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white">Loading video...</div>
          </div>
        )}

        <video
          src={videoUrl}
          controls
          className="w-full"
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError('Failed to load video');
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Download Video
      </button>
    </div>
  );
}

