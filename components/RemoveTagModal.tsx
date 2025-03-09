import { useState } from 'react';

interface RemoveTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (tag: string) => void;
  tags: string[];
}

export default function RemoveTagModal({ isOpen, onClose, onRemove, tags }: RemoveTagModalProps) {
  const tag = tags[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRemove(tag);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="p-2 bg-gray-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-gray-400 text-sm font-mono">remove-tag.sh</div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="font-mono text-green-400 mb-4">$ Are you sure you want to remove tag:</div>
          <div className="bg-black/30 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm px-3 py-1.5 rounded-full font-mono bg-red-500 text-white">
                #{tag}
              </span>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-mono text-sm transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-mono text-sm transition-colors"
            >
              remove
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 