/**
 * Dashboard Page
 * 
 * Main landing page after login.
 * Shows overview of characters, recent generations, and quick actions.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { checkHealth } from '@/lib/api/client';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [apiStatus, setApiStatus] = useState<{
    online: boolean;
    loading: boolean;
    error?: string;
  }>({ online: false, loading: true });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Check API health
  useEffect(() => {
    const checkApi = async () => {
      try {
        const health = await checkHealth();
        setApiStatus({
          online: health.status === 'online',
          loading: false,
        });
      } catch (error) {
        setApiStatus({
          online: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    if (user) {
      checkApi();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="mt-2 text-gray-600">
            Create amazing talking avatar videos with AI
          </p>
        </div>

        {/* API Status Card */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">API Status</h2>
          {apiStatus.loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  apiStatus.online ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm">
                {apiStatus.online
                  ? 'API is online and ready'
                  : `API is offline: ${apiStatus.error || 'Connection failed'}`}
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/generate"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Generate Video</h3>
            <p className="text-gray-600 text-sm">
              Create a new talking avatar video
            </p>
          </Link>

          <Link
            href="/characters"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">Manage Characters</h3>
            <p className="text-gray-600 text-sm">
              Upload and manage your character images
            </p>
          </Link>

          <Link
            href="/history"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">View History</h3>
            <p className="text-gray-600 text-sm">
              See all your past generations
            </p>
          </Link>
        </div>

        {/* Getting Started */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Upload a character image in the Characters page</li>
            <li>Go to Generate page and select your character</li>
            <li>Upload an audio file and enter a prompt</li>
            <li>Click Generate and wait for your video!</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
