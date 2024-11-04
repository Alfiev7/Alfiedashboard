import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Goals } from '../types';

interface Props {
  onQuarterCreated: (quarterId: string) => void;
}

export function WelcomeModal({ onQuarterCreated }: Props) {
  const [step, setStep] = useState(1);
  const [quarterName, setQuarterName] = useState('');
  const [goals, setGoals] = useState<Goals>({
    meetingGoal: 0,
    mmrGoal: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuarterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quarterName.trim()) return;
    setStep(2);
  };

  const handleGoalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goals.meetingGoal <= 0 || goals.mmrGoal <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Create quarter first
      const { data: quarter, error: quarterError } = await supabase
        .from('quarters')
        .insert({
          user_id: user.id,
          name: quarterName.trim(),
          is_active: true
        })
        .select()
        .single();

      if (quarterError) throw quarterError;

      // Then create goals with the quarter_id
      const { error: goalsError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          quarter_id: quarter.id,
          meeting_goal: goals.meetingGoal,
          mmr_goal: goals.mmrGoal
        });

      if (goalsError) throw goalsError;

      // Important: Wait a bit before triggering the state update
      setTimeout(() => {
        onQuarterCreated(quarter.id);
      }, 100);
    } catch (err: any) {
      console.error('Error setting up quarter and goals:', err);
      setError(err.message || 'Failed to create quarter and goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Welcome!</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 ? (
          <>
            <p className="text-gray-600 text-center mb-6">
              Let's start by creating your first quarter
            </p>

            <form onSubmit={handleQuarterSubmit} className="space-y-4">
              <div>
                <label htmlFor="quarterName" className="block text-sm font-medium text-gray-700 mb-1">
                  Quarter Name
                </label>
                <input
                  id="quarterName"
                  type="text"
                  value={quarterName}
                  onChange={(e) => setQuarterName(e.target.value)}
                  placeholder="e.g., Q1 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Next
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-center mb-6">
              Set your goals for {quarterName}
            </p>

            <form onSubmit={handleGoalsSubmit} className="space-y-4">
              <div>
                <label htmlFor="meetingGoal" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Goal
                </label>
                <input
                  id="meetingGoal"
                  type="number"
                  value={goals.meetingGoal || ''}
                  onChange={(e) => setGoals(prev => ({ ...prev, meetingGoal: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label htmlFor="mmrGoal" className="block text-sm font-medium text-gray-700 mb-1">
                  MMR Goal ($)
                </label>
                <input
                  id="mmrGoal"
                  type="number"
                  value={goals.mmrGoal || ''}
                  onChange={(e) => setGoals(prev => ({ ...prev, mmrGoal: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Start Tracking'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}