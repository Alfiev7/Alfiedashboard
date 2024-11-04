import React, { useState } from 'react';
import { Target } from 'lucide-react';
import type { Goals } from '../types';

interface Props {
  onGoalsSet: (goals: Goals) => Promise<Goals | null>;
}

export function GoalSetter({ onGoalsSet }: Props) {
  const [meetingGoal, setMeetingGoal] = useState('');
  const [mmrGoal, setMmrGoal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onGoalsSet({
        meetingGoal: Number(meetingGoal),
        mmrGoal: Number(mmrGoal),
      });
    } catch (error) {
      console.error('Error setting goals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <Target className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Set Your Quarterly Goals
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Goal
            </label>
            <input
              type="number"
              value={meetingGoal}
              onChange={(e) => setMeetingGoal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              min="1"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              MMR Goal ($)
            </label>
            <input
              type="number"
              value={mmrGoal}
              onChange={(e) => setMmrGoal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              min="1"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting Goals...' : 'Set Goals'}
          </button>
        </form>
      </div>
    </div>
  );
}