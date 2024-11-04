import React, { useState } from 'react';
import { Meeting } from '../types';
import { Edit2, Check, X, Trash2 } from 'lucide-react';

interface Props {
  meeting: Meeting;
  onEdit: (id: string, updates: Partial<Meeting>) => void;
  onDelete: (id: string) => void;
}

export function MeetingRow({ meeting, onEdit, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOutcome, setEditedOutcome] = useState(meeting.outcome);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = () => {
    onEdit(meeting.id, { outcome: editedOutcome });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (isDeleting) {
      onDelete(meeting.id);
    } else {
      setIsDeleting(true);
      // Auto-reset delete confirmation after 3 seconds
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const getStatusColor = (outcome: Meeting['outcome']) => {
    switch (outcome) {
      case 'Completed':
        return 'bg-green-50 text-green-700';
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700';
      case 'No show':
        return 'bg-red-50 text-red-700';
      case 'Rescheduled':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4">{meeting.contactName}</td>
      <td className="py-3 px-4 text-gray-600">{meeting.companyName}</td>
      <td className="py-3 px-4 text-gray-600">
        {new Date(meeting.meetingDate).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <select
                value={editedOutcome}
                onChange={(e) => setEditedOutcome(e.target.value as Meeting['outcome'])}
                className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="No show">No show</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Unqualified">Unqualified</option>
              </select>
              <button
                onClick={handleSave}
                className="p-1 rounded-full hover:bg-green-50 text-green-600"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full hover:bg-red-50 text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.outcome)}`}>
                {meeting.outcome}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className={`p-1 rounded-full ${
                  isDeleting 
                    ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                title={isDeleting ? 'Click again to confirm deletion' : 'Delete meeting'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}