/**
 * Settings Page
 * 
 * Configure default generation parameters.
 * Users can customize their preferred settings.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getUserSettings, updateUserSettings } from '@/lib/db/settings';
import type { UserSettings } from '@/lib/db/settings';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [defaultSize, setDefaultSize] = useState('704*384');
  const [defaultSampleSteps, setDefaultSampleSteps] = useState(4);
  const [defaultInferFrames, setDefaultInferFrames] = useState(48);
  const [defaultSampleSolver, setDefaultSampleSolver] = useState('euler');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const data = await getUserSettings(user.id);
        setSettings(data);
        setDefaultSize(data.default_size);
        setDefaultSampleSteps(data.default_sample_steps);
        setDefaultInferFrames(data.default_infer_frames);
        setDefaultSampleSolver(data.default_sample_solver);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Handle save
  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await updateUserSettings(user.id, {
        default_size: defaultSize,
        default_sample_steps: defaultSampleSteps,
        default_infer_frames: defaultInferFrames,
        default_sample_solver: defaultSampleSolver,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Configure your default generation parameters
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            Settings saved successfully!
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Default Generation Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Size
              </label>
              <input
                type="text"
                value={defaultSize}
                onChange={(e) => setDefaultSize(e.target.value)}
                placeholder="704*384"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: width*height (e.g., 704*384)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Sample Steps
              </label>
              <input
                type="number"
                value={defaultSampleSteps}
                onChange={(e) => setDefaultSampleSteps(parseInt(e.target.value))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Number of sampling steps (1-10, default: 4)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Infer Frames
              </label>
              <input
                type="number"
                value={defaultInferFrames}
                onChange={(e) => setDefaultInferFrames(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Number of frames to generate (default: 48)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Sample Solver
              </label>
              <select
                value={defaultSampleSolver}
                onChange={(e) => setDefaultSampleSolver(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="euler">Euler</option>
                <option value="dpm">DPM</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Sampling algorithm to use
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

