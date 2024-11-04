import React, { useState } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { Meeting } from '../types';

interface MeetingItemProps {
  meeting: Meeting;
  onUpdate: (id: string, updates: Partial<Meeting>) => void;
}

export function MeetingItem({ meeting, onUpdate }: MeetingItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMeeting, setEditedMeeting] = useState(meeting);

  const handleSave = () => {
    onUpdate(meeting.id, editedMeeting);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMeeting(meeting);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-gray-50">
        <div className="space-y-3">
          <input
            type="text"
            value={editedMeeting.contactName}
            onChange={(e) => setEditedMeeting({ ...editedMeeting, contactName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Contact Name"
          />
          <input
            type="text"
            value={editedMeeting.companyName}
            onChange={(e) => setEditedMeeting({ ...editedMeeting, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Company Name"
          />
          <select
            value={editedMeeting.outcome}
            onChange={(e) => setEditedMeeting({ ...editedMeeting, outcome: e.target.value as Meeting['outcome'] })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="No show">No show</option>
            <option value="Rescheduled">Rescheduled</option>
            <option value="Unqualified">Unqualified</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 group">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h4 className="font-medium text-gray-900">{meeting.contactName}</h4>
          <p className="text-sm text-gray-600">{meeting.companyName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full
            ${meeting.outcome === 'Completed' ? 'bg-green-100 text-green-800' :
              meeting.outcome === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                meeting.outcome === 'No show' ? 'bg-red-100 text-red-800' :
                  meeting.outcome === 'Rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
            {meeting.outcome}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500">{new Date(meeting.meetingDate).toLocaleDateString()}</p>
    </div>
  );
}