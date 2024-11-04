import React, { useState } from 'react';
import { Deal } from '../types';
import { Edit2, Check, X } from 'lucide-react';

interface Props {
  deal: Deal;
  onEdit: (id: string, updates: Partial<Deal>) => void;
}

export function DealRow({ deal, onEdit }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState(deal.price.toString());

  const handleSave = () => {
    const newPrice = Number(editedPrice);
    if (!isNaN(newPrice) && newPrice >= 0) {
      onEdit(deal.id, { price: newPrice });
      setIsEditing(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="table-cell-base font-medium">{deal.dealName}</td>
      <td className="table-cell-base">
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="w-32 pl-7 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="0"
                />
              </div>
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
              <span className="text-gray-900">${deal.price.toLocaleString()}</span>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
      <td className="table-cell-base text-gray-600">
        {new Date(deal.date).toLocaleDateString()}
      </td>
    </tr>
  );
}