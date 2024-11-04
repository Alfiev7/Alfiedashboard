import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Calendar, Target, LogOut, Clock, Trash2 } from 'lucide-react';
import type { Meeting, Deal, Goals } from '../types';
import { useMeetings, useDeals, useGoals } from '../hooks/useSupabase';
import { MeetingRow } from './MeetingRow';
import { supabase } from '../lib/supabase';
import { QuartersModal } from './QuartersModal';
import { WelcomeModal } from './WelcomeModal';

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [currentQuarterId, setCurrentQuarterId] = useState<string | null>(null);
  const [isQuartersModalOpen, setIsQuartersModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [deletingDealId, setDeletingDealId] = useState<string | null>(null);

  const { 
    meetings, 
    loading: meetingsLoading, 
    addMeeting, 
    updateMeeting,
    deleteMeeting 
  } = useMeetings(currentQuarterId ?? undefined);

  const { 
    deals, 
    loading: dealsLoading, 
    addDeal,
    deleteDeal 
  } = useDeals(currentQuarterId ?? undefined);

  const { goals, loading: goalsLoading } = useGoals(currentQuarterId ?? undefined);

  const [newMeeting, setNewMeeting] = useState({
    contactName: '',
    companyName: '',
    meetingDate: '',
    outcome: 'Scheduled' as const
  });

  const [newDeal, setNewDeal] = useState({
    name: '',
    value: ''
  });

  useEffect(() => {
    checkUserSetup();
  }, []);

  const checkUserSetup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: quarters, error: quartersError } = await supabase
        .from('quarters')
        .select('id, is_active')
        .eq('user_id', user.id);

      if (quartersError) throw quartersError;

      if (!quarters || quarters.length === 0) {
        setShowWelcomeModal(true);
      } else {
        const activeQuarter = quarters.find(q => q.is_active);
        if (activeQuarter) {
          setCurrentQuarterId(activeQuarter.id);
        } else if (quarters.length > 0) {
          // Set the most recent quarter as active
          const { data: mostRecent } = await supabase
            .from('quarters')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (mostRecent) {
            await supabase
              .from('quarters')
              .update({ is_active: true })
              .eq('id', mostRecent.id);

            setCurrentQuarterId(mostRecent.id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking user setup:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleQuarterCreated = (quarterId: string) => {
    setCurrentQuarterId(quarterId);
    setShowWelcomeModal(false);
  };

  const handleAddMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuarterId) return;
    
    if (newMeeting.contactName && newMeeting.companyName && newMeeting.meetingDate) {
      await addMeeting(newMeeting);
      setNewMeeting({
        contactName: '',
        companyName: '',
        meetingDate: '',
        outcome: 'Scheduled'
      });
    }
  };

  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuarterId) return;
    
    if (newDeal.name && newDeal.value) {
      await addDeal({
        name: newDeal.name,
        value: Number(newDeal.value)
      });
      setNewDeal({ name: '', value: '' });
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (deletingDealId === id) {
      await deleteDeal(id);
      setDeletingDealId(null);
    } else {
      setDeletingDealId(id);
      setTimeout(() => setDeletingDealId(null), 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload(); // Force reload after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  if (showWelcomeModal) {
    return <WelcomeModal onQuarterCreated={handleQuarterCreated} />;
  }

  if (!currentQuarterId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-lg font-medium text-gray-600 mb-4">No quarter selected</div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create New Quarter
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const completedMeetings = meetings?.filter(m => m.outcome === 'Completed' || m.outcome === 'Scheduled').length || 0;
  const totalMMR = deals?.reduce((sum, deal) => sum + deal.value, 0) || 0;
  const meetingProgress = goals?.meetingGoal ? (completedMeetings / goals.meetingGoal) * 100 : 0;
  const mmrProgress = goals?.mmrGoal ? (totalMMR / goals.mmrGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-600">👤</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Alfie hopes you have an amazing day!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQuartersModalOpen(true)}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Quarters
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Meetings Goal</h2>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{completedMeetings} / {goals?.meetingGoal || 0} Meetings</span>
                  <span className="text-gray-600">{Math.round(meetingProgress)}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 rounded-full h-2.5 transition-all duration-500"
                    style={{ width: `${Math.min(meetingProgress, 100)}%` }}
                  />
                </div>
              </div>
              <form onSubmit={handleAddMeeting} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={newMeeting.contactName}
                      onChange={(e) => setNewMeeting({ ...newMeeting, contactName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Contact Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={newMeeting.companyName}
                      onChange={(e) => setNewMeeting({ ...newMeeting, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Meeting Date</label>
                    <input
                      type="date"
                      value={newMeeting.meetingDate}
                      onChange={(e) => setNewMeeting({ ...newMeeting, meetingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Outcome</label>
                    <select
                      value={newMeeting.outcome}
                      onChange={(e) => setNewMeeting({ ...newMeeting, outcome: e.target.value as Meeting['outcome'] })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="No show">No show</option>
                      <option value="Rescheduled">Rescheduled</option>
                      <option value="Unqualified">Unqualified</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Add Meeting
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Contact Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {meetings?.map((meeting) => (
                      <MeetingRow
                        key={meeting.id}
                        meeting={meeting}
                        onEdit={updateMeeting}
                        onDelete={deleteMeeting}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💰</span>
              <h2 className="text-xl font-semibold">MMR Goal</h2>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">${totalMMR.toLocaleString()} / ${(goals?.mmrGoal || 0).toLocaleString()}</span>
                <span className="text-gray-600">{Math.round(mmrProgress)}%</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2.5">
                <div
                  className="bg-green-500 rounded-full h-2.5 transition-all duration-500"
                  style={{ width: `${Math.min(mmrProgress, 100)}%` }}
                />
              </div>
            </div>
            <form onSubmit={handleAddDeal} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={newDeal.name}
                  onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Deal Value ($)</label>
                <input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  placeholder="Deal Value"
                  min="0"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <span>💰</span>
                Add Deal
              </button>
            </form>

            <div className="mt-6">
              <h3 className="font-medium mb-4">Recent Deals</h3>
              <div className="space-y-2">
                {deals?.map((deal) => (
                  <div key={deal.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{deal.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">${deal.value.toLocaleString()}</span>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className={`p-1 rounded-full ${
                            deletingDealId === deal.id
                              ? 'bg-red-50 hover:bg-red-100 text-red-600'
                              : 'hover:bg-gray-100 text-gray-500'
                          }`}
                          title={deletingDealId === deal.id ? 'Click again to confirm deletion' : 'Delete deal'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isQuartersModalOpen && (
        <QuartersModal
          isOpen={isQuartersModalOpen}
          onClose={() => setIsQuartersModalOpen(false)}
          onQuarterSelect={setCurrentQuarterId}
          currentQuarterId={currentQuarterId}
        />
      )}
    </div>
  );
}