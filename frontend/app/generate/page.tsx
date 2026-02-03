/**
 * Video Generation Page
 * 
 * Main interface for generating talking avatar videos.
 * Users can select a character, upload audio, enter a prompt, and generate videos.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FileUpload from '@/components/ui/FileUpload';
import VideoPlayer from '@/components/ui/VideoPlayer';
import StatusBadge from '@/components/ui/StatusBadge';
import { createGeneration, pollJobStatus } from '@/lib/api/client';
import { createGeneration as createGenerationRecord, updateGenerationByJobId } from '@/lib/db/generations';
import { getUserCharacters } from '@/lib/db/characters';
import { getUserSettings } from '@/lib/db/settings';
import type { Character } from '@/lib/db/characters';
import type { JobStatusResponse } from '@/lib/api/client';

export default function GeneratePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [characterImage, setCharacterImage] = useState<File | null>(null);
  const [characterImagePreview, setCharacterImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Generation settings
  const [size, setSize] = useState('704*384');
  const [sampleSteps, setSampleSteps] = useState(4);
  const [inferFrames, setInferFrames] = useState(48);
  const [sampleSolver, setSampleSolver] = useState('euler');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load characters and settings
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Load characters
        const chars = await getUserCharacters(user.id);
        setCharacters(chars);

        // Load user settings for defaults
        const settings = await getUserSettings(user.id);
        setSize(settings.default_size);
        setSampleSteps(settings.default_sample_steps);
        setInferFrames(settings.default_infer_frames);
        setSampleSolver(settings.default_sample_solver);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    loadData();
  }, [user]);

  // Handle character selection
  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    // Load character image as File (in production, fetch from storage)
    // For now, we'll use the image URL directly
  };

  // Handle character image upload (for new uploads)
  const handleCharacterImageSelect = (file: File) => {
    setCharacterImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCharacterImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle audio file selection
  const handleAudioSelect = (file: File) => {
    setAudioFile(file);
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!user) return;

    // Validate inputs
    if (!characterImage && !selectedCharacter) {
      setError('Please select a character or upload an image');
      return;
    }
    if (!audioFile) {
      setError('Please upload an audio file');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setCurrentJob(null);

      // Get the image file to use
      let imageFile: File;
      if (characterImage) {
        imageFile = characterImage;
      } else if (selectedCharacter) {
        // In production, fetch the image from storage
        // For now, we'll need to convert the URL to a File
        // This is a simplified version - in production, fetch from storage
        const response = await fetch(selectedCharacter.image_url);
        const blob = await response.blob();
        imageFile = new File([blob], 'character.jpg', { type: 'image/jpeg' });
      } else {
        throw new Error('No image available');
      }

      // Create generation job via API
      const jobResponse = await createGeneration({
        prompt,
        image: imageFile,
        audio: audioFile,
        size,
        sample_steps: sampleSteps,
        infer_frames: inferFrames,
        sample_solver: sampleSolver,
      });

      // Create database record
      const generationRecord = await createGenerationRecord({
        user_id: user.id,
        character_id: selectedCharacter?.id || null,
        job_id: jobResponse.job_id,
        prompt,
        status: 'pending',
      });

      // Start polling for status
      setCurrentJob({
        job_id: jobResponse.job_id,
        status: 'pending',
        video_url: null,
        error: null,
        created_at: new Date().toISOString(),
        completed_at: null,
      });

      // Poll for completion
      const finalStatus = await pollJobStatus(
        jobResponse.job_id,
        5000,
        (status) => {
          setCurrentJob(status);
          // Update database
          updateGenerationByJobId(jobResponse.job_id, {
            status: status.status,
            video_url: status.video_url || null,
            error_message: status.error || null,
            completed_at: status.completed_at ? new Date(status.completed_at).toISOString() : null,
          });
        }
      );

      setCurrentJob(finalStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      console.error('Generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Generate Video</h1>
          <p className="mt-2 text-gray-600">
            Create a talking avatar video from an image and audio
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Form */}
          <div className="space-y-6">
            {/* Character Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Character</h2>
              
              {characters.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Existing Character
                  </label>
                  <select
                    value={selectedCharacter?.id || ''}
                    onChange={(e) => {
                      const char = characters.find(c => c.id === e.target.value);
                      setSelectedCharacter(char || null);
                      setCharacterImage(null);
                      setCharacterImagePreview(null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select a character --</option>
                    {characters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="text-sm text-gray-600 mb-2">Or upload a new image:</div>
              <FileUpload
                accept="image/*"
                maxSizeMB={10}
                onFileSelect={handleCharacterImageSelect}
                label="Character Image"
                currentFile={characterImage}
                preview={characterImagePreview || selectedCharacter?.image_url || null}
              />
            </div>

            {/* Audio Upload */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Audio</h2>
              <FileUpload
                accept="audio/*"
                maxSizeMB={50}
                onFileSelect={handleAudioSelect}
                label="Audio File"
                currentFile={audioFile}
              />
            </div>

            {/* Prompt */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Prompt</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a description of what you want the character to do..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Generation Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="704*384"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Steps
                  </label>
                  <input
                    type="number"
                    value={sampleSteps}
                    onChange={(e) => setSampleSteps(parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Infer Frames
                  </label>
                  <input
                    type="number"
                    value={inferFrames}
                    onChange={(e) => setInferFrames(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sample Solver
                  </label>
                  <select
                    value={sampleSolver}
                    onChange={(e) => setSampleSolver(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="euler">Euler</option>
                    <option value="dpm">DPM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {generating ? 'Generating...' : 'Generate Video'}
            </button>
          </div>

          {/* Right Column: Status and Result */}
          <div className="space-y-6">
            {currentJob && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Generation Status</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Status: </span>
                    <StatusBadge status={currentJob.status} />
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Job ID: </span>
                    <span className="text-sm font-mono">{currentJob.job_id}</span>
                  </div>
                  {currentJob.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {currentJob.error}
                    </div>
                  )}
                  {currentJob.status === 'processing' && (
                    <LoadingSpinner text="Processing video..." />
                  )}
                </div>
              </div>
            )}

            {currentJob?.status === 'completed' && currentJob.video_url && (
              <div className="bg-white rounded-lg shadow p-6">
                <VideoPlayer
                  videoUrl={currentJob.video_url}
                  jobId={currentJob.job_id}
                  title="Generated Video"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

