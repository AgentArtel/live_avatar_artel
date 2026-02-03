/**
 * FileUpload Component
 * 
 * A reusable file upload component with drag-and-drop support.
 * Shows preview for images and audio files.
 */

'use client';

import React, { useCallback, useState } from 'react';

interface FileUploadProps {
  accept: string; // e.g., "image/*" or "audio/*"
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  label: string;
  currentFile?: File | null;
  preview?: string | null; // Preview URL for images
}

export default function FileUpload({
  accept,
  maxSizeMB = 50,
  onFileSelect,
  label,
  currentFile,
  preview,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate file before accepting
  const validateFile = (file: File): boolean => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    // Check file type
    if (accept.includes('image')) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return false;
      }
    } else if (accept.includes('audio')) {
      if (!file.type.startsWith('audio/')) {
        setError('Please upload an audio file');
        return false;
      }
    }

    setError(null);
    return true;
  };

  // Handle file selection
  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [onFileSelect, accept, maxSizeMB]
  );

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  // File input change handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Drag and drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${error ? 'border-red-500' : ''}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          className="cursor-pointer"
        >
          {/* Preview for images */}
          {preview && accept.includes('image') && (
            <div className="mb-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 mx-auto rounded-lg"
              />
            </div>
          )}

          {/* File info */}
          {currentFile ? (
            <div>
              <p className="text-sm text-gray-600">
                {currentFile.name} ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click to change file
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max size: {maxSizeMB}MB
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

