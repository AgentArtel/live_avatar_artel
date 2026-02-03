/**
 * Characters Page
 * 
 * Manage user's character images.
 * Upload, view, and delete characters.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FileUpload from '@/components/ui/FileUpload';
import { getUserCharacters, createCharacter, deleteCharacter } from '@/lib/db/characters';
import type { Character } from '@/lib/db/characters';

export default function CharactersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterImage, setNewCharacterImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load characters
  useEffect(() => {
    const loadCharacters = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await getUserCharacters(user.id);
        setCharacters(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load characters');
      } finally {
        setLoading(false);
      }
    };

    loadCharacters();
  }, [user]);

  // Handle image selection
  const handleImageSelect = (file: File) => {
    setNewCharacterImage(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle character upload
  const handleUpload = async () => {
    if (!user || !newCharacterImage || !newCharacterName.trim()) {
      setError('Please provide a name and image');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // In a real app, you'd upload the image to a storage service (S3, Supabase Storage, etc.)
      // For now, we'll use a data URL (not recommended for production)
      const imageUrl = imagePreview || '';

      await createCharacter({
        user_id: user.id,
        name: newCharacterName,
        image_url: imageUrl,
      });

      // Reload characters
      const data = await getUserCharacters(user.id);
      setCharacters(data);

      // Reset form
      setNewCharacterName('');
      setNewCharacterImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload character');
    } finally {
      setUploading(false);
    }
  };

  // Handle character deletion
  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) {
      return;
    }

    try {
      await deleteCharacter(characterId);
      // Reload characters
      if (user) {
        const data = await getUserCharacters(user.id);
        setCharacters(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete character');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Characters</h1>
          <p className="mt-2 text-gray-600">
            Upload and manage character images for video generation
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Upload New Character</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Character Name
              </label>
              <input
                type="text"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                placeholder="Enter character name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <FileUpload
              accept="image/*"
              maxSizeMB={10}
              onFileSelect={handleImageSelect}
              label="Character Image"
              currentFile={newCharacterImage}
              preview={imagePreview}
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !newCharacterName || !newCharacterImage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Character'}
            </button>
          </div>
        </div>

        {/* Characters Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Characters</h2>
          {characters.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No characters yet. Upload your first character above!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <img
                    src={character.image_url}
                    alt={character.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{character.name}</h3>
                    <button
                      onClick={() => handleDelete(character.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

