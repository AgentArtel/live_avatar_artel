/**
 * Generation History Page
 * 
 * View all past video generations.
 * Filter by status and view/download completed videos.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import VideoPlayer from '@/components/ui/VideoPlayer';
import { getUserGenerations } from '@/lib/db/generations';
import type { Generation } from '@/lib/db/generations';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Generation['status']>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load generations
  useEffect(() => {
    const loadGenerations = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await getUserGenerations(
          user.id,
          filter === 'all' ? undefined : filter
        );
        setGenerations(data);
      } catch (err) {
        console.error('Failed to load generations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGenerations();
  }, [user, filter]);

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
          <h1 className="text-3xl font-bold text-gray-900">Generation History</h1>
          <p className="mt-2 text-gray-600">
            View all your past video generations
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Generations List */}
        {generations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No generations found. Create your first video in the Generate page!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: List */}
            <div className="space-y-4">
              {generations.map((generation) => (
                <div
                  key={generation.id}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedGeneration?.id === generation.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedGeneration(generation)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">
                        {generation.prompt.substring(0, 50)}
                        {generation.prompt.length > 50 ? '...' : ''}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(generation.created_at).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={generation.status} />
                  </div>
                  {generation.error_message && (
                    <p className="text-xs text-red-600 mt-2">
                      {generation.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Details */}
            {selectedGeneration && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Generation Details</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Status: </span>
                    <StatusBadge status={selectedGeneration.status} />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Prompt: </span>
                    <p className="text-sm text-gray-600 mt-1">{selectedGeneration.prompt}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Job ID: </span>
                    <p className="text-sm font-mono text-gray-600">{selectedGeneration.job_id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Created: </span>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedGeneration.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedGeneration.completed_at && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Completed: </span>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedGeneration.completed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedGeneration.error_message && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      <p className="text-sm font-medium">Error:</p>
                      <p className="text-sm">{selectedGeneration.error_message}</p>
                    </div>
                  )}
                  {selectedGeneration.status === 'completed' && selectedGeneration.video_url && (
                    <div className="mt-4">
                      <VideoPlayer
                        videoUrl={selectedGeneration.video_url}
                        jobId={selectedGeneration.job_id}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

