import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Quarter {
  id: string;
  name: string;
  is_active: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onQuarterSelect: (quarterId: string) => void;
  currentQuarterId: string;
}

export function QuartersModal({ isOpen, onClose, onQuarterSelect, currentQuarterId }: Props) {
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuarterName, setNewQuarterName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchQuarters();
    }
  }, [isOpen]);

  const fetchQuarters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quarters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuarters(data || []);
    } catch (error) {
      console.error('Error fetching quarters:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewQuarter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuarterName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Deactivate all quarters
      await supabase
        .from('quarters')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Create new quarter
      const { data, error } = await supabase
        .from('quarters')
        .insert([{
          user_id: user.id,
          name: newQuarterName.trim(),
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchQuarters();
      onQuarterSelect(data.id);
      setNewQuarterName('');
      setShowNameInput(false);
      onClose();
    } catch (error) {
      console.error('Error creating new quarter:', error);
    }
  };

  const selectQuarter = async (quarterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Deactivate all quarters
      await supabase
        .from('quarters')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate selected quarter
      await supabase
        .from('quarters')
        .update({ is_active: true })
        .eq('id', quarterId);

      onQuarterSelect(quarterId);
      onClose();
    } catch (error) {
      console.error('Error selecting quarter:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Quarters</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {showNameInput ? (
          <form onSubmit={createNewQuarter} className="mb-6">
            <input
              type="text"
              value={newQuarterName}
              onChange={(e) => setNewQuarterName(e.target.value)}
              placeholder="Enter quarter name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Quarter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNameInput(false);
                  setNewQuarterName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNameInput(true)}
            className="w-full mb-6 bg-blue-500 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Quarter
          </button>
        )}

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-600">Loading...</div>
          ) : (
            quarters.map((quarter) => (
              <button
                key={quarter.id}
                onClick={() => selectQuarter(quarter.id)}
                className={`w-full p-4 rounded-lg border ${
                  quarter.id === currentQuarterId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                } transition-colors`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <h3 className="font-medium">{quarter.name}</h3>
                    </div>
                  </div>
                  {quarter.is_active && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}